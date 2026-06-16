/**
 * Google Custom Search utility (server-only).
 * Caching layer prevents repeated API hits within a single Worker request
 * for the same query — saves quota.
 *
 * Env vars required:
 *   GOOGLE_SEARCH_API_KEY  — API key from Google Cloud Console
 *   GOOGLE_SEARCH_CX       — Programmable Search Engine ID
 */

export interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  image: string | null;
  price: string | null;
}

const memCache = new Map<string, { ts: number; items: GoogleSearchItem[] }>();
const TTL_MS = 5 * 60 * 1000; // 5 min

function extractPrice(text: string): string | null {
  if (!text) return null;
  // EGP / LE / ج.م / £ patterns with number
  const re =
    /(?:EGP|LE|ج\.?م|£|\$|€)\s?\d[\d,.\s]*|(?:\d[\d,.\s]{1,8})\s?(?:EGP|LE|ج\.?م|جنيه|pound)/i;
  const m = text.match(re);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}

function extractImage(item: any): string | null {
  const pagemap = item?.pagemap ?? {};
  const candidates: string[] = [
    pagemap.cse_image?.[0]?.src,
    pagemap.cse_thumbnail?.[0]?.src,
    pagemap.metatags?.[0]?.["og:image"],
    pagemap.metatags?.[0]?.["twitter:image"],
    pagemap.product?.[0]?.image,
  ].filter(Boolean);
  return candidates[0] ?? null;
}

export async function googleSearch(
  query: string,
  opts: { num?: number; site?: string } = {},
): Promise<GoogleSearchItem[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  // PLACEHOLDER MODE — return mock data so UI can be designed/tested
  if (!apiKey || !cx) {
    return mockResults(query, opts.site);
  }

  const q = opts.site ? `${query} site:${opts.site}` : query;
  const cacheKey = `${q}::${opts.num ?? 3}`;
  const cached = memCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.items;

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", q);
  url.searchParams.set("num", String(opts.num ?? 3));

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("google-search", res.status, await res.text().catch(() => ""));
    return [];
  }
  const data: any = await res.json();
  const items: GoogleSearchItem[] = (data.items ?? []).map((it: any) => ({
    title: it.title ?? "",
    link: it.link ?? "",
    snippet: it.snippet ?? "",
    displayLink: it.displayLink ?? "",
    image: extractImage(it),
    price: extractPrice(`${it.title ?? ""} ${it.snippet ?? ""}`),
  }));

  memCache.set(cacheKey, { ts: Date.now(), items });
  return items;
}

function mockResults(query: string, site?: string): GoogleSearchItem[] {
  const host = site ?? "example-pharmacy.com";
  return [
    {
      title: `${query} — Best Price`,
      link: `https://${host}/product`,
      snippet: `Buy ${query} online. Price: 450 EGP. Free delivery on orders above 500 LE.`,
      displayLink: host,
      image: null,
      price: "450 EGP",
    },
  ];
}
