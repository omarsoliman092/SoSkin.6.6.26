import { createServerFn } from "./server-fn-mock";
export const getAdminStats = createServerFn({ method: "GET" }).handler(async () => {
  return {
    total_users: 0,
    last_signup: null,
    total_scans: 0,
    scans_last_7d: [],
    signups_last_7d: [],
    top_products: [],
  };
});
export const ensureAdminRole = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true };
});
