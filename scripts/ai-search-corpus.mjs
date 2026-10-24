export const docsOrigin = "https://docs.kanrimemberships.com";
export const corpusSitemap = `${docsOrigin}/kai-sitemap.xml`;

export function corpusUrls(entries) {
  const urls = entries.filter((entry) => {
    if (entry.data.draft || entry.data.template === "splash") return false;
    if (typeof entry.body !== "string" || !entry.body.trim()) {
      throw new Error(`Missing documentation body: ${entry.id}`);
    }
    return !/^:::\s*(?:note|tip|caution|danger)\[(?:Guide coming soon|Work in progress|In progress)\]\s*$/mi.test(entry.body);
  }).map((entry) => {
    const slug = entry.id === "index" ? "" : entry.id;
    if (!slug || slug === "404") return null;
    const url = new URL(`/${slug.replace(/\/$/, "")}/`, docsOrigin);
    if (url.origin !== docsOrigin || url.search || url.hash || url.pathname !== `/${slug.replace(/\/$/, "")}/` ||
        /^\/(?:_astro|pagefind|preview|drafts)(?:\/|$)/.test(url.pathname)) {
      throw new Error(`Invalid documentation slug: ${entry.id}`);
    }
    return url.href;
  }).filter((url) => url !== null).sort();
  if (!urls.length || urls.length > 500 || new Set(urls).size !== urls.length) {
    throw new Error("Kai corpus must contain 1-500 distinct completed documentation pages.");
  }
  return urls;
}

export function renderSitemap(urls, modifiedAt) {
  if (!Number.isFinite(Date.parse(modifiedAt))) throw new Error("Invalid corpus build timestamp.");
  const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    urls.map((url) => `  <url><loc>${escape(url)}</loc><lastmod>${escape(modifiedAt)}</lastmod></url>`).join("\n")
  }\n</urlset>\n`;
}
