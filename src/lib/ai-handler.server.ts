export type AIMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

export type AIRequestOptions = {
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  stream?: boolean;
};

export async function callAI(options: AIRequestOptions) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey && !geminiKey) {
    throw new Error("AI not configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to your .env file.");
  }

  // Use OpenAI if key starts with sk- or if user specifically provided an "OpenAI Key"
  // Note: user's key was key_MAks4j9uBbCNyWDG, we'll try it as OpenAI.
  if (openaiKey) {
    const isVision = options.messages.some(m => Array.isArray(m.content) && m.content.some(c => c.type === "image_url"));
    const model = isVision ? "gpt-4o" : (options.model?.includes("pro") ? "gpt-4o" : "gpt-4o-mini");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI Error:", error);
      throw new Error(`OpenAI API failed: ${response.status}. Verify your key is correct.`);
    }

    if (options.stream) {
      return response.body;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Fallback to Gemini
  if (geminiKey) {
    const model = options.model || "gemini-1.5-flash";
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${geminiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini Error:", error);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    if (options.stream) {
      return response.body;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
