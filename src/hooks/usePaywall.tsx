import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyProStatus } from "@/lib/pro.functions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SCAN_KEY = "soskin_scan_count_v1";
export const FREE_SCAN_LIMIT = 3;
export const TRIAL_DAYS = 14;
// Re-validate against the server every 2 minutes to stay accurate across devices
const REVALIDATE_INTERVAL_MS = 2 * 60 * 1000;

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
}

function readScans(): { month: string; count: number } {
  try {
    const raw = localStorage.getItem(SCAN_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.month === monthKey()) return p;
    }
  } catch {}
  return { month: monthKey(), count: 0 };
}

type ServerStatus = Awaited<ReturnType<typeof getMyProStatus>>;

const EMPTY: ServerStatus = {
  isPaidPro: false,
  isPro: false,
  status: "none",
  activatedAt: null,
  expiresAt: null,
  isTrialActive: false,
  trialDaysLeft: 0,
  trialEndsAt: null,
  serverNow: new Date(0).toISOString(),
};

export function usePaywall() {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id ?? null;
  const fetchStatus = useServerFn(getMyProStatus);
  const [state, setState] = useState<ServerStatus>(EMPTY);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallExpert, setPaywallExpert] = useState(false);
  const [scanState, setScanState] = useState(() => readScans());

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setState(EMPTY);
      return;
    }
    try {
      const s = await fetchStatus();
      setState(s as ServerStatus);
    } catch {
      setState(EMPTY);
    }
  }, [fetchStatus, isAuthenticated]);

  // Refetch immediately when the signed-in user identity changes on this device
  useEffect(() => {
    setState(EMPTY);
    void refresh();
  }, [userId, refresh]);

  // React to every auth event (sign-in, sign-out, token refresh, user update)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState(EMPTY);
        return;
      }
      // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION, PASSWORD_RECOVERY
      void refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);


  // Periodic re-validation against the server for cross-device accuracy
  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setInterval(() => void refresh(), REVALIDATE_INTERVAL_MS);
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAuthenticated, refresh]);

  const openPaywall = useCallback((expert = false) => {
    setPaywallExpert(expert);
    setPaywallOpen(true);
  }, []);
  const closePaywall = useCallback(() => setPaywallOpen(false), []);

  const effectiveIsPro = state.isPro;

  const scansLeft = Math.max(0, FREE_SCAN_LIMIT - scanState.count);
  const canScan = effectiveIsPro || scansLeft > 0;

  const recordScan = useCallback(() => {
    if (effectiveIsPro) return;
    const s = readScans();
    const next = { month: s.month, count: s.count + 1 };
    try { localStorage.setItem(SCAN_KEY, JSON.stringify(next)); } catch {}
    setScanState(next);
  }, [effectiveIsPro]);

  return {
    isPro: effectiveIsPro,
    isPaidPro: state.isPaidPro,
    isTrialActive: state.isTrialActive,
    trialDaysLeft: state.trialDaysLeft,
    trialEndsAt: state.trialEndsAt,
    proStatus: state.status,
    activatedAt: state.activatedAt,
    expiresAt: state.expiresAt,
    refreshPro: refresh,
    paywallOpen,
    paywallExpert,
    openPaywall,
    closePaywall,
    scansLeft,
    canScan,
    recordScan,
  };
}
