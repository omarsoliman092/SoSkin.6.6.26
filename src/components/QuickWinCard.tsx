import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getQuickWin } from "@/lib/quickwin.functions";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function QuickWinCard() {
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const fetchQuickWin = useServerFn(getQuickWin);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quick-win", todayKey()],
    queryFn: () => fetchQuickWin(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 60 * 6, // 6h
    retry: 1,
  });

  if (!isAuthenticated) return null;

  return (
    <div
      dir={ar ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-2xl glass border border-primary/30 p-4 shadow-card hover:shadow-glow transition-all"
    >
      <div className="absolute inset-0 gradient-aurora opacity-10 pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/25 blur-3xl pointer-events-none" />


      <div className="relative flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary">
          {ar ? "نصيحة اليوم" : "Quick Win Today"}
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          {ar ? "بنحضّر لك نصيحة اليوم..." : "Preparing today's tip..."}
        </div>
      )}

      {isError && !isLoading && (
        <div className="py-3 text-xs text-muted-foreground">
          {ar ? "تعذر تحميل نصيحة اليوم. حاول لاحقاً." : "Couldn't load today's tip."}
        </div>
      )}

      {data && !isLoading && (
        <>
          <div className="flex items-start gap-3 mb-2">
            <div className="text-3xl shrink-0 leading-none">{data.emoji}</div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold leading-tight mb-1">{data.title}</h3>
              <p className="text-xs text-foreground/85 leading-relaxed">{data.tip}</p>
            </div>
          </div>

          {data.productHint && (
            <div className="mt-3 rounded-xl glass border border-primary/20 p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-primary mb-0.5 font-bold">
                {ar ? "جرّب" : "Try"}
              </div>
              <div className="text-xs font-semibold mb-1">{data.productHint}</div>
              {data.why && (
                <div className="text-[10px] text-muted-foreground leading-relaxed">{data.why}</div>
              )}
            </div>
          )}

          <Link
            to="/scan"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl gradient-aurora text-primary-foreground text-xs font-bold shadow-glow hover:opacity-90 transition-all"
          >
            {ar ? "افحص منتج دلوقتي" : "Scan a product now"}
            <ArrowLeft className={`w-3.5 h-3.5 ${ar ? "" : "rotate-180"}`} />
          </Link>
        </>
      )}
    </div>
  );
}
