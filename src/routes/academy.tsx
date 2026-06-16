import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, GraduationCap, Trophy, Check, X, Lock, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Beauty Academy — SoSkin" },
      { name: "description", content: "Learn skincare science with bite-sized lessons, quizzes, and expert tips from the SoSkin Beauty Academy." },
      { property: "og:title", content: "Beauty Academy — SoSkin" },
      { property: "og:description", content: "Learn skincare science with bite-sized lessons, quizzes, and expert tips from the SoSkin Beauty Academy." },
    ],
  }),
  component: AcademyPage,
});


type Q = {
  title: string; kind: "mcq"|"objection"|"scenario";
  question: string; options: string[]; correctIndex: number;
  xp: number; explanation: string; proTip: string;
};

const XP_KEY = "soskin_xp_v1";
function getXP() { try { return Number(localStorage.getItem(XP_KEY) || "0"); } catch { return 0; } }
function setXPStore(v: number) { try { localStorage.setItem(XP_KEY, String(v)); } catch {} }
function rank(xp: number) {
  if (xp >= 1000) return { name: "Master", next: null };
  if (xp >= 500) return { name: "Senior Advisor", next: 1000 };
  if (xp >= 200) return { name: "Advisor", next: 500 };
  if (xp >= 50) return { name: "Trainee", next: 200 };
  return { name: "Rookie", next: 50 };
}

function AcademyPage() {
  const { profile, ready } = useProfile();
  const ar = profile.lang === "ar";
  const [level, setLevel] = useState<"beginner"|"intermediate"|"advanced">("intermediate");
  const [q, setQ] = useState<Q | null>(null);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [xp, setXp] = useState(0);

  useEffect(() => { setXp(getXP()); }, []);

  if (!ready) return null;
  if (profile.role !== "expert") {
    return (
      <>
        <MobileShell>
          <div className="text-center mt-16 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">Beauty Academy</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {ar ? "أكاديمية لمستشارى التجميل وخبراء العناية فقط." : "Academy is for beauty advisors & experts only."}
            </p>
            <Link to="/edit-profile" className="inline-block px-5 h-11 leading-[44px] rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow">
              {ar ? "تعديل الدور" : "Change role"}
            </Link>
          </div>
        </MobileShell>
        <BottomNav />
      </>
    );
  }

  const load = async () => {
    setLoading(true); setPicked(null); setQ(null);
    try {
      const res = await fetch("/api/public/academy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "fail");
      setQ(data);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const choose = (i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    if (i === q.correctIndex) {
      const newXp = xp + q.xp;
      setXp(newXp); setXPStore(newXp);
      toast.success(`+${q.xp} XP`);
    }
  };

  const r = rank(xp);
  const pct = r.next ? Math.min(100, Math.round((xp / r.next) * 100)) : 100;

  return (
    <>
      <MobileShell>
        <header className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            {ar ? "أكاديمية SoSkin" : "Beauty Academy"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ar ? "تدرّب يومياً وارفع نقاطك" : "Daily training • earn XP"}
          </p>
        </header>

        <div className="rounded-2xl gradient-aurora border border-primary/30 p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">{ar ? "رتبتك" : "Rank"}</div>
              <div className="font-bold text-lg flex items-center gap-2"><Trophy className="w-4 h-4" /> {r.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider opacity-80">XP</div>
              <div className="text-2xl font-bold">{xp}</div>
            </div>
          </div>
          {r.next && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
                <div className="h-full bg-primary-foreground" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] opacity-80 mt-1">{ar ? "حتى" : "to"} {r.next} XP</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {(["beginner","intermediate","advanced"] as const).map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`h-10 rounded-2xl text-xs font-semibold border ${level===l?"gradient-primary text-primary-foreground border-transparent shadow-glow":"bg-card border-border text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <button onClick={load} disabled={loading}
          className="w-full mt-3 h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {q ? (ar ? "سؤال جديد" : "Next question") : (ar ? "ابدأ التدريب" : "Start training")}
        </button>

        {q && (
          <div className="mt-5 space-y-3 animate-float-up">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{q.kind}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">+{q.xp} XP</span>
              </div>
              <div className="font-semibold text-sm leading-relaxed">{q.question}</div>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isCorrect = picked !== null && i === q.correctIndex;
                const isWrong = picked === i && i !== q.correctIndex;
                return (
                  <button key={i} onClick={() => choose(i)} disabled={picked !== null}
                    className={`w-full text-start p-3 rounded-2xl border text-sm flex items-center gap-2 transition-all
                      ${isCorrect?"border-primary bg-primary/10":""}
                      ${isWrong?"border-destructive bg-destructive/10":""}
                      ${picked===null?"border-border bg-card hover:border-primary/50":""}
                      ${picked!==null && !isCorrect && !isWrong?"border-border bg-card opacity-50":""}`}>
                    <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs shrink-0">
                      {isCorrect ? <Check className="w-3 h-3 text-primary" /> : isWrong ? <X className="w-3 h-3 text-destructive" /> : String.fromCharCode(65+i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <>
                <div className="rounded-2xl border border-border gradient-card p-4">
                  <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">{ar ? "الشرح" : "Explanation"}</div>
                  <div className="text-sm">{q.explanation}</div>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">💡 Pro tip</div>
                  <div className="text-sm">{q.proTip}</div>
                </div>
              </>
            )}
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}
