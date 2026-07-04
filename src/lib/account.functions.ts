import { createServerFn } from "./server-fn-mock";
export const deleteMyAccount = createServerFn({ method: "POST" }).handler(async () => {
  throw new Error("Account deletion is currently unavailable in the Web App.");
});
