import { createServerFn } from "./server-fn-mock";

export const getMyProStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    isPaidPro: false,
    isPro: true,
    status: "active",
    activatedAt: new Date().toISOString(),
    expiresAt: null,
    isTrialActive: false,
    trialDaysLeft: 0,
    trialEndsAt: null,
    serverNow: new Date().toISOString(),
  };
});

export const listProUsers = createServerFn({ method: "GET" }).handler(async () => {
  return [];
});

export const setProAccess = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});

export const PRO_DURATION_DAYS = 30;

export const getAdminSubscribers = createServerFn({ method: "GET" }).handler(async () => {
  return [];
});

export const toggleProManual = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});
