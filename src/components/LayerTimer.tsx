import { useEffect, useMemo, useRef, useState } from "react";
import { Timer, Play, RotateCcw, Info } from "lucide-react";

type ProductType = "serum" | "moisturizer" | "oil";

const PRESETS: Record<ProductType, { minutes: number; ar: string; en: string }> = {
  serum: { minutes: 3, ar: "سيروم (1–3 دقائق)", en: "Serum (1–3 min)" },
  moisturizer: { minutes: 5, ar: "مرطب / كريم خفيف / صن بلوك (3–5 دقائق)", en: "Moisturizer / Light cream / Sunblock (3–5 min)" },
  oil: { minutes: 30, ar: "زيوت وكريمات ثقيلة (15–30 دقيقة)", en: "Oils / Heavy creams (15–30 min)" },
};

export function LayerTimer({ ar, label }: { ar: boolean; label?: string }) {
  const [type, setType] = useState<ProductType>("moisturizer");
  const duration = useMemo(() => PRESETS[type].minutes * 60, [type]);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
  }, [duration]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          try {
            if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
          } catch {}
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const done = remaining === 0;
  const pct = ((duration - remaining) / duration) * 100;

  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-primary/5 p-2">
      <div className="flex items-center gap-2">
        <Timer className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[10px] font-semibold text-primary flex-1 truncate">
          {label ?? (ar ? "وقت الامتصاص" : "Absorption time")}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums">{mm}:{ss}</span>
        {!running && !done && (
          <button
            onClick={() => setRunning(true)}
            className="h-7 px-2 rounded-lg gradient-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            {ar ? "ابدأ" : "Start"}
          </button>
        )}
        {(running || done) && (
          <button
            onClick={() => { setRemaining(duration); setRunning(false); }}
            className="h-7 px-2 rounded-lg border border-border text-[10px] font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {ar ? "إعادة" : "Reset"}
          </button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1">
        {(Object.keys(PRESETS) as ProductType[]).map((k) => (
          <button
            key={k}
            onClick={() => setType(k)}
            className={`h-7 px-1 rounded-lg text-[9px] font-semibold border leading-tight ${
              type === k
                ? "gradient-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            {ar
              ? k === "serum" ? "سيروم" : k === "moisturizer" ? "مرطب/صن" : "زيت/ثقيل"
              : k === "serum" ? "Serum" : k === "moisturizer" ? "Moist/SPF" : "Oil/Heavy"}
          </button>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground mt-1 leading-tight">
        {ar ? PRESETS[type].ar : PRESETS[type].en}
      </div>

      <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${done ? "bg-green-500" : "gradient-primary"} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {done && (
        <div className="text-[10px] text-green-600 font-semibold mt-1">
          {ar ? "✓ خلصت — حط الطبقة اللى بعدها" : "✓ Done — apply next layer"}
        </div>
      )}

      <button
        onClick={() => setShowTips((v) => !v)}
        className="mt-1.5 flex items-center gap-1 text-[9px] text-primary font-semibold"
      >
        <Info className="w-2.5 h-2.5" />
        {ar ? "نصائح لزيادة الامتصاص" : "Absorption tips"}
      </button>
      {showTips && (
        <ul className="mt-1 space-y-0.5 text-[9px] text-muted-foreground leading-snug ps-3 list-disc">
          {ar ? (
            <>
              <li><b>الترتيب الصحيح:</b> ابدأ بالأخف (تونر/سيروم) ثم الأثقل (كريم/زيت).</li>
              <li><b>البشرة الرطبة:</b> حط المرطب على بشرة رطبة قليلاً لزيادة التغلغل.</li>
              <li><b>التدليك اللطيف:</b> ينشط الدورة الدموية ويحسن الامتصاص.</li>
            </>
          ) : (
            <>
              <li><b>Right order:</b> lightest first (toner/serum) then heaviest (cream/oil).</li>
              <li><b>Damp skin:</b> apply moisturizer on slightly damp skin for better penetration.</li>
              <li><b>Gentle massage:</b> boosts circulation and absorption.</li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
