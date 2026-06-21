// Mocking TanStack Start Server Functions for SPA compatibility
export function createServerFn(options: any) {
  return (args: any) => options.handler(args);
}

export function useServerFn(fn: any) {
  return {
    mutateAsync: async (args: any) => await fn(args),
    data: null,
    isPending: false
  };
}
