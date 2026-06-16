import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Plus } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { tr } from "@/lib/profile";
import { streamChat, type ChatMsg } from "@/lib/chat-client";
import { toast } from "sonner";
import { SoskinWordmark } from "@/components/SoskinWordmark";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — SoSkin Skincare Analysis" },
      { name: "description", content: "Talk to SoSkin's AI for personalized skincare analysis, routines, and ingredient questions." },
      { property: "og:title", content: "Chat — SoSkin Skincare Analysis" },
      { property: "og:description", content: "Talk to SoSkin's AI for personalized skincare analysis, routines, and ingredient questions." },
    ],
  }),
  component: ChatPage,
});


function ChatPage() {
  const { profile, update, ready } = useProfile();
  const t = tr(profile.lang);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!ready) return null;

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    let acc = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      await streamChat({
        messages: next,
        role: profile.role,
        lang: profile.lang,
        profile,
        onDelta: (chunk) => {
          acc += chunk;
          setMessages((m) => {
            const copy = m.slice();
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [t.suggestion1, t.suggestion2, t.suggestion3, t.suggestion4];

  return (
    <>
      <div className="min-h-screen bg-background relative flex flex-col">
        <div className="fixed inset-0 pointer-events-none gradient-glow opacity-50" />
        <div className="relative max-w-md w-full mx-auto flex-1 flex flex-col pt-[max(1rem,env(safe-area-inset-top))]">
          <header className="px-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <SoskinWordmark size="sm" asLink={false} />
              <div>
                <h1 className="text-xl font-bold leading-none">{t.appName} — Skincare Analysis</h1>

                <p className="text-xs text-muted-foreground mt-1">{t[profile.role]} • {profile.lang === "ar" ? "وضع" : "Mode"}</p>
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              className="p-2 rounded-xl bg-card border border-border"
              aria-label={t.newChat}
            >
              <Plus className="w-4 h-4" />
            </button>
          </header>

          <div className="px-4 mb-3 flex gap-2">
            {(["quick", "detailed"] as const).map((a) => (
              <button
                key={a}
                onClick={() => update({ answerStyle: a })}
                className={`flex-1 text-xs py-2 rounded-xl border transition-all ${
                  profile.answerStyle === a
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {a === "quick" ? t.quickAnswers : t.detailedExplanation}
              </button>
            ))}
          </div>


          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-32 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center py-12 animate-float-up">
                <SoskinWordmark size="lg" asLink={false} className="mb-4" />
                <h2 className="text-lg font-bold">{t.askAI}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">{t.tagline}</p>
                <div className="grid grid-cols-1 gap-2 mt-6 w-full">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-start p-3 rounded-2xl gradient-card border border-border text-sm hover:border-primary/50 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} typing={busy && i === messages.length - 1 && m.role === "assistant" && !m.content} />
            ))}
          </div>

          <div className="fixed bottom-20 inset-x-0 z-30">
            <div className="max-w-md mx-auto px-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 glass border border-border rounded-2xl p-2 shadow-card"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm"
                  disabled={busy}
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow disabled:opacity-40"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

function Message({ role, content, typing }: { role: string; content: string; typing?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-float-up`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "gradient-primary text-primary-foreground rounded-se-md"
            : "bg-card border border-border rounded-ss-md"
        }`}
      >
        {typing ? (
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-glow" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-glow [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-glow [animation-delay:0.4s]" />
          </span>
        ) : (
          formatContent(content)
        )}
      </div>
    </div>
  );
}

function formatContent(text: string) {
  // Light markdown: bold + bullets
  return text.split("\n").map((line, i) => {
    const bolded = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{part}</span>
      ),
    );
    return (
      <div key={i} className={line.startsWith("•") || line.startsWith("- ") ? "ps-2" : ""}>
        {bolded}
      </div>
    );
  });
}
