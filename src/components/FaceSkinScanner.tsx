import { useRef, useState } from "react";
import { Camera, Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

/**
 * Compact 3-angle face scanner for the Scan page.
 * Calls /api/public/skin-detect and saves results to the user's profile.
 */
export function FaceSkinScanner() {
  const { profile, update } = useProfile();
  const ar = profile.lang === "ar";
  const fileRef = useRef<HTMLInputElement>(null);

  const [shots, setShots] = useState<string[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const ANGLES = ar ? ["وجه أمامي", "خد يسار", "خد يمين"] : ["Front", "Left cheek", "Right cheek"];

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });

  const addShot = async (file: File) => {
    try {
      const url = await fileToDataUrl(file);
      setShots((p) => (p.length >= 3 ? p : [...p, url]));
      setMsg(null);
    } catch {
      toast.error(ar ? "فشل تحميل الصورة" : "Failed to load image");
    }
  };

  const run = async () => {
    if (shots.length === 0) return;
    setDetecting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/public/skin-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrls: shots, lang: ar ? "ar" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Detection failed");
      if (!data.skinType) {
        toast.error(data.summary || (ar ? "صورة غير واضحة — جرّب صور أوضح" : "Unclear images"));
        return;
      }
      update({
        skinType: data.skinType,
        combinationZone: data.skinType === "Combination" ? data.combinationZone || "" : "",
        concerns: Array.from(new Set([...(profile.concerns || []), ...(data.concerns || [])])),
      });
      const conf = data.confidence ? ` (${data.confidence}%)` : "";
      setMsg(`${data.summary || ""}${conf}`.trim());
      toast.success(ar ? `تم التحديد: ${data.skinType}` : `Detected: ${data.skinType}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-card/60 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
          <Camera className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">
            {ar ? "اعرف نوع بشرتك (3 زوايا)" : "Detect your skin type (3 angles)"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            {ar
              ? "صوّر وجهك من 3 زوايا — هنحدد نوع بشرتك ومشاكلها ونحفظهم لروتينك."
              : "Snap 3 angles — we'll detect your skin type & concerns and save them to your profile."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {ANGLES.map((label, i) => {
          const has = !!shots[i];
          const isNext = !has && shots.length === i;
          return (
            <div
              key={label}
              className={`relative aspect-square rounded-xl border overflow-hidden flex items-center justify-center ${
                has
                  ? "border-primary bg-primary/10"
                  : isNext
                    ? "border-primary/60 bg-primary/5 ring-2 ring-primary/30"
                    : "border-dashed border-border bg-card/40 opacity-60"
              }`}
            >
              {has ? (
                <>
                  <img src={shots[i]} className="w-full h-full object-cover" alt={label} />
                  <div className="absolute top-1 end-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                </>
              ) : (
                <Camera className="w-4 h-4 text-primary/70" />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-background/85 text-[10px] font-semibold text-center py-0.5 truncate px-1">
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void addShot(f);
          e.target.value = "";
        }}
      />

      <div className="flex gap-2">
        {shots.length < 3 ? (
          <button
            type="button"
            disabled={detecting}
            onClick={() => fileRef.current?.click()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow disabled:opacity-60"
          >
            <Camera className="w-4 h-4" />
            {ar ? `صوّر ${ANGLES[shots.length]}` : `Capture ${ANGLES[shots.length]}`}
          </button>
        ) : (
          <button
            type="button"
            disabled={detecting}
            onClick={run}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold shadow-glow disabled:opacity-60"
          >
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {detecting ? (ar ? "جاري التحليل..." : "Analyzing...") : ar ? "حلّل البشرة" : "Analyze skin"}
          </button>
        )}
        {shots.length > 0 && !detecting && (
          <button
            type="button"
            onClick={() => { setShots([]); setMsg(null); }}
            className="h-10 px-3 rounded-xl border border-border text-sm font-semibold"
          >
            {ar ? "تصفير" : "Reset"}
          </button>
        )}
      </div>

      {msg && (
        <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground/90 leading-relaxed">
          {msg}
        </div>
      )}
    </div>
  );
}
