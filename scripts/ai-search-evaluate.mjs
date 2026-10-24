import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config, isDocsUrl, publishedUrls, request, validateConfig } from "./ai-search.mjs";

// This is an offline comparison, not a second production index or scorer.
const suite = JSON.parse(await readFile(new URL("./ai-search-cases.json", import.meta.url), "utf8"));
class MissingArticle extends Error {}
validateConfig(config);
if (suite.cases.length > suite.thresholds.max_queries || suite.thresholds.max_queries > 20) {
  throw new Error("Evaluation exceeds its paid-query budget.");
}

async function download(url) {
  if (!isDocsUrl(url)) throw new Error("Evaluation URL outside approved public documentation.");
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (response.status === 404 || response.status === 410) throw new MissingArticle(`HTTP ${response.status}: ${new URL(url).pathname}`);
  if (!response.ok) throw new Error(`Public documentation HTTP ${response.status}: ${new URL(url).pathname}`);
  const text = await response.text();
  if (Buffer.byteLength(text) > 2_000_000) throw new Error("Public documentation page exceeds evaluation size cap.");
  return text;
}

function databaseBaseline(pages) {
  const value = process.env.AI_SEARCH_BASELINE_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!value) throw new Error("Set AI_SEARCH_BASELINE_DATABASE_URL for the temporary PostgreSQL full-text baseline.");
  const database = new URL(value);
  if (!["postgres:", "postgresql:"].includes(database.protocol)) throw new Error("Baseline database must be PostgreSQL.");
  const env = {
    ...process.env,
    PGHOST: database.hostname, PGPORT: database.port || "5432",
    PGDATABASE: decodeURIComponent(database.pathname.slice(1)),
    PGUSER: decodeURIComponent(database.username), PGPASSWORD: decodeURIComponent(database.password),
    PGCONNECT_TIMEOUT: "10",
    ...(database.searchParams.has("sslmode") ? { PGSSLMODE: database.searchParams.get("sslmode") } : {}),
  };
  const literal = (text) => `'${text.replaceAll("'", "''")}'`;
  const sql = `
    SET standard_conforming_strings = on;
    BEGIN;
    CREATE TEMP TABLE kai_help_evaluation ON COMMIT DROP AS
      SELECT url, to_tsvector('english', text) AS document
      FROM jsonb_to_recordset(${literal(JSON.stringify(pages))}::jsonb) AS pages(url text, text text);
    SELECT json_build_object('query', cases.query, 'urls', COALESCE((
      SELECT json_agg(matches.url) FROM (
        SELECT url FROM kai_help_evaluation
        WHERE document @@ websearch_to_tsquery('english', cases.query)
        ORDER BY ts_rank_cd(document, websearch_to_tsquery('english', cases.query)) DESC, url
        LIMIT 5
      ) AS matches
    ), '[]'::json))
    FROM jsonb_to_recordset(${literal(JSON.stringify(suite.cases))}::jsonb) AS cases(query text);
    ROLLBACK;
  `;
  try {
    return execFileSync("psql", ["-X", "-q", "-A", "-t", "-w", "-v", "ON_ERROR_STOP=1"], {
      env, input: sql, encoding: "utf8", maxBuffer: 20_000_000, stdio: ["pipe", "pipe", "pipe"],
    }).trim().split("\n").map((line) => JSON.parse(line));
  } catch {
    throw new Error("PostgreSQL baseline failed. Check database access and TEMP permission; no credentials logged.");
  }
}

async function main() {
  // Credential/bootstrap work is not part of retrieval latency.
  validateConfig({ ...config, instance: await request(`/${config.instance.id}`) });
  const urls = await publishedUrls();
  const pages = [];
  const sourceErrors = [];
  for (let index = 0; index < urls.length; index += 4) {
    const batch = await Promise.all(urls.slice(index, index + 4).map(async (url) => {
      try {
        return { url, html: await download(url) };
      } catch (error) {
        if (!(error instanceof MissingArticle)) throw error;
        sourceErrors.push({ url, error: error.message });
        return null;
      }
    }));
    pages.push(...batch.filter((page) => page !== null));
  }
  const articles = JSON.parse(execFileSync("python3", [fileURLToPath(new URL("./ai-search-articles.py", import.meta.url))], {
    input: JSON.stringify(pages), encoding: "utf8", maxBuffer: 50_000_000, stdio: ["pipe", "pipe", "pipe"],
  }));
  const baseline = databaseBaseline(articles);
  const results = [];
  let citations = 0;
  let safeCitations = 0;
  for (const item of suite.cases) {
    const eligiblePaths = item.paths.filter((path) => urls.some((url) => new URL(url).pathname === path));
    const started = performance.now();
    const response = await request(`/${config.instance.id}/search`, "POST", {
      query: item.query,
      ai_search_options: {
        cache: { enabled: false }, query_rewrite: { enabled: false }, reranking: { enabled: false },
        retrieval: { max_num_results: 5, retrieval_type: "hybrid", return_on_failure: false },
      },
    });
    const latency = Math.round(performance.now() - started);
    if (!Array.isArray(response.chunks) || response.chunks.length > 5) throw new Error("Invalid retrieval response.");
    const chunks = response.chunks.map((chunk) => {
      if (typeof chunk.text !== "string" || typeof chunk.item?.key !== "string") throw new Error("Malformed retrieval chunk.");
      citations++;
      if (!isDocsUrl(chunk.item.key)) throw new Error("Unsafe citation in retrieval response.");
      safeCitations++;
      if (!urls.includes(chunk.item.key)) throw new Error("Citation absent from published sitemap.");
      return { url: chunk.item.key, excerpt: chunk.text.slice(0, 1200) };
    });
    const hit = (found) => eligiblePaths.length
      ? found.some((url) => eligiblePaths.includes(new URL(url).pathname))
      : found.length === 0;
    const match = baseline.find((value) => value.query === item.query);
    if (!match) throw new Error("Baseline query missing.");
    results.push({
      query: item.query, in_corpus: eligiblePaths.length > 0,
      excluded_placeholder_topic: item.paths.length > 0 && !eligiblePaths.length,
      latency_ms: latency, topic_hit: hit(chunks.map((chunk) => chunk.url)),
      postgres_topic_hit: hit(match.urls), postgres_urls: match.urls, chunks,
    });
  }
  const supported = results.filter((item) => item.in_corpus);
  if (!supported.length) throw new Error("Evaluation has no supported questions in the completed corpus.");
  const latencies = results.map((item) => item.latency_ms).sort((a, b) => a - b);
  const metrics = {
    corpus_pages: articles.length,
    placeholder_pages: articles.filter((page) => page.text.includes("This page is not yet complete.")).length,
    queries: results.length,
    top_five_topic_rate: supported.filter((item) => item.topic_hit).length / supported.length,
    postgres_top_five_topic_rate: supported.filter((item) => item.postgres_topic_hit).length / supported.length,
    safe_citation_rate: citations ? safeCitations / citations : 0,
    excluded_placeholder_topics: results.filter((item) => item.excluded_placeholder_topic).length,
    unsupported_empty: results.filter((item) => !item.in_corpus).every((item) => item.topic_hit),
    p95_latency_ms: latencies[Math.ceil(latencies.length * 0.95) - 1],
    retrieval_list_price_usd: results.length * 0.75 / 1000,
  };
  const passed = !sourceErrors.length && metrics.top_five_topic_rate >= suite.thresholds.top_five_rate &&
    metrics.safe_citation_rate >= suite.thresholds.safe_citation_rate &&
    metrics.p95_latency_ms <= suite.thresholds.p95_latency_ms && metrics.unsupported_empty;
  console.log(JSON.stringify({
    measured_at: new Date().toISOString(), thresholds: suite.thresholds, metrics, source_errors: sourceErrors, passed,
    manual_passage_review_required: true, changed_deleted_page_test_required: true, results,
  }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
