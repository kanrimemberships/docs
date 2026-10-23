import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkHealth, config, isDocsUrl, validateConfig } from "./ai-search.mjs";

test("provisioning stays private and bound to the approved public source", () => {
  validateConfig(config);
  for (const mutate of [
    (value) => { value.account_id = "another-account"; },
    (value) => { value.instance.public_endpoint_params.enabled = true; },
    (value) => { value.instance.source = "https://app.kanrimemberships.com"; },
    (value) => { value.instance.source_params.include_items = ["**"]; },
    (value) => { value.instance.source_params.exclude_items = []; },
    (value) => { value.instance.source_params.web_crawler.discover_options.include_external_links = true; },
    (value) => { value.instance.source_params.web_crawler.discover_options.limit = 100000; },
    (value) => { value.instance.source_params.web_crawler.parse_options.content_selector = []; },
    (value) => { value.instance.source_params.web_crawler.parse_options.include_headers = { Authorization: "secret" }; },
    (value) => { value.instance.rewrite_query = true; },
  ]) {
    const value = structuredClone(config);
    mutate(value);
    assert.throws(() => validateConfig(value));
  }
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
