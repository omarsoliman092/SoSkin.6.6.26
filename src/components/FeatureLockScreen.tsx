import React, { useState } from "react";
import { Lock, Crown, Sparkles } from "lucide-react";
import { PricingPaywallModal } from "@/components/PricingPaywallModal";

interface Props {
  isExpert?: boolean;
  title: string;
  subtitle?: string;
  benefits?: string[];
  ar?: boolean;
}

const DEFAULT_MESSAGE_AR =
  "يرجى الترقية إلى النسخة الـ PRO للاستفادة من كافة ميزات S.O.SKIN الاحترافية.";
const DEFAULT_MESSAGE_EN =
  "Please upgrade to S.O.SKIN PRO to unlock all premium features.";

export const FeatureLockScreen: React.FC<Props> = ({
  isExpert = false,
  title,
  subtitle,
  benefits = [],
  ar = true,
}) => {
  const [open, setOpen] = useState(false);
  const message = subtitle ?? (ar ? DEFAULT_MESSAGE_AR : DEFAULT_MESSAGE_EN);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-yellow-500/40 bg-foreground p-6 text-center shadow-2xl mt-4">
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative z-10">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-400/60 shadow-[0_0_24px_rgba(245,200,80,0.5)]">
            <Lock className="w-7 h-7 text-yellow-950" strokeWidth={2.5} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300 mb-3">
            <Crown className="w-3 h-3" />
            {isExpert
              ? ar ? "ميزة الخبراء VIP" : "Expert VIP feature"
              : ar ? "ميزة PRO" : "PRO feature"}
          </div>

          <h2 className="font-serif text-2xl font-bold text-background mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
            {message}
          </p>

          {benefits.length > 0 && (
            <ul className={`text-${ar ? "right" : "left"} space-y-2.5 mb-7 max-w-[90%] mx-auto`}>
              {benefits.map((b, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm text-muted-foreground ${ar ? "flex-row-reverse" : ""}`}>
                  <div className="mt-0.5 rounded-full bg-yellow-500/20 p-1 text-yellow-300 shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 py-3.5 font-semibold text-yellow-950 hover:opacity-90 transition-opacity shadow-lg shadow-yellow-500/30"
          >
            <Crown className="w-4 h-4" />
            {ar ? "ترقية إلى SOSKIN PRO" : "Upgrade to SOSKIN PRO"}
          </button>

          <p className="text-[10px] text-muted-foreground mt-3 tracking-wider uppercase">
            {ar ? "200 ج.م شهرياً • إلغاء فى أى وقت" : "200 EGP / month • Cancel anytime"}
          </p>
        </div>
      </div>

      <PricingPaywallModal isOpen={open} onClose={() => setOpen(false)} isExpertModel={isExpert} />
    </>
  );
};
