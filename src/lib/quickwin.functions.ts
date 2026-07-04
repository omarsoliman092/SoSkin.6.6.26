import { createServerFn } from "./server-fn-mock";
export const generateQuickWin = createServerFn({ method: "POST" }).handler(async () => {
  return "Quick Win logic is being migrated to the Web App API.";
});
