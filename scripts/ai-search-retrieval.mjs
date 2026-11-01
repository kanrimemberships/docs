import { readFile } from "node:fs/promises";

export const retrievalOptions = JSON.parse(await readFile(new URL("./ai-search-retrieval.json", import.meta.url), "utf8"));

export function validateRetrievalOptions(options) {
  if (options.cache?.enabled !== false || options.query_rewrite?.enabled !== false ||
      options.reranking?.enabled !== true || options.reranking?.model !== "@cf/baai/bge-reranker-base" ||
      options.reranking?.match_threshold !== 0.5 ||
      options.retrieval?.retrieval_type !== "keyword" || options.retrieval?.keyword_match_mode !== "or" ||
      options.retrieval?.max_num_results !== 5 || options.retrieval?.return_on_failure !== false) {
    throw new Error("Unexpected documentation retrieval mode, model, limits or failure policy.");
  }
}

export function summarizeEvaluation(results) {
  const supported = results.filter((item) => item.in_corpus);
  const unsupported = results.filter((item) => item.explicitly_unsupported);
  if (!supported.length || !unsupported.length) throw new Error("Evaluation needs supported and unsupported questions.");
  const latencies = results.map((item) => item.latency_ms).sort((a, b) => a - b);
  return {
    supported_questions: supported.length,
    unsupported_questions: unsupported.length,
    top_five_topic_rate: supported.filter((item) => item.topic_hit).length / supported.length,
    postgres_top_five_topic_rate: supported.filter((item) => item.postgres_topic_hit).length / supported.length,
    excluded_placeholder_topics: results.filter((item) => item.excluded_placeholder_topic).length,
    excluded_topics_with_related_results: results.filter((item) => item.excluded_placeholder_topic && item.chunks.length).length,
    unsupported_empty: unsupported.every((item) => !item.chunks.length),
    p95_latency_ms: latencies[Math.ceil(latencies.length * 0.95) - 1],
  };
}
