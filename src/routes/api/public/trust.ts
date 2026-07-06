import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { callAI } from "@/lib/ai-handler.server";
import { googleSearch } from "@/lib/google-search.server";

const PHARMACY_SITES = [
  { name: "Care To Beauty", site: "caretobeauty.com" },
  { name: "صيدلية العزبى", site: "elezabypharmacy.com" },
  { name: "Belbaa", site: "belbaapharmacy.com" },
  { name: "صيدلية سيف", site: "seifonline.com" },
];

const InputSchema = z.object({
  product: z.string().min(2).max(200),
  lang: z.enum(["en", "ar"]).default("ar"),
});

function build(b: z.infer<typeof InputSchema>) {
  const lang = b.lang === "ar"
    ? "All text fields in Egyptian Arabic, concise."
    : "All text fields in clear English, concise.";
  return `You are SoSkin Trust Score engine. Evaluate the product: "${b.product}".
Return ONLY JSON:
{
  "product": string,
  "brand": string,
  "overall": number,         // 0-100 SoSkin Trust Score
  "scores": {
    "ingredientQuality": number,
    "formulation": number,
    "scientificSupport": number,
    "marketingHonesty": number,
    "valueForMoney": number,
    "irritationRisk": number,   // lower = safer (0 safest, 100 risky)
    "skinCompatibility": number
  },
  "verdict": string,           // 1 short line
  "strengths": string[],       // 3 bullets max
  "weaknesses": string[],      // 3 bullets max
  "bestFor": string[],         // skin types/concerns
  "avoidIf": string[],
  "egyptAvailability": {
    "available": boolean,
    "where": string[],         // pharmacies/sites in Egypt (Seif, El Ezaby, Noon, Joybuy, Sigma, brand store...)
    "priceEGP": string
  }
}
Rules:
- Use real ingredient knowledge — never refuse with "unknown".
- If product unfamiliar, infer from brand line and state best estimate.
- Egypt availability MUST be realistic (no invented chains).
- ${lang}
Output JSON only.`;
}

export const Route = createFileRoute("/api/public/trust")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof InputSchema>;
        try { body = InputSchema.parse(await request.json()); }
        catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }

        try {
          const raw = await callAI({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: build(body) }],
          });

          if (!raw) throw new Error("AI returned empty content");
          const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          const parsed = JSON.parse(cleaned);

          // Override AI-invented prices with real Google Search results
          try {
            const query = `${parsed.brand ?? ""} ${parsed.product ?? body.product}`.trim();
            const results = await Promise.all(
              PHARMACY_SITES.map(async (ph) => {
                const hits = await googleSearch(query, { site: ph.site, num: 1 });
                return { name: ph.name, price: hits[0]?.price ?? null, link: hits[0]?.link ?? null };
              }),
            );
            const withPrice = results.filter((r) => r.price);
            if (withPrice.length > 0) {
              const prices = withPrice
                .map((r) => parseInt(r.price!.replace(/[^\d]/g, ""), 10))
                .filter((n) => !isNaN(n) && n > 10 && n < 50000);
              const priceRange = prices.length
                ? `${Math.min(...prices)} - ${Math.max(...prices)} ${body.lang === "ar" ? "جنيه" : "EGP"}`
                : parsed.egyptAvailability?.priceEGP;
              parsed.egyptAvailability = {
                available: true,
                where: withPrice.map((r) => r.name),
                priceEGP: priceRange,
              };
              parsed.priceSources = withPrice;
            }
          } catch (e) {
            console.error("trust price fetch", e);
          }

          return Response.json(parsed);
        } catch {
          return Response.json({ error: "Bad AI response" }, { status: 502 });
        }
      },
    },
  },
});
