import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { SosAcademyPromoCard } from "@/components/SosAcademyPromoCard";
import { FloatedRoastCard } from "@/components/FloatedRoastCard";
import { ConsumerDashboard } from "@/components/ConsumerDashboard";
import { QuickWinCard } from "@/components/QuickWinCard";
import { ALL_TOOLS, PRIMARY_CUSTOMER, PRIMARY_EXPERT } from "@/lib/tools";
import { STRINGS } from "@/lib/strings";
import { SoskinWordmark } from "@/components/SoskinWordmark";


export const Route = createFileRoute("/tools")({
  component: ToolsPage,
});

function ToolsPage() {
  const { profile, ready } = useProfile();
  const navigate = useNavigate();
  if (!ready) return <div className="min-h-screen bg-background" />;

  const ar = profile.lang === "ar";
  const isPro = profile.role === "expert";
  const primary = isPro ? PRIMARY_EXPERT : PRIMARY_CUSTOMER;
  const hidden = new Set(profile.hiddenTools ?? []);
  const tools = ALL_TOOLS.filter((t) => (!t.expert || isPro) && !hidden.has(t.key));

  return (
    <>
      <MobileShell>
        <header className="mt-4 mb-5 flex flex-col items-center text-center">
          <SoskinWordmark size="xl" asLink={false} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            {ar ? "جمالك بلمسة واحدة" : "Everything in one place"}
          </p>
        </header>


        <div className="mb-3">
          <ConsumerDashboard
            onAction={(key) => navigate({ to: key === "sos" ? "/sos" : "/scan" })}
          />
        </div>

        <div className="mb-5">
          <SosAcademyPromoCard />
        </div>

        {!isPro && (
          <div className="mb-5">
            <QuickWinCard />
          </div>
        )}

        <div className="space-y-3">
          {primary.map((a) => (
            <Link
              key={`${a.to}-${(a as any).search?.tab ?? ""}`}
              to={a.to}
              search={(a as any).search ?? undefined}
              className="group flex items-center gap-4 p-5 rounded-2xl glass border border-primary/20 shadow-card hover:border-primary/60 hover:shadow-glow transition-all"
            >
              <div className="w-12 h-12 rounded-xl gradient-aurora flex items-center justify-center shrink-0 shadow-glow">
                <a.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">{a.label[profile.lang]}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.sub[profile.lang]}</div>
              </div>
              <span className="text-primary/60 group-hover:text-primary transition-colors">
                {ar ? "‹" : "›"}
              </span>
            </Link>
          ))}

        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary/80 font-semibold">
              {STRINGS.home.smartTools[profile.lang]}
            </div>
            <Link
              to="/settings"
              className="text-[10px] uppercase tracking-wider text-primary hover:underline"
            >
              {STRINGS.home.manage[profile.lang]}
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {tools.map((t) => (
              <Link
                key={t.key}
                to={t.to}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl glass border border-primary/20 hover:border-primary/60 hover:shadow-glow transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <t.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-[10px] font-medium text-center leading-tight">
                  {t.label[profile.lang]}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/founder"
          className="mt-10 block text-center text-[11px] text-muted-foreground hover:text-primary transition-colors tracking-wide"
        >
          {STRINGS.home.credit[profile.lang]}
        </Link>
      </MobileShell>

      {!isPro && <FloatedRoastCard />}
      <BottomNav />
    </>
  );
}
