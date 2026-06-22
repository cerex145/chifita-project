import { XMLParser } from "fast-xml-parser";
import { prisma } from "../db";

type NewsDataArticle = {
  title?: string;
  description?: string;
  link?: string;
  image_url?: string | null;
  source_id?: string;
  source_name?: string;
  pubDate?: string;
};

type GdeltArticle = {
  title?: string;
  url?: string;
  seendate?: string;
  socialimage?: string;
  domain?: string;
  sourcecountry?: string;
  language?: string;
};

type GoogleNewsRssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  source?: string | { "#text"?: string };
};

type BingNewsRssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  "News:Source"?: string;
  "News:Image"?: string;
};

type ArticleMetadata = {
  title: string | null;
  description: string | null;
  excerpt: string | null;
  imageUrl: string | null;
};

const fallbackNews = [
  {
    title: "BCRP mantiene foco en inflacion y expectativas economicas",
    description: "Resumen demo para mostrar la seccion de noticias economicas si el proveedor publico limita temporalmente las consultas.",
    url: "https://example.com/noticias/bcrp-inflacion",
    imageUrl: null,
    source: "ChiFacademy Demo",
    publishedAt: new Date(),
  },
  {
    title: "Mercados atentos a senales de crecimiento regional",
    description: "Noticia economica demo para validar cards, paginacion y enlaces externos.",
    url: "https://example.com/noticias/mercados-crecimiento",
    imageUrl: null,
    source: "ChiFacademy Demo",
    publishedAt: new Date(),
  },
];

let lastPublicSyncAttempt = 0;
const publicSyncCooldownMs = 30_000;

export async function syncEconomicNews() {
  const provider = getNewsProvider();

  if (provider === "newsdata") {
    return syncNewsData();
  }

  if (provider === "google-news") {
    return syncGoogleNews();
  }

  if (provider === "bing-news") {
    return syncBingNews();
  }

  try {
    return await syncGdeltNews();
  } catch (error) {
    const existingCount = await prisma.newsArticle.count();

    if (existingCount === 0) {
      await upsertFallbackNews();
      return {
        inserted: fallbackNews.length,
        source: "demo",
        configured: true,
        error: error instanceof Error ? error.message : "GDELT request failed",
      };
    }

    throw error;
  }
}

export async function syncPublicNewsIfNeeded() {
  const provider = getNewsProvider();
  if (provider !== "gdelt" && provider !== "google-news" && provider !== "bing-news") return null;

  const total = await prisma.newsArticle.count();
  const demoCount = await prisma.newsArticle.count({
    where: { source: "ChiFacademy Demo" },
  });

  if (total > 0 && total !== demoCount) return null;

  const now = Date.now();
  if (now - lastPublicSyncAttempt < publicSyncCooldownMs) return null;

  lastPublicSyncAttempt = now;
  return syncEconomicNews();
}

export function getNewsApiStatus() {
  const provider = getNewsProvider();

  return {
    provider:
      provider === "newsdata"
        ? "NewsData.io"
        : provider === "gdelt"
          ? "GDELT DOC API"
          : provider === "google-news"
            ? "Google News RSS"
            : "Bing News RSS",
    configured: provider === "gdelt" || provider === "google-news" || provider === "bing-news" || Boolean(getNewsDataApiKey()),
    mode: provider === "gdelt" || provider === "google-news" || provider === "bing-news" ? "live-public" : getNewsDataApiKey() ? "live" : "missing-key",
    requiredEnv: provider === "newsdata" ? "NEWSDATA_API_KEY" : null,
  };
}

async function syncBingNews() {
  const url = new URL("https://www.bing.com/news/search");
  url.searchParams.set("q", "economia Peru BCRP inflacion tipo de cambio finanzas");
  url.searchParams.set("format", "rss");
  url.searchParams.set("setlang", "es-PE");
  url.searchParams.set("cc", "PE");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ChiFacademy/1.0 (local development)",
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Bing News RSS request failed: ${response.status} ${text.slice(0, 160)}`);
  }

  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "#text" });
  const payload = parser.parse(text) as { rss?: { channel?: { item?: BingNewsRssItem | BingNewsRssItem[] } } };
  const rawItems = payload.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  let upserted = 0;
  const syncedUrls: string[] = [];

  for (const item of items.slice(0, 25)) {
    if (!item.title || !item.link) continue;

    const source = decodeHtmlEntities(item["News:Source"] ?? "Bing News");
    const originalUrl = extractBingOriginalUrl(item.link);
    const metadata = await fetchArticleMetadata(originalUrl);
    const title = chooseArticleTitle(item.title, metadata.title);
    const description = buildArticleDescription({
      rssDescription: item.description,
      metadataDescription: metadata.description,
      excerpt: metadata.excerpt,
    });
    const imageUrl = normalizeNewsImageUrl(item["News:Image"]) ?? metadata.imageUrl;
    if (isBlockedNewsSource(source, originalUrl)) continue;
    syncedUrls.push(originalUrl);

    await prisma.newsArticle.upsert({
      where: { url: originalUrl },
      create: {
        title,
        description,
        url: originalUrl,
        imageUrl,
        source,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      },
      update: {
        title,
        description,
        imageUrl,
        source,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      },
    });
    upserted += 1;
  }

  if (upserted > 0) {
    await deleteFallbackNews();
    await deleteStalePublicNews(syncedUrls);
  }

  return { inserted: upserted, source: "bing-news", configured: true };
}

async function syncGoogleNews() {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", '("economia" OR "economia peruana" OR BCRP OR inflacion OR "tipo de cambio" OR finanzas OR "Banco Mundial") Peru');
  url.searchParams.set("hl", "es-419");
  url.searchParams.set("gl", "PE");
  url.searchParams.set("ceid", "PE:es-419");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ChiFacademy/1.0 (local development)",
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Google News RSS request failed: ${response.status} ${text.slice(0, 160)}`);
  }

  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "#text" });
  const payload = parser.parse(text) as { rss?: { channel?: { item?: GoogleNewsRssItem | GoogleNewsRssItem[] } } };
  const rawItems = payload.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  let upserted = 0;
  const syncedUrls: string[] = [];

  for (const item of items.slice(0, 25)) {
    if (!item.title || !item.link) continue;
    const source = typeof item.source === "string" ? item.source : item.source?.["#text"];
    if (isBlockedNewsSource(source, item.link)) continue;
    syncedUrls.push(item.link);

    await prisma.newsArticle.upsert({
      where: { url: item.link },
      create: {
        title: item.title,
        description: cleanRssDescription(item.description),
        url: item.link,
        imageUrl: null,
        source: source ?? "Google News",
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      },
      update: {
        title: item.title,
        description: cleanRssDescription(item.description),
        imageUrl: null,
        source: source ?? "Google News",
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      },
    });
    upserted += 1;
  }

  if (upserted > 0) {
    await deleteFallbackNews();
    await deleteStalePublicNews(syncedUrls);
  }

  return { inserted: upserted, source: "google-news", configured: true };
}

async function syncGdeltNews() {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", '(economy OR economic OR inflation OR "central bank" OR BCRP OR GDP OR employment OR finance) sourcelang:Spanish');
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "25");
  url.searchParams.set("sort", "HybridRel");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ChiFacademy/1.0 (local development)",
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`GDELT request failed: ${response.status} ${text.slice(0, 160)}`);
  }

  const payload = JSON.parse(text) as { articles?: GdeltArticle[] };
  const articles = payload.articles ?? [];
  let upserted = 0;

  for (const article of articles) {
    if (!article.title || !article.url) continue;

    await prisma.newsArticle.upsert({
      where: { url: article.url },
      create: {
        title: article.title,
        description: `Fuente: ${article.domain ?? "GDELT"}`,
        url: article.url,
        imageUrl: article.socialimage || null,
        source: article.domain ?? "GDELT",
        publishedAt: parseGdeltDate(article.seendate),
      },
      update: {
        title: article.title,
        description: `Fuente: ${article.domain ?? "GDELT"}`,
        imageUrl: article.socialimage || null,
        source: article.domain ?? "GDELT",
        publishedAt: parseGdeltDate(article.seendate),
      },
    });
    upserted += 1;
  }

  if (upserted > 0) {
    await deleteFallbackNews();
  }

  return { inserted: upserted, source: "gdelt", configured: true };
}

async function syncNewsData() {
  const apiKey = getNewsDataApiKey();

  if (!apiKey) {
    throw new Error("NEWSDATA_API_KEY is required when NEWS_PROVIDER=newsdata");
  }

  const url = new URL("https://newsdata.io/api/1/latest");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("category", "business");
  url.searchParams.set("language", "es");
  url.searchParams.set("country", "pe");

  const response = await fetch(url);
  const payload = (await response.json()) as { status?: string; results?: NewsDataArticle[]; message?: string };

  if (!response.ok || payload.status === "error") {
    throw new Error(payload.message ?? "NewsData request failed");
  }

  const articles = payload.results ?? [];
  let upserted = 0;

  for (const article of articles) {
    if (!article.title || !article.link) continue;

    await prisma.newsArticle.upsert({
      where: { url: article.link },
      create: {
        title: article.title,
        description: article.description ?? null,
        url: article.link,
        imageUrl: article.image_url ?? null,
        source: article.source_name ?? article.source_id ?? "NewsData.io",
        publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
      },
      update: {
        title: article.title,
        description: article.description ?? null,
        imageUrl: article.image_url ?? null,
        source: article.source_name ?? article.source_id ?? "NewsData.io",
        publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
      },
    });
    upserted += 1;
  }

  return { inserted: upserted, source: "newsdata", configured: true };
}

async function upsertFallbackNews() {
  for (const article of fallbackNews) {
    await prisma.newsArticle.upsert({
      where: { url: article.url },
      create: article,
      update: article,
    });
  }
}

async function deleteFallbackNews() {
  await prisma.newsArticle.deleteMany({
    where: { source: "ChiFacademy Demo" },
  });
}

async function deleteStalePublicNews(currentUrls: string[]) {
  await prisma.newsArticle.deleteMany({
    where: {
      source: { not: "ChiFacademy Demo" },
      url: { notIn: currentUrls },
    },
  });
}

function getNewsProvider() {
  const provider = process.env.NEWS_PROVIDER?.trim().toLowerCase();
  if (provider === "newsdata") return "newsdata";
  if (provider === "gdelt") return "gdelt";
  if (provider === "google-news") return "google-news";
  return "bing-news";
}

function getNewsDataApiKey() {
  const value = process.env.NEWSDATA_API_KEY?.trim();
  return value || null;
}

function parseGdeltDate(value?: string) {
  if (!value) return new Date();
  const normalized = value.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function cleanRssDescription(value?: string) {
  if (!value) return null;

  const text = decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function extractBingOriginalUrl(value: string) {
  try {
    const parsed = new URL(value);
    const originalUrl = parsed.searchParams.get("url");
    return originalUrl ? decodeURIComponent(originalUrl) : value;
  } catch {
    return value;
  }
}

function normalizeNewsImageUrl(value?: string) {
  if (!value) return null;
  return decodeHtmlEntities(value).replace(/^http:\/\/www\.bing\.com/i, "https://www.bing.com");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&iquest;/g, "¿")
    .replace(/&iexcl;/g, "¡")
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .trim();
}

async function fetchArticleMetadata(articleUrl: string): Promise<ArticleMetadata> {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChiFacademy/1.0)",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return emptyArticleMetadata();

    const html = await response.text();
    const imageUrl = matchMetaContent(html, "og:image") ?? matchMetaContent(html, "twitter:image") ?? matchMetaContent(html, "twitter:image:src");

    return {
      title: cleanPlainText(matchMetaContent(html, "og:title") ?? matchMetaContent(html, "twitter:title") ?? matchHtmlTitle(html)),
      description: cleanPlainText(
        matchMetaContent(html, "description") ??
          matchMetaContent(html, "og:description") ??
          matchMetaContent(html, "twitter:description") ??
          matchJsonLdDescription(html),
      ),
      excerpt: extractArticleExcerpt(html),
      imageUrl: imageUrl ? new URL(decodeHtmlEntities(imageUrl), articleUrl).toString() : null,
    };
  } catch {
    return emptyArticleMetadata();
  }
}

function matchMetaContent(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const propertyFirst = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)`, "i");
  const contentFirst = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i");
  return html.match(propertyFirst)?.[1] ?? html.match(contentFirst)?.[1] ?? null;
}

function matchHtmlTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null;
}

function matchJsonLdDescription(html: string) {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];

  for (const script of scripts) {
    const json = script.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();

    try {
      const parsed = JSON.parse(json) as unknown;
      const description = findJsonLdField(parsed, "description");
      if (description) return description;
    } catch {
      continue;
    }
  }

  return null;
}

function findJsonLdField(value: unknown, field: string): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJsonLdField(item, field);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  const directValue = record[field];

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue;
  }

  for (const nestedValue of Object.values(record)) {
    const found = findJsonLdField(nestedValue, field);
    if (found) return found;
  }

  return null;
}

function extractArticleExcerpt(html: string) {
  const paragraphs = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? [];
  const cleaned = paragraphs
    .map((paragraph) => cleanPlainText(paragraph))
    .filter((paragraph): paragraph is string => Boolean(paragraph && paragraph.length >= 80))
    .slice(0, 2);

  if (cleaned.length === 0) return null;

  return clampText(cleaned.join("\n\n"), 700);
}

function buildArticleDescription({
  rssDescription,
  metadataDescription,
  excerpt,
}: {
  rssDescription?: string;
  metadataDescription: string | null;
  excerpt: string | null;
}) {
  const candidates = [metadataDescription, excerpt, cleanRssDescription(rssDescription)]
    .map((candidate) => cleanPlainText(candidate))
    .filter((candidate): candidate is string => Boolean(candidate && candidate.length > 0));

  if (candidates.length === 0) return null;

  const bestDescription = candidates.sort((a, b) => b.length - a.length)[0];
  return clampText(bestDescription, 900);
}

function chooseArticleTitle(rssTitle: string, metadataTitle: string | null) {
  const cleanedRssTitle = cleanPlainText(rssTitle) ?? decodeHtmlEntities(rssTitle);
  const cleanedMetadataTitle = cleanPlainText(metadataTitle);

  if (cleanedMetadataTitle && cleanedMetadataTitle.length >= 20 && cleanedMetadataTitle.length <= 180) {
    return cleanedMetadataTitle;
  }

  return dedupeRepeatedTitle(cleanedRssTitle);
}

function dedupeRepeatedTitle(value: string) {
  const midpoint = Math.floor(value.length / 2);
  const firstHalf = value.slice(0, midpoint).trim();
  const secondHalf = value.slice(midpoint).trim();

  if (firstHalf.length > 30 && secondHalf.startsWith(firstHalf.slice(0, 30))) {
    return firstHalf;
  }

  const repeatedSentence = value.match(/^(.{35,}?[.?!])\s+\1/i);
  return repeatedSentence?.[1] ?? value;
}

function cleanPlainText(value?: string | null) {
  if (!value) return null;

  const text = decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  const clipped = value.slice(0, maxLength);
  const lastSentence = Math.max(clipped.lastIndexOf(". "), clipped.lastIndexOf("? "), clipped.lastIndexOf("! "));

  if (lastSentence > maxLength * 0.55) {
    return clipped.slice(0, lastSentence + 1).trim();
  }

  return `${clipped.replace(/\s+\S*$/, "").trim()}...`;
}

function emptyArticleMetadata(): ArticleMetadata {
  return {
    title: null,
    description: null,
    excerpt: null,
    imageUrl: null,
  };
}

function isBlockedNewsSource(source?: string, url?: string) {
  const value = `${source ?? ""} ${url ?? ""}`.toLowerCase();
  return ["facebook.com", "youtube.com", "tiktok.com", "instagram.com", "x.com", "twitter.com"].some((blocked) => value.includes(blocked));
}
