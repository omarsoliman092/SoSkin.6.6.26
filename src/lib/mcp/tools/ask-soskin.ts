import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SYSTEM = `أنت "سو سكين" (SoSkin)، خبير بشرة مصري. رد باختصار (2–3 جمل) بلهجة مصرية بسيطة.
- ممنوع تأليف أسماء منتجات؛ التزم فقط بمنتجات معروفة في الصيدليات المصرية (Eva, CeraVe, The Ordinary, Bioderma, La Roche-Posay, Vichy, Avene, Garnier, Neutrogena, Cetaphil…).
- الأسعار: قول "يفضل تتأكد من الصيدلية" ولا تخترع أسعار.
- لو المستخدم كاتب بالإنجليزي، رد بإنجليزي مختصر بنفس النبرة.`;

export default defineTool({
  name: "ask_soskin",
  title: "Ask SoSkin AI",
  description:
    "Ask SoSkin's Egyptian skincare advisor a question (routine advice, ingredient questions, product comparisons). Returns a short expert answer.",
  inputSchema: {
    question: z.string().min(3).max(1000).describe("The skincare question in Arabic or English."),
    skinType: z
      .enum(["dry", "oily", "combination", "normal", "sensitive"])
      .optional()
      .describe("Optional skin type context."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ question, skinType }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "AI is not configured on this server." }], isError: true };
    }
    const userMsg = skinType ? `[skin type: ${skinType}]\n${question}` : question;
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userMsg },
          ],
        }),
      },
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        content: [{ type: "text", text: `AI request failed (${res.status}): ${t.slice(0, 200)}` }],
        isError: true,
      };
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content?.trim() ?? "(no answer)";
    return { content: [{ type: "text", text: answer }], structuredContent: { answer } };
  },
});
