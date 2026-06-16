import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, GraduationCap, RefreshCw, Trophy, Lock } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { PremiumGate } from "@/components/PremiumGate";
import { toast } from "sonner";

export const Route = createFileRoute("/simulator")({
  component: () => (
    <PremiumGate
      featureKey="simulator"
      isExpert
      title="محاكي العميل / Client Simulator"
      subtitle="يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية."
      benefits={[
        "تدرّب على سيناريوهات اعتراض حقيقية",
        "تقييم AI لإجاباتك ومهاراتك البيعية",
        "نصائح للتحسين بعد كل جلسة",
      ]}
    >
      <SimulatorPage />
    </PremiumGate>
  ),
});

type Msg = { role: "customer" | "advisor"; content: string };
type Scenario = "too_expensive" | "will_it_work" | "saw_cheaper" | "why_this" | "need_serum" | "free_play";

const SCENARIOS: { id: Scenario; ar: string; en: string }[] = [
  { id: "too_expensive", ar: "غالى أوى", en: "Too expensive" },
  { id: "will_it_work", ar: "هينفع فعلاً؟", en: "Will it work?" },
  { id: "saw_cheaper", ar: "شفت أرخص", en: "Saw cheaper" },
  { id: "why_this", ar: "ليه ده بالذات؟", en: "Why this one?" },
  { id: "need_serum", ar: "محتاج سيروم؟", en: "Need a serum?" },
  { id: "free_play", ar: "حر", en: "Free play" },
];

type Evaluation = {
  scores: { persuasion: number; professionalism: number; sellingLogic: number; customerHandling: number };
  overall: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
};

function SimulatorPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [scenario, setScenario] = useState<Scenario>("too_expensive");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!ready) return null;
  if (profile.role !== "expert") {
    return <RoleLock ar={ar} title={ar ? "محاكى العميل" : "Customer Simulator"} desc={ar ? "هذه الأداة لخبراء العناية ومسؤولى التجميل فقط. غيّر دورك من الملف الشخصى." : "This tool is for skincare experts only. Change your role in profile."} />;
  }

  const reset = (s: Scenario = scenario) => {
    setScenario(s);
    setMessages([]);
    setEvaluation(null);
    // kick off with a customer opener
    void send([], s, true);
  };

  const send = async (history: Msg[], s: Scenario, opener = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: s,
          messages: history,
          lang: ar ? "ar" : "en",
          mode: "reply",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Simulator failed");
      setMessages((m) => [...m, { role: "customer", content: data.reply || (opener ? "..." : "") }]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendAdvisor = async () => {
    if (!input.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "advisor", content: input.trim() }];
    setMessages(next);
    setInput("");
    await send(next, scenario);
  };

  const evaluate = async () => {
    if (messages.filter((m) => m.role === "advisor").length === 0) {
      toast.error(ar ? "رد على العميل الأول" : "Reply to the customer first");
      return;
    }
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await fetch("/api/public/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          messages,
          lang: ar ? "ar" : "en",
          mode: "evaluate",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Eval failed");
      setEvaluation(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileShell>
        <header className="mb-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            {ar ? "محاكى العميل" : "Customer Simulator"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "تدرب على الردود والإقناع" : "Practice handling objections"}
          </p>
        </header>

        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => reset(s.id)}
              className={`shrink-0 h-9 px-3 rounded-full text-xs font-semibold border ${
                scenario === s.id ? "gradient-primary text-primary-foreground border-primary shadow-glow" : "bg-card border-border text-muted-foreground"
              }`}
            >
              {ar ? s.ar : s.en}
            </button>
          ))}
        </div>

        {messages.length === 0 && (
          <button
            onClick={() => reset(scenario)}
            disabled={loading}
            className="w-full mt-3 h-11 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {ar ? "ابدأ السيناريو" : "Start scenario"}
          </button>
        )}

        <div className="mt-3 space-y-2 min-h-[200px]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "advisor" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "advisor" ? "gradient-primary text-primary-foreground" : "bg-card border border-border"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                  {m.role === "advisor" ? (ar ? "أنت" : "You") : (ar ? "العميل" : "Customer")}
                </div>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> {ar ? "العميل بيفكر..." : "Customer is thinking..."}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length > 0 && (
          <>
            <div className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAdvisor()}
                placeholder={ar ? "ردك كمستشار..." : "Your advisor reply..."}
                className="flex-1 h-11 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={sendAdvisor}
                disabled={loading || !input.trim()}
                className="w-11 h-11 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center shadow-glow disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={evaluate}
              disabled={loading}
              className="w-full mt-2 h-11 rounded-2xl bg-card border border-primary/40 text-primary font-semibold flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" /> {ar ? "قيم أدائى" : "Evaluate my performance"}
            </button>
          </>
        )}

        {evaluation && (
          <div className="mt-4 space-y-3 animate-float-up">
            <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground text-center">
              <div className="text-[10px] uppercase tracking-wider opacity-80">{ar ? "التقييم العام" : "Overall"}</div>
              <div className="text-4xl font-bold mt-1">{evaluation.overall}<span className="text-base opacity-80">/100</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Score label={ar ? "إقناع" : "Persuasion"} value={evaluation.scores.persuasion} />
              <Score label={ar ? "احترافية" : "Pro"} value={evaluation.scores.professionalism} />
              <Score label={ar ? "منطق البيع" : "Logic"} value={evaluation.scores.sellingLogic} />
              <Score label={ar ? "تعامل" : "Handling"} value={evaluation.scores.customerHandling} />
            </div>
            <Block title={ar ? "نقاط قوتك" : "Strengths"}>
              <ul className="space-y-1 text-sm">{evaluation.strengths.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>
            </Block>
            <Block title={ar ? "للتحسين" : "Improve"}>
              <ul className="space-y-1 text-sm">{evaluation.improvements.map((s, i) => <li key={i}>• {s}</li>)}</ul>
            </Block>
            <Block title={ar ? "الإجابة النموذجية" : "Model answer"}>
              <p className="text-sm italic leading-relaxed">"{evaluation.modelAnswer}"</p>
            </Block>
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}<span className="text-xs text-muted-foreground">/100</span></div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border gradient-card p-4">
      <div className="text-xs font-semibold text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function RoleLock({ ar, title, desc }: { ar: boolean; title: string; desc: string }) {
  return (
    <>
      <MobileShell>
        <div className="text-center mt-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-6">{desc}</p>
          <Link to="/edit-profile" className="inline-block px-5 h-11 leading-[44px] rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow">
            {ar ? "تعديل الدور" : "Change role"}
          </Link>
        </div>
      </MobileShell>
      <BottomNav />
    </>
  );
}
