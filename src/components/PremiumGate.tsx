import React, { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FeatureLockScreen } from "@/components/FeatureLockScreen";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { usePaywall } from "@/hooks/usePaywall";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { logFeatureEvent } from "@/lib/feature-usage.functions";

interface PremiumGateProps {
  featureKey: string;
  title: string;
  subtitle: string;
  benefits: string[];
  isExpert?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps a premium feature page. Shows a golden-lock paywall when the user is
 * neither in trial nor a paid PRO. Always logs an entry event for analytics.
 */
export function PremiumGate({
  featureKey,
  title,
  subtitle,
  benefits,
  isExpert = false,
  children,
}: PremiumGateProps) {
  const { isPro } = usePaywall();
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const ar = profile.lang === "ar";
  const log = useServerFn(logFeatureEvent);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || loggedRef.current) return;
    if (!isPro) return; // only log when access is actually granted
    loggedRef.current = true;
    log({ data: { feature_key: featureKey } }).catch(() => {});
  }, [isAuthenticated, isPro, featureKey, log]);

  if (!isPro) {
    return (
      <MobileShell>
        <FeatureLockScreen
          ar={ar}
          isExpert={isExpert}
          title={title}
          subtitle={subtitle}
          benefits={benefits}
        />
        <BottomNav />
      </MobileShell>
    );
  }

  return <>{children}</>;
}
