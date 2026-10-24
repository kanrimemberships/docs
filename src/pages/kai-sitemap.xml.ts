import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { corpusUrls, renderSitemap } from "../../scripts/ai-search-corpus.mjs";

export const prerender = true;

export const GET: APIRoute = async () => {
  const urls = corpusUrls(await getCollection("docs"));
  return new Response(renderSitemap(urls, new Date().toISOString()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
