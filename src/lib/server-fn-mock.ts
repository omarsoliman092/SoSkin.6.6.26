// Robust mock for TanStack Start functions and middleware in SPA mode
export function createServerFn(options: any) {
  const fn = async (args: any) => {
    if (options.handler) {
      return options.handler({ data: args, context: {} });
    }
    return null;
  };

  fn.middleware = () => fn;
  fn.validator = () => fn;
  fn.handler = (handler: any) => {
    const newFn: any = async (args: any) => await handler({ data: args, context: {} });
    newFn.middleware = () => newFn;
    return newFn;
  };

  return fn;
}

export function useServerFn(fn: any) {
  return async (args: any) => {
    try {
      return await fn(args);
    } catch (error) {
      console.error("Function execution failed:", error);
      throw error;
    }
  };
}

export function createMiddleware() {
  return {
    server: (handler: any) => handler,
    client: (handler: any) => handler,
    middleware: (handler: any) => handler,
  };
}

export function getRequest() {
  return {};
}
