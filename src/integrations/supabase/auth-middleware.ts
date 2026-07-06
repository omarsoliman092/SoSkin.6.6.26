// Standalone SPA Auth Middleware (No Server Side)
export const requireSupabaseAuth = (handler: any) => {
  return async (args: any) => {
    return handler(args);
  };
};
