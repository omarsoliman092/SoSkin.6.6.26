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
  const res = await fetch("/api/public/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      role: opts.role,
      lang: opts.lang,
      answerStyle: opts.answerStyleOverride ?? opts.profile.answerStyle,
      profile: {
        name: opts.profile.name,
        gender: opts.profile.gender,
        recommendFor: opts.profile.recommendFor,
        skinType: opts.profile.skinType,
        combinationZone: opts.profile.combinationZone,
        concerns: opts.profile.concerns,
        budget: opts.profile.budget,
        preference: opts.profile.preference,
        allergies: opts.profile.allergies,
        pregnant: opts.profile.pregnant,
        favoriteBrands: opts.profile.favoriteBrands,
      },
    }),
  });

  if (!res.ok || !res.body) {
    let parsed: { error?: string } = {};
    try { parsed = await res.json(); } catch { /* */ }
    throw new Error(parsed.error || `Chat failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line || line.startsWith(":")) continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const p = JSON.parse(json);
        const delta = p?.choices?.[0]?.delta?.content;
        if (delta) opts.onDelta(delta);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
}
