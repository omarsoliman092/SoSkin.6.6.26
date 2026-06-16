import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type QuickWin = {
  emoji: string;
  title: string;
  tip: string;
  productHint: string;
  why: string;
  date: string; // YYYY-MM-DD
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const getQuickWin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QuickWin> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const userId = context.userId;
    const date = todayKey();

    // Profile + last 5 scans
    const [{ data: profile }, { data: scans }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("lang, gender, skin_type, concerns, budget, preference, allergies, pregnant, favorite_brands")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("scans")
        .select("product_name, result_summary, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const lang = (profile?.lang ?? "ar") as "ar" | "en";
    const langName = lang === "ar" ? "Egyptian Arabic" : "English";

    const prof = profile
      ? `Skin: ${profile.skin_type || "unknown"}. Concerns: ${(profile.concerns ?? []).join(", ") || "none"}. Budget: ${profile.budget || "any"}. Pregnant: ${profile.pregnant ? "yes" : "no"}. Allergies: ${profile.allergies || "none"}.`
      : "No profile yet.";
    const recent = (scans ?? []).length
      ? (scans ?? []).map((s) => `- ${s.product_name}`).join("\n")
      : "No recent scans.";

    const seed = `${userId}-${date}`;
    const prompt = `You are SoSkin's personal skincare coach for an Egyptian customer.
Generate ONE personalized "Quick Win of the Day" for ${date}.
It must feel tailored, not generic. Use the profile and recent product scans below.

Profile: ${prof}
Recent scans:
${recent}

Rules:
- Pick ONE actionable, specific recommendation for TODAY (a habit, a product type to try, or a smart layering tip).
- It should take less than 2 minutes to act on.
- Mention a product CATEGORY (not a brand) the customer should consider, suitable for their skin type and budget.
- Be warm, friendly, short. Speak directly to the user.
- Vary your suggestion based on this seed: ${seed}

Return ONLY JSON:
{
  "emoji": string,          // one emoji
  "title": string,          // 3-6 words max
  "tip": string,            // 1-2 sentences, the actual advice
  "productHint": string,    // product category to try (2-5 words)
  "why": string             // 1 short sentence: why it fits THEM today
}

All text in ${langName}. JSON only, no markdown.`;

    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!upstream.ok) {
      throw new Error(upstream.status === 429 ? "Rate limit" : upstream.status === 402 ? "AI credits exhausted" : "AI failed");
    }
    const data = await upstream.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      emoji: String(parsed.emoji ?? "✨"),
      title: String(parsed.title ?? ""),
      tip: String(parsed.tip ?? ""),
      productHint: String(parsed.productHint ?? ""),
      why: String(parsed.why ?? ""),
      date,
    };
  });
