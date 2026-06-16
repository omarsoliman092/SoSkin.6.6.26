import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Save, Sparkles, Camera, User as UserIcon, X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { tr, type Gender, type CombinationZone, type UserProfile, type Role } from "@/lib/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({
    meta: [
      { title: "Edit Profile — SoSkin" },
      { name: "description", content: "Update your skin profile so SoSkin's AI can adapt your routine and recommendations instantly." },
    ],
  }),
  component: EditProfilePage,
});

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const CONCERNS = ["Acne", "Dark spots", "Wrinkles", "Redness", "Dehydration", "Blackheads", "Dullness", "Sun damage"];
const BUDGETS = ["< 500 EGP", "500–1500", "1500–3000", "3000+"];

function EditProfilePage() {
  const { profile, setProfile, ready } = useProfile();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const t = tr(draft.lang);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ready) return null;

  const onPickAvatar = (file: File) => {
    if (file.size > 2_500_000) {
      toast.error(draft.lang === "ar" ? "الصورة كبيرة (الحد 2.5 ميجا)" : "Image too large (max 2.5MB)");
      return;
    }
    const r = new FileReader();
    r.onload = () => set({ avatarDataUrl: r.result as string });
    r.readAsDataURL(file);
  };

  const set = (p: Partial<UserProfile>) => setDraft((d) => ({ ...d, ...p }));
  const toggleConcern = (c: string) =>
    set({ concerns: draft.concerns.includes(c) ? draft.concerns.filter((x) => x !== c) : [...draft.concerns, c] });

  const isCombo = draft.skinType === "Combination";

  const save = () => {
    setProfile({ ...draft, onboarded: true });
    toast.success(draft.lang === "ar" ? "تم حفظ التفضيلات — الذكاء الاصطناعي يتكيف الآن" : "Preferences saved — AI is adapting now");
    navigate({ to: "/profile" });
  };

  return (
    <MobileShell>
      <div className="flex items-center justify-between mb-5">
        <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" />
          {draft.lang === "ar" ? "رجوع" : "Back"}
        </Link>
        <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          {draft.lang === "ar" ? "التحديث فوري" : "Instant AI update"}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-1">{t.edit}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {draft.lang === "ar"
          ? "حدّث تفضيلاتك في أي وقت — سيتكيف SoSkin مع توصياتك فورًا."
          : "Update anytime — SoSkin instantly tailors recommendations."}
      </p>

      <Section title={draft.lang === "ar" ? "صورتك" : "Your photo"}>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl bg-card border border-border overflow-hidden flex items-center justify-center shrink-0">
            {draft.avatarDataUrl ? (
              <img src={draft.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPickAvatar(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="h-10 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-glow"
            >
              <Camera className="w-4 h-4" />
              {draft.lang === "ar" ? "اختر صورة" : "Choose photo"}
            </button>
            {draft.avatarDataUrl && (
              <button
                onClick={() => set({ avatarDataUrl: undefined })}
                className="h-9 rounded-xl border border-border text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                {draft.lang === "ar" ? "إزالة" : "Remove"}
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title={t.yourName}>
        <Input
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          className="h-12 rounded-xl"
          placeholder={draft.lang === "ar" ? "اسمك" : "Your name"}
        />
      </Section>

      <Section title={t.role}>
        <div className="grid gap-2">
          {(["customer", "expert"] as Role[]).map((r) => (
            <Pill key={r} active={draft.role === r} onClick={() => set({ role: r })}>
              <div className="font-semibold">{t[r]}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {t[`${r}Desc` as "customerDesc" | "expertDesc"]}
              </div>
            </Pill>
          ))}
        </div>
      </Section>


      <Section title={t.recommendFor}>
        <div className="grid grid-cols-2 gap-2">
          {(["female", "male"] as Gender[]).map((g) => (
            <Pill key={g} active={draft.recommendFor === g} onClick={() => set({ recommendFor: g, gender: g })}>
              <span className="text-lg mr-2">{g === "female" ? "👩" : "👨"}</span>
              {t[g]}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title={t.skinType}>
        <div className="grid grid-cols-2 gap-2">
          {SKIN_TYPES.map((s) => (
            <Pill
              key={s}
              active={draft.skinType === s}
              onClick={() => set({ skinType: s, combinationZone: s === "Combination" ? draft.combinationZone : "" })}
            >
              {s}
            </Pill>
          ))}
        </div>
        {isCombo && (
          <div className="mt-3 grid gap-2">
            {(["tzone", "ozone", "uzone"] as CombinationZone[]).map((z) => (
              <Pill key={z} active={draft.combinationZone === z} onClick={() => set({ combinationZone: z })}>
                {t[z as "tzone" | "ozone" | "uzone"]}
              </Pill>
            ))}
          </div>
        )}
      </Section>

      <Section title={t.concerns}>
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((c) => (
            <button
              key={c}
              onClick={() => toggleConcern(c)}
              className={`px-3 py-2 rounded-full border text-sm transition-all ${
                draft.concerns.includes(c)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t.budget}>
        <div className="grid grid-cols-2 gap-2">
          {BUDGETS.map((b) => (
            <Pill key={b} active={draft.budget === b} onClick={() => set({ budget: b })}>
              {b}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title={t.productPref}>
        <div className="grid grid-cols-3 gap-2">
          {(["egyptian", "imported", "both"] as const).map((p) => (
            <Pill key={p} active={draft.preference === p} onClick={() => set({ preference: p })}>
              {t[p]}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title={t.allergies}>
        <Input
          value={draft.allergies}
          onChange={(e) => set({ allergies: e.target.value })}
          className="h-12 rounded-xl"
          placeholder={draft.lang === "ar" ? "مثال: عطور، فراولة" : "e.g. fragrance, salicylates"}
        />
      </Section>

      {draft.recommendFor === "female" && (
        <Section title={t.pregnancy}>
          <button
            onClick={() => set({ pregnant: !draft.pregnant })}
            className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all ${
              draft.pregnant ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <span className="text-sm">{t.pregnancy}</span>
            <span className={`w-10 h-6 rounded-full transition-all relative ${draft.pregnant ? "bg-primary" : "bg-muted"}`}>
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-all ${
                  draft.pregnant ? "start-[1.125rem]" : "start-0.5"
                }`}
              />
            </span>
          </button>
        </Section>
      )}

      <Section title={t.favoriteBrands}>
        <Input
          value={draft.favoriteBrands}
          onChange={(e) => set({ favoriteBrands: e.target.value })}
          className="h-12 rounded-xl"
          placeholder={draft.lang === "ar" ? "مثال: لاروش-بوزيه، سيرافي" : "e.g. La Roche-Posay, CeraVe"}
        />
      </Section>

      <Section title={t.answerStyle}>
        <div className="grid grid-cols-2 gap-2">
          {(["quick", "detailed"] as const).map((a) => (
            <Pill key={a} active={draft.answerStyle === a} onClick={() => set({ answerStyle: a })}>
              {a === "quick" ? t.quickAnswers : t.detailedExplanation}
            </Pill>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-4 mt-6">
        <button
          onClick={save}
          className="w-full h-13 py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {t.save}
        </button>
      </div>
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <label className="text-xs text-muted-foreground uppercase tracking-wider">{title}</label>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border text-sm text-start transition-all ${
        active ? "border-primary bg-primary/10 shadow-glow/30" : "border-border bg-card"
      }`}
    >
      {children}
    </button>
  );
}
