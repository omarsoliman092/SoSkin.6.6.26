import { createServerFn } from "./server-fn-mock";
export const checkProSubscription = createServerFn({ method: "GET" }).handler(async () => {
  return { is_pro: false };
});
export const getAdminSubscribers = createServerFn({ method: "GET" }).handler(async () => {
  return [];
});
export const toggleProManual = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});
