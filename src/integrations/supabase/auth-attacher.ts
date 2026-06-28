import { createMiddleware } from '@/lib/server-fn-mock';

export const attachSupabaseAuth = createMiddleware().server(async ({ next }) => {
  return next();
});
