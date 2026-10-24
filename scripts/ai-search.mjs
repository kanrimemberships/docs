import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { corpusSitemap } from "./ai-search-corpus.mjs";

export const config = JSON.parse(await readFile(new URL("./ai-search-config.json", import.meta.url), "utf8"));
const directory = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://docs.kanrimemberships.com";
const root = `https://api.cloudflare.com/client/v4/accounts/${config.account_id}/ai-search/namespaces/${config.namespace}/instances`;
const exclusions = [
  "**/_astro/**", "**/pagefind/**", "**/sitemap*.xml", "**/404", "**/404/", "**/preview/**", "**/drafts/**",
];

export function validateConfig(value) {
  const source = value.instance.source_params;
  const options = source?.web_crawler?.parse_options;
  if (value.account_id !== "a58d11951210d070b5eb3dd16d43d569" ||
      value.namespace !== "default" || value.instance.id !== "kanri-help" ||
      value.instance.source !== new URL(origin).hostname || value.instance.type !== "web-crawler" ||
      value.instance.public_endpoint_params?.enabled !== false ||
      value.instance.index_method?.keyword !== true || value.instance.index_method?.vector !== true ||
      value.instance.cache !== false || value.instance.rewrite_query !== false ||
      value.instance.reranking !== false ||
      JSON.stringify(source?.include_items) !== JSON.stringify([`${origin}/**`]) ||
      JSON.stringify(source?.exclude_items) !== JSON.stringify(exclusions) ||
      source?.web_crawler?.parse_type !== "sitemap" ||
      source?.web_crawler?.discover_options != null ||
      JSON.stringify(options?.specific_sitemaps) !== JSON.stringify([corpusSitemap]) ||
      JSON.stringify(options?.content_selector) !== JSON.stringify([
        { path: `${origin}/**`, selector: ".sl-markdown-content" },
      ]) || options?.use_browser_rendering !== false || options?.include_images !== false ||
      options?.include_headers !== undefined) {
    throw new Error("Unexpected AI Search account, source, index, public endpoint, or crawler configuration.");
  }
}

export function isDocsUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === origin && !url.username && !url.password && !url.search &&
      !/^\/(?:_astro|pagefind|preview|drafts)(?:\/|$)/.test(url.pathname);
  } catch {
    return false;
  }
}

export async function publishedUrls() {
  const read = async (url) => {
    if (!isDocsUrl(url)) throw new Error("Sitemap outside approved public docs origin.");
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Published sitemap HTTP ${response.status}.`);
    const xml = await response.text();
    if (Buffer.byteLength(xml) > 2_000_000) throw new Error("Sitemap exceeds size cap.");
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  };
  const urls = await read(corpusSitemap);
  if (!urls.length || urls.length > 500 || new Set(urls).size !== urls.length ||
      urls.some((url) => !isDocsUrl(url) || !url.endsWith("/") || new URL(url).hash)) {
    throw new Error("Published corpus outside approved source or 500-page limit.");
  }
  return urls;
}

let token;
function authToken() {
  if (token) return token;
  token = process.env.AI_SEARCH_API_TOKEN;
  if (!token && process.env.CI) {
    throw new Error("Set AI_SEARCH_API_TOKEN in CI with AI Search Edit and Run permissions for v19 Corporation.");
  }
  if (!token) {
    const env = { ...process.env };
    delete env.CF_API_TOKEN;
    delete env.CLOUDFLARE_API_TOKEN;
    try {
      const credentials = JSON.parse(execFileSync("wrangler", ["auth", "token", "--json"], {
        cwd: directory, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
      }));
      token = credentials.token;
    } catch {
      throw new Error("Wrangler OAuth token unavailable. Log in locally or set AI_SEARCH_API_TOKEN.");
    }
  }
  if (typeof token !== "string" || !/^[A-Za-z0-9._~-]+$/.test(token)) {
    throw new Error("Invalid AI Search authentication token.");
  }
  return token;
}

export async function request(path = "", method = "GET", body) {
  const response = await fetch(`${root}${path}`, {
    method,
    redirect: "error",
    headers: { Authorization: `Bearer ${authToken()}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(60_000),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`AI Search returned non-JSON HTTP ${response.status}.`);
  }
  if (!response.ok || data.success === false) {
    const codes = (data.errors ?? []).map((error) => error.code).filter((code) => typeof code === "number");
    const messages = (data.errors ?? []).map((error) => String(error.message).replaceAll(authToken(), "[redacted]").slice(0, 500));
    throw new Error(`AI Search HTTP ${response.status}; error codes: ${codes.join(", ") || "unspecified"}; ${messages.join("; ")}`);
  }
  if (!Object.hasOwn(data, "result")) throw new Error("AI Search response missing result.");
  return data.result;
}

const instancePath = `/${config.instance.id}`;

function timestamp(value) {
  if (typeof value !== "string") throw new Error("Missing indexing timestamp.");
  const normalized = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value) ? `${value.replace(" ", "T")}Z` : value;
  const result = Date.parse(normalized);
  if (!Number.isFinite(result)) throw new Error("Invalid indexing timestamp.");
  return result;
}

export function checkHealth(instance, jobs, stats, now, coverage) {
  validateConfig({ ...config, instance });
  if (instance.paused !== false || instance.enable !== true) throw new Error("AI Search is paused or disabled.");
  for (const field of ["completed", "queued", "running", "error", "skipped", "outdated"]) {
    if (!Number.isSafeInteger(stats[field]) || stats[field] < 0) throw new Error(`Invalid indexing count: ${field}.`);
  }
  if (!Array.isArray(jobs) || !jobs.length) throw new Error("No observed indexing jobs.");
  const ordered = [...jobs].sort((a, b) => timestamp(b.started_at) - timestamp(a.started_at));
  if (ordered[0].end_reason != null) throw new Error("Latest indexing job ended abnormally.");
  const successful = ordered.find((job) => job.ended_at && job.end_reason == null);
  if (!successful) throw new Error("No completed successful indexing job.");
  const age = now - timestamp(successful.ended_at);
  if (age < -60_000 || age > 12 * 60 * 60_000) throw new Error("Last successful sync is missing or over 12 hours old.");
  if (ordered[0].ended_at == null && now - timestamp(ordered[0].started_at) > 60 * 60_000) {
    throw new Error("Indexing job has been running for over one hour.");
  }
  if (!stats.completed || stats.queued || stats.running || stats.error || stats.skipped || stats.outdated) {
    throw new Error(`Incomplete index: ${stats.completed} completed, ${stats.queued} queued, ${stats.running} running, ${stats.error} errors, ${stats.skipped} skipped, ${stats.outdated} outdated.`);
  }
  if (!Array.isArray(coverage?.expected) || !Array.isArray(coverage?.indexed) || !coverage.expected.length) {
    throw new Error("Missing published/indexed corpus coverage.");
  }
  const missing = coverage.expected.filter((url) => !coverage.indexed.includes(url));
  const extra = coverage.indexed.filter((url) => !coverage.expected.includes(url));
  if (missing.length || extra.length || coverage.indexed.length !== stats.completed) {
    throw new Error(`Corpus coverage mismatch: ${missing.length} missing, ${extra.length} unexpected; ${coverage.indexed.length} listed versus ${stats.completed} completed.`);
  }
  return { last_successful_sync_at: new Date(timestamp(successful.ended_at)).toISOString(), ...stats };
}

async function indexedUrls() {
  const urls = [];
  for (let page = 1; page <= 10; page++) {
    const items = await request(`${instancePath}/items?status=completed&per_page=50&page=${page}`);
    if (!Array.isArray(items)) throw new Error("Invalid indexed items response.");
    for (const item of items) {
      if (!isDocsUrl(item.key)) throw new Error("Indexed item outside approved public docs.");
      urls.push(item.key);
    }
    if (items.length < 50) break;
  }
  return urls;
}

async function health() {
  const [instance, jobs, stats, expected, indexed] = await Promise.all([
    request(instancePath), request(`${instancePath}/jobs?per_page=50`), request(`${instancePath}/stats`),
    publishedUrls(), indexedUrls(),
  ]);
  return checkHealth(instance, jobs, stats, Date.now(), { expected, indexed });
}

async function waitForJob(id) {
  if (typeof id !== "string" || !/^[a-f0-9-]+$/.test(id)) throw new Error("Missing sync job ID.");
  const deadline = Date.now() + 30 * 60_000;
  while (Date.now() < deadline) {
    const job = await request(`${instancePath}/jobs/${id}`);
    if (job.ended_at) {
      if (job.end_reason != null) throw new Error("Sync job ended abnormally.");
      return health();
    }
    await sleep(45_000);
  }
  throw new Error("Sync still running after 30 minutes; inspect jobs and page errors. Do not assume deployment rolled back.");
}

async function main() {
  validateConfig(config);
  const command = process.argv[2];
  let result;
  switch (command) {
    case "provision": {
      const existing = await request();
      if (!Array.isArray(existing)) throw new Error("Unexpected instance list shape.");
      if (existing.some((item) => item.id === config.instance.id)) {
        throw new Error("kanri-help already exists. Inspect it; provisioning never overwrites existing configuration.");
      }
      result = await request("", "POST", config.instance);
      console.log(JSON.stringify({ id: result.id, source: result.source, created: true }));
      return;
    }
    case "get":
      result = await request(instancePath);
      delete result.created_by;
      delete result.modified_by;
      delete result.token_id;
      break;
    case "check":
      validateConfig({ ...config, instance: await request(instancePath) });
      result = { id: config.instance.id, configuration_verified: true };
      break;
    case "configure": {
      // Never switch an existing index until the deployed corpus is available.
      const urls = await publishedUrls();
      const existing = await request(instancePath);
      if (existing.id !== config.instance.id || existing.type !== "web-crawler" ||
          existing.source !== config.instance.source || existing.public_endpoint_params?.enabled !== false) {
        throw new Error("Refusing to reconfigure an unexpected or public documentation source.");
      }
      const { id, ...settings } = config.instance;
      const updated = await request(instancePath, "PUT", settings);
      validateConfig({ ...config, instance: updated });
      result = { id, configuration_verified: true, corpus_pages: urls.length };
      break;
    }
    case "health":
      result = await health();
      break;
    case "sync":
      result = await request(`${instancePath}/jobs`, "POST");
      console.log(JSON.stringify({ sync_requested: true, ...result }));
      if (process.argv.includes("--wait")) result = await waitForJob(result.id);
      else return;
      break;
    case "jobs":
      result = await request(`${instancePath}/jobs`);
      break;
    case "stats":
      result = await request(`${instancePath}/stats`);
      break;
    case "errors":
      result = await request(`${instancePath}/items?status=error&per_page=50`);
      break;
    default:
      throw new Error("Usage: node scripts/ai-search.mjs provision|configure|get|check|sync [--wait]|health|jobs|stats|errors");
  }
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
