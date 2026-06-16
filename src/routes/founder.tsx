import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Award, GraduationCap, TrendingUp, Building2, Instagram, Phone } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { loadFounder, type FounderContent } from "@/lib/founder-content";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "About the Founder — SoSkin" },
      { name: "description", content: "Omar Soliman — Founder & Cosmetic Intelligence Strategist. Creator of SoSkin." },
      { property: "og:title", content: "About the Founder — SoSkin" },
      { property: "og:description", content: "Omar Soliman — Founder & Cosmetic Intelligence Strategist. Creator of SoSkin." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Omar Soliman",
          jobTitle: "Founder & Cosmetic Intelligence Strategist",
          worksFor: { "@type": "Organization", name: "SoSkin" },
          url: "https://soskin-omarsoliman.lovable.app/founder",
        }),
      },
    ],
  }),
  component: FounderPage,
});


function FounderPage() {
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const [c, setC] = useState<FounderContent>(loadFounder);

  useEffect(() => {
    const h = () => setC(loadFounder());
    window.addEventListener("founder-content-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("founder-content-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const titles = ar ? c.titlesAr : c.titlesEn;
  const bio = ar ? c.bioAr : c.bioEn;
  const highlights = ar ? c.highlightsAr : c.highlightsEn;
  const statIcons = [GraduationCap, Building2, TrendingUp, Award];
  const stats = c.stats.map((s, i) => ({
    icon: statIcons[i] ?? Award,
    label: ar ? s.labelAr : s.labelEn,
    value: s.value,
  }));

  return (
    <>
      <MobileShell>
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> {ar ? "رجوع" : "Back"}
        </Link>

        <div className="relative rounded-3xl overflow-hidden gradient-card border border-border shadow-card">
          <div className="absolute inset-0 gradient-aurora opacity-30" />
          <div className="relative p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full gradient-aurora blur-xl opacity-60" />
              <img
                src={c.avatarUrl}
                alt="Omar Soliman — Founder of SoSkin"
                width={1024}
                height={1024}
                loading="lazy"
                className="relative w-32 h-32 rounded-full object-cover border-2 border-primary/40 shadow-glow"
              />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-border text-[11px] uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" /> {ar ? "مؤسس SoSkin" : "Founder of SoSkin"}
            </div>
            <h1 className="mt-3 text-2xl font-bold">{c.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {ar ? "تم تطويره بواسطة عمر سليمان" : "Developed by Omar Soliman"}
            </p>
            <div className="mt-4 flex flex-col gap-1.5 w-full">
              {titles.map((t) => (
                <div key={t} className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-foreground">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl gradient-card border border-border p-4">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl gradient-card border border-border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">{ar ? "نبذة" : "Profile"}</h2>
          <p className="text-sm leading-relaxed text-foreground/90">{bio}</p>
        </div>

        <div className="mt-5 rounded-2xl gradient-card border border-border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">{ar ? "أبرز النقاط" : "Highlights"}</h2>
          <ul className="space-y-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm">
                <span className="mt-1 w-1.5 h-1.5 rounded-full gradient-primary shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href={c.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
          <a
            href={`tel:${c.phone}`}
            className="flex items-center justify-center gap-2 h-12 rounded-2xl border border-border bg-card text-sm font-semibold"
          >
            <Phone className="w-4 h-4 text-primary" />
            {c.phone}
          </a>
        </div>

        <p className="mt-6 mb-2 text-center text-[11px] text-muted-foreground">
          SoSkin — {ar ? "تم تطويره بواسطة عمر سليمان" : "Developed by Omar Soliman"}
        </p>

      </MobileShell>
      <BottomNav />
    </>
  );
}
