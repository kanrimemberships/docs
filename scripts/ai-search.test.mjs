import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkHealth, config, isDocsUrl, searchDocumentation, validateConfig } from "./ai-search.mjs";
import { corpusUrls, renderSitemap } from "./ai-search-corpus.mjs";
import { assessPassages, retrievalOptions, summarizeEvaluation, validateRetrievalOptions } from "./ai-search-retrieval.mjs";

test("provisioning stays private and bound to the approved public source", () => {
  validateConfig(config);
  for (const mutate of [
    (value) => { value.account_id = "another-account"; },
    (value) => { value.instance.public_endpoint_params.enabled = true; },
    (value) => { value.instance.source = "https://app.kanrimemberships.com"; },
    (value) => { value.instance.source_params.include_items = ["**"]; },
    (value) => { value.instance.source_params.exclude_items = []; },
    (value) => { value.instance.source_params.web_crawler.parse_type = "discover"; },
    (value) => { value.instance.source_params.web_crawler.parse_options.specific_sitemaps = ["https://example.com/sitemap.xml"]; },
    (value) => { value.instance.source_params.web_crawler.parse_options.content_selector = []; },
    (value) => { value.instance.source_params.web_crawler.parse_options.include_headers = { Authorization: "secret" }; },
    (value) => { value.instance.rewrite_query = true; },
  ]) {
    const value = structuredClone(config);
    mutate(value);
    assert.throws(() => validateConfig(value));
  }
});

test("retrieval profile preserves explicit failures and calibrated no-match settings", () => {
  validateRetrievalOptions(retrievalOptions);
  for (const mutate of [
    (value) => { value.cache.enabled = true; },
    (value) => { value.query_rewrite.enabled = true; },
    (value) => { value.reranking.enabled = false; },
    (value) => { value.reranking.match_threshold = 0; },
    (value) => { value.retrieval.return_on_failure = true; },
    (value) => { value.retrieval.max_num_results = 50; },
  ]) {
    const value = structuredClone(retrievalOptions);
    mutate(value);
    assert.throws(() => validateRetrievalOptions(value));
  }
});

test("search rejects invalid queries before contacting provider", async () => {
  for (const query of ["", "   ", "a".repeat(301), "query\nprivate context", null, 123]) {
    await assert.rejects(searchDocumentation(query), /Documentation query/);
  }
});

test("lead evaluation requires supporting creation instructions, not merely the right page", () => {
  const item = { paths: ["/members/add-member/"], anchors: ["create-a-profile"], support: [["lead"], ["choose"]] };
  const passage = { url: "https://docs.kanrimemberships.com/members/add-member/", anchor: "create-a-profile", excerpt: "Click New Member. Choose Lead." };
  assert.equal(assessPassages(item, [passage]).passage_hit, true);
  assert.deepEqual(assessPassages(item, [{ ...passage, excerpt: "Members have numbers." }]),
    { topic_hit: true, passage_hit: false });
  assert.equal(assessPassages(item, [{ ...passage, anchor: "what-happens-after-you-save" }]).passage_hit, false);
});

test("evaluation suite checks passage support for every supported question", async () => {
  const { readFile } = await import("node:fs/promises");
  const suite = JSON.parse(await readFile(new URL("./ai-search-cases.json", import.meta.url), "utf8"));
  for (const item of suite.cases.filter((item) => item.paths.length)) {
    assert.ok(item.support?.length, item.query);
    assert.ok(item.support.every((group) => group.length && group.every((phrase) => phrase.trim())), item.query);
  }
});

test("no-match scoring distinguishes unrelated questions from excluded guides with related references", () => {
  const supported = { in_corpus: true, explicitly_unsupported: false, topic_hit: true, postgres_topic_hit: true, latency_ms: 100, chunks: [{}] };
  const excluded = { in_corpus: false, explicitly_unsupported: false, excluded_placeholder_topic: true, latency_ms: 200, chunks: [{}] };
  const unrelated = { in_corpus: false, explicitly_unsupported: true, latency_ms: 300, chunks: [] };
  const summary = summarizeEvaluation([supported, excluded, unrelated]);
  assert.equal(summary.unsupported_empty, true);
  assert.equal(summary.excluded_topics_with_related_results, 1);
  assert.equal(summary.supported_questions, 1);
  assert.equal(summary.top_five_topic_rate, 1);
  assert.equal(summary.p95_latency_ms, 300);
  assert.equal(summarizeEvaluation([supported, { ...unrelated, chunks: [{}] }]).unsupported_empty, false);
  assert.throws(() => summarizeEvaluation([supported, excluded]));
});

test("Kai sitemap includes completed guides only, independently of navigation and SEO sitemap", () => {
  const entry = (id, body, data = {}) => ({ id, body, data });
  const entries = [
    entry("members/add-member", "## Add a member\n1. Click New Member."),
    entry("workflows/publish-and-enable", "Publish your draft."),
    entry("reports/attendance/grades", ":::note[Guide coming soon]\nPlanned topics\n:::"),
    entry("old", ":::caution[Work in progress]\nNot complete.\n:::"),
    entry("planned", ":::caution[In progress]\nBeing planned.\n:::"),
    entry("index", "Landing page", { template: "splash" }),
    entry("draft", "Finished text", { draft: true }),
    entry("404", "Not found"),
  ];
  const urls = corpusUrls(entries);
  assert.deepEqual(urls, [
    "https://docs.kanrimemberships.com/members/add-member/",
    "https://docs.kanrimemberships.com/workflows/publish-and-enable/",
  ]);
  const xml = renderSitemap(urls, "2026-10-24T00:00:00.000Z");
  assert.equal((xml.match(/<lastmod>/g) ?? []).length, 2);
  assert.ok(xml.includes("<loc>https://docs.kanrimemberships.com/workflows/publish-and-enable/</loc>"));
  assert.throws(() => corpusUrls([entry("missing", "")]));
  assert.throws(() => corpusUrls([entry("a", "Text"), entry("a", "Text")]));
  assert.throws(() => corpusUrls([entry("../private", "Text")]));
  assert.throws(() => corpusUrls([entry("stub", ":::note[Guide coming soon]\n:::")]));
  assert.throws(() => renderSitemap(urls, "not a date"));
});

test("offline baseline extracts article text without navigation and handles nested and void tags", () => {
  const article = fileURLToPath(new URL("./ai-search-articles.py", import.meta.url));
  const parse = (html) => JSON.parse(execFileSync("python3", [article], {
    input: JSON.stringify([{ url: "https://docs.kanrimemberships.com/example/", html }]),
    encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  }));
  const result = parse('<title>Example</title><nav>Private navigation</nav><div class="sl-markdown-content"><p>Member &amp; subscription</p><div>Nested<br> text<img src="x"></div><script>ignored()</script></div><footer>Next page</footer>');
  assert.equal(result[0].text, "Example Member & subscription Nested text");
  assert.throws(() => parse("<main>No matching article</main>"));
  assert.throws(() => parse('<div class="sl-markdown-content">One</div><div class="sl-markdown-content">Two</div>'));
});

test("health rejects stale, paused, failed, partial, and malformed indexing states", () => {
  const now = Date.parse("2026-10-23T02:00:00Z");
  const instance = { ...structuredClone(config.instance), paused: false, enable: true };
  const jobs = [{ started_at: "2026-10-23 00:18:35", ended_at: "2026-10-23 00:45:29", end_reason: null }];
  const stats = { completed: 2, queued: 0, running: 0, error: 0, skipped: 0, outdated: 0 };
  const urls = ["https://docs.kanrimemberships.com/a/", "https://docs.kanrimemberships.com/b/"];
  const coverage = { expected: urls, indexed: urls };
  assert.equal(checkHealth(instance, jobs, stats, now, coverage).last_successful_sync_at, "2026-10-23T00:45:29.000Z");
  assert.throws(() => checkHealth({ ...instance, paused: true }, jobs, stats, now, coverage));
  assert.throws(() => checkHealth(instance, [], stats, now, coverage));
  assert.throws(() => checkHealth(instance, [{ ...jobs[0], end_reason: "failed" }], stats, now, coverage));
  assert.throws(() => checkHealth(instance, jobs, stats, now + 13 * 60 * 60_000, coverage));
  for (const value of [{ error: 1 }, { skipped: 1 }, { outdated: 1 }, { queued: 1 }, { running: 1 }, { completed: 0 }, { completed: undefined }]) {
    assert.throws(() => checkHealth(instance, jobs, { ...stats, ...value }, now, coverage));
  }
  assert.throws(() => checkHealth(instance, [{ started_at: "bad", ended_at: "bad" }], stats, now, coverage));
  assert.throws(() => checkHealth(instance, jobs, { ...stats, completed: 1 }, now, { expected: urls, indexed: urls.slice(0, 1) }));
  assert.throws(() => checkHealth(instance, jobs, stats, now, { expected: urls, indexed: [...urls, "https://docs.kanrimemberships.com/extra/"] }));
});

test("evaluation citations cannot leave public docs or contain private query strings", () => {
  assert.equal(isDocsUrl("https://docs.kanrimemberships.com/members/add-member/"), true);
  for (const url of [
    "https://app.kanrimemberships.com/members/",
    "https://docs.kanrimemberships.com.attacker.test/",
    "http://docs.kanrimemberships.com/members/",
    "https://name:password@docs.kanrimemberships.com/",
    "https://docs.kanrimemberships.com/members/?email=private",
    "https://docs.kanrimemberships.com/preview/example/",
    "/members/",
    "not a URL",
  ]) {
    assert.equal(isDocsUrl(url), false, url);
  }
});
