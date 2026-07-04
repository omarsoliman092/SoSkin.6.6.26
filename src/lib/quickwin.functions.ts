import { createServerFn } from "./server-fn-mock";

export const getQuickWin = createServerFn({ method: "POST" }).handler(async () => {
  return "Quick Win logic is being migrated to the Web App API.";
});
