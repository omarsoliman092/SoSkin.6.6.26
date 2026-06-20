import type { Role, Lang, UserProfile, AnswerStyle } from "@/lib/profile";

export interface ChatMsg {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function streamChat(opts: {
  messages: ChatMsg[];
  role: Role;
  lang: Lang;
  profile: UserProfile;
  answerStyleOverride?: AnswerStyle;
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
}) {
  // Pointing to our new independent Vercel API
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      model: "gpt-4o-mini",
      temperature: 0.7
    }),
  });

  if (!res.ok) {
    let parsed: { error?: string } = {};
    try { parsed = await res.json(); } catch { /* */ }
    throw new Error(parsed.error || `Chat failed (${res.status})`);
  }

  // Handle non-streaming response for simplicity in Vercel functions for now
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  opts.onDelta(content);
}
