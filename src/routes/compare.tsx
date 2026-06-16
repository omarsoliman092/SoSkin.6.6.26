import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Loader2, Scale, Sparkles, Trophy, ShieldCheck, BadgeDollarSign, Crown } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { tr } from "@/lib/profile";
import { streamChat } from "@/lib/chat-client";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const { profile, ready } = useProfile();
  const t = tr(profile.lang);
  const [items, setItems] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");

  if (!ready) return null;

  const setAt = (i: number, v: string) => setItems((arr) => arr.map((x, j) => (i === j ? v : x)));
  const add = () => items.length < 5 && setItems((a) => [...a, ""]);
  const remove = (i: number) => items.length > 2 && setItems((a) => a.filter((_, j) => j !== i));

  const run = async () => {
    const list = items.map((s) => s.trim()).filter(Boolean);
    if (list.length < 2) {
      toast.error(profile.lang === "ar" ? "أدخل منتجين على الأقل" : "Enter at least 2 products");
      return;
    }
    setLoading(true);
    setReport("");
    const prompt =
      profile.lang === "ar"
        ? `قارن المنتجات التالية بصيغة Markdown منظّمة جدًا، مع فواصل واضحة وبدون دمج الفقرات.

اتبع هذا الهيكل بالضبط:

## 🧪 بطاقة كل منتج
لكل منتج اكتب قسمًا منفصلاً يبدأ بـ:
### 1) <اسم المنتج>
- **المكونات الفعّالة:** ...
- **الفوائد الرئيسية:** ...
- **ملاءمة البشرة:** ...
- **خطر التهيج:** ...
- **السعر التقريبي (ج.م):** ...
- **درجة الثقة /100:** ...
- **القيمة مقابل السعر /100:** ...
- **مستوى الجودة:** ...
- **الموضع:** صيدلي / متوسط / فاخر

اترك سطرًا فارغًا بين كل منتج والذي يليه.

---

## 📊 جدول مقارنة سريع
أنشئ جدول Markdown يقارن: السعر، الثقة، القيمة، التهيج، الموضع.

---

## 🏁 القرارات النهائية
- 🏆 **الأقوى عمومًا:** ... — السبب: ...
- 💸 **الأفضل قيمة:** ... — السبب: ...
- 🛡️ **الأكثر أمانًا:** ... — السبب: ...
- 👑 **الأفضل بريميوم:** ... — السبب: ...
- 🪙 **الأفضل اقتصاديًا:** ... — السبب: ...

⚠️ مهم: كل معلومة في نقطة (-) منفصلة، لا تدمج المعلومات في فقرة. اترك سطرًا فارغًا بين الأقسام.

المنتجات: ${list.join(" | ")}`
        : `Compare the products below in clean, well-spaced Markdown. Never merge info into long paragraphs.

Follow this exact structure:

## 🧪 Product Cards
For each product, a separate section:
### 1) <Product name>
- **Active ingredients:** ...
- **Key benefits:** ...
- **Skin suitability:** ...
- **Irritation risk:** ...
- **Approx price (EGP):** ...
- **Trust score /100:** ...
- **Value-for-money /100:** ...
- **Quality level:** ...
- **Positioning:** pharmacy / mid / premium

Leave a blank line between products.

---

## 📊 Quick Comparison Table
A Markdown table comparing: price, trust, value, irritation, positioning.

---

## 🏁 Final Verdicts
- 🏆 **Strongest overall:** ... — why: ...
- 💸 **Best value:** ... — why: ...
- 🛡️ **Safest:** ... — why: ...
- 👑 **Best premium:** ... — why: ...
- 🪙 **Best budget:** ... — why: ...

⚠️ Important: each fact on its own bullet (-). Never merge into paragraphs. Blank line between sections.

Products: ${list.join(" | ")}`;

    try {
      let acc = "";
      await streamChat({
        messages: [{ role: "user", content: prompt }],
        role: profile.role,
        lang: profile.lang,
        profile,
        answerStyleOverride: "detailed",
        onDelta: (c) => {
          acc += c;
          setReport(acc);
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobileShell>
        <header className="mb-5">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            {t.compareTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t.compareDesc}</p>
        </header>

        <div className="space-y-2">
          {items.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <input
                value={v}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder={t.productNamePh}
                className="flex-1 h-11 rounded-2xl bg-card border border-border px-4 outline-none text-sm focus:border-primary"
              />
              {items.length > 2 && (
                <button
                  onClick={() => remove(i)}
                  className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground"
                  aria-label="remove"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={add}
            disabled={items.length >= 5}
            className="flex-1 h-11 rounded-2xl bg-card border border-border text-sm flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> {t.addProduct}
          </button>
          <button
            onClick={run}
            disabled={loading}
            className="flex-[1.4] h-11 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t.runCompare}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1.5 text-[10px] text-muted-foreground">
          <Legend icon={Trophy} label={profile.lang === "ar" ? "الأقوى" : "Strongest"} />
          <Legend icon={BadgeDollarSign} label={profile.lang === "ar" ? "قيمة" : "Value"} />
          <Legend icon={ShieldCheck} label={profile.lang === "ar" ? "أأمن" : "Safest"} />
          <Legend icon={Crown} label={profile.lang === "ar" ? "بريميوم" : "Premium"} />
          <Legend icon={BadgeDollarSign} label={profile.lang === "ar" ? "اقتصادي" : "Budget"} />
        </div>

        {report && (
          <div className="mt-5 rounded-2xl gradient-card border border-border p-4 animate-float-up text-sm leading-relaxed">
            <CompareReport text={report} />
          </div>
        )}
      </MobileShell>
      <BottomNav />
    </>
  );
}

function Legend({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-card/50 border border-border/50">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="leading-none">{label}</span>
    </div>
  );
}

function renderInline(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-foreground">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function CompareReport({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push(<hr key={key++} className="my-4 border-border/60" />);
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="text-base font-bold text-primary mt-4 mb-2">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="text-lg font-bold mt-5 mb-3 flex items-center gap-2">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2 key={key++} className="text-lg font-bold mt-5 mb-3">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // Markdown table
    if (trimmed.startsWith("|") && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
      const header = trimmed.split("|").slice(1, -1).map((s) => s.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim().split("|").slice(1, -1).map((s) => s.trim()));
        i++;
      }
      blocks.push(
        <div key={key++} className="my-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-primary/10">
              <tr>
                {header.map((h, hi) => (
                  <th key={hi} className="px-2 py-2 text-start font-semibold">{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-border/60">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-2 py-2 align-top">{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="space-y-2 my-2 ps-1">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-2 leading-relaxed">
              <span className="text-primary mt-1.5 shrink-0">•</span>
              <span className="flex-1">{renderInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Blank line → spacing
    if (trimmed === "") {
      blocks.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Plain paragraph
    blocks.push(
      <p key={key++} className="my-1.5 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div>{blocks}</div>;
}
