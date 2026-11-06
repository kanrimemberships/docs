import { readFile } from "node:fs/promises";
import { config, publishedUrls, request, validateConfig } from "./ai-search.mjs";
import { assessPassages, retrievalOptions, validateRetrievalOptions } from "./ai-search-retrieval.mjs";

const suite = JSON.parse(await readFile(new URL("./ai-search-cases.json", import.meta.url), "utf8"));
const mode = process.argv[2] ?? "--compare";
if (process.argv.length > 3 || !["--compare", "--keyword", "--hybrid"].includes(mode)) {
  throw new Error("Usage: node scripts/ai-search-evaluate.mjs [--compare|--keyword|--hybrid]");
}
const modes = mode === "--compare" ? ["keyword", "hybrid"] : [mode.slice(2)];
if (suite.cases.length > suite.thresholds.max_queries || suite.thresholds.max_queries > 24) {
  throw new Error("Evaluation exceeds 24 paid queries per profile.");
}
if (suite.cases.some((item) => item.paths.length && (!item.support?.length ||
    item.support.some((alternatives) => !alternatives.length)))) {
  throw new Error("Every supported question needs explicit answer-bearing passage assertions.");
}

async function main() {
  validateConfig({ ...config, instance: await request(`/${config.instance.id}`) });
  const expected = await publishedUrls();
  const response = await fetch("https://docs.kanrimemberships.com/kai-passages.json", {
    redirect: "error", signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error("Publish the section corpus before evaluating retrieval.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "", size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) throw new Error("Passage manifest exceeds limit.");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally { await reader.cancel(); reader.releaseLock(); }
  const manifest = JSON.parse(text);
  const expectedSources = new Set(expected);
  if (manifest.version !== 1 || !Array.isArray(manifest.passages) ||
      typeof manifest.built_at !== "string" || !Number.isFinite(Date.parse(manifest.built_at)) ||
      Date.parse(manifest.built_at) > Date.now() + 60_000 ||
      manifest.passages.length !== expected.length ||
      new Set(manifest.passages.map((passage) => passage?.source_url)).size !== expected.length ||
      manifest.passages.some((passage) => !expectedSources.has(passage?.source_url) ||
        typeof passage.url !== "string" || !/^https:\/\/docs\.kanrimemberships\.com\/(?:[a-z0-9-]+\/)+$/.test(passage.url) ||
        passage.url.startsWith("https://docs.kanrimemberships.com/kai-passages/") ||
        typeof passage.doc_title !== "string" || !passage.doc_title.trim() ||
        (passage.anchor !== null && (typeof passage.anchor !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(passage.anchor))) ||
        typeof passage.excerpt !== "string" || !passage.excerpt.trim() || [...passage.excerpt].length > 2000 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(passage.excerpt))) {
    throw new Error("Published passage manifest and crawler sitemap disagree.");
  }
  const sources = new Map(manifest.passages.map((passage) => [passage.source_url, passage]));
  const profiles = [];
  for (const type of modes) {
    const options = structuredClone(retrievalOptions);
    options.retrieval.retrieval_type = type;
    validateRetrievalOptions(options);
    const results = [];
    for (const item of suite.cases) {
      const start = performance.now();
      try {
        const found = await request(`/${config.instance.id}/search`, "POST", {
          query: item.query, ai_search_options: options,
        });
        if (found.query_kind !== "text" || found.partial || found.success === false ||
            (found.errors !== undefined && (!Array.isArray(found.errors) || found.errors.length)) ||
            !Array.isArray(found.chunks) || found.chunks.length > 20) {
          throw new Error("Invalid or partial provider response");
        }
        const unique = new Map();
        for (const chunk of found.chunks) {
          const passage = sources.get(chunk.item?.key);
          const score = chunk.scoring_details?.reranking_score;
          if (chunk.type !== "text" || !passage || !Number.isFinite(score) || score < 0 || score > 1) {
            throw new Error("Unverified provider source or score");
          }
          if (score >= options.reranking.match_threshold && (!unique.has(passage.source_url) ||
              unique.get(passage.source_url).score < score)) {
            unique.set(passage.source_url, { ...passage, score });
          }
        }
        const passages = [...unique.values()].sort((a, b) => b.score - a.score).slice(0, 5);
        results.push({
          query: item.query, ...assessPassages(item, passages),
          supported: item.paths.length > 0, latency_ms: Math.round(performance.now() - start),
          passages: passages.map(({ doc_title, section, url, anchor, excerpt, score }) =>
            ({ doc_title, section, url, anchor, excerpt, score })),
        });
      } catch {
        // Never print provider responses, credentials or sensitive operational details.
        results.push({ query: item.query, supported: item.paths.length > 0,
          error: "retrieval_failed", topic_hit: false, passage_hit: false,
          latency_ms: Math.round(performance.now() - start), passages: [] });
      }
    }
    const supported = results.filter((item) => item.supported);
    const negatives = results.filter((item) => !item.supported);
    const latency = results.map((item) => item.latency_ms).sort((a, b) => a - b);
    const metrics = {
      topic_rate: supported.filter((item) => item.topic_hit).length / supported.length,
      passage_rate: supported.filter((item) => item.passage_hit).length / supported.length,
      available_rate: results.filter((item) => !item.error).length / results.length,
      unsupported_empty: negatives.every((item) => !item.error && item.passages.length === 0),
      p95_latency_ms: latency[Math.ceil(latency.length * 0.95) - 1],
    };
    const passed = metrics.topic_rate >= suite.thresholds.top_five_rate &&
      metrics.passage_rate >= suite.thresholds.passage_rate && metrics.available_rate === 1 &&
      metrics.unsupported_empty && metrics.p95_latency_ms <= suite.thresholds.p95_latency_ms;
    profiles.push({ type, options, metrics, passed, results });
  }
  console.log(JSON.stringify({
    measured_at: new Date().toISOString(), corpus_built_at: manifest.built_at,
    indexed_passages: expected.length, queries: profiles.length * suite.cases.length,
    profiles, manual_passage_review_required: true,
    deployment_automatically_changed: false,
  }, null, 2));
  if (!profiles.every((profile) => profile.passed)) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
