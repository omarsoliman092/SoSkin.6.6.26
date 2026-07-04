import { createServerFn } from "./server-fn-mock";
export const checkFeatureLimit = createServerFn({ method: "POST" }).handler(async () => {
  return { allowed: true, remaining: 99 };
});
export const incrementFeatureUsage = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});
export const getFeatureUsage = createServerFn({ method: "GET" }).handler(async () => {
  return { total: 0, items: [] };
});
export const logFeatureEvent = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});
