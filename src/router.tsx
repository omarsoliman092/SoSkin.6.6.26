import { QueryClient } from "@tanstack/react-query";
import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  console.error(error);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">SoSkin</h1>
        <p className="text-sm text-muted-foreground">Something went wrong while loading this screen.</p>
        <button
          type="button"
          onClick={() => {
            reset();
            router.invalidate();
          }}
          className="h-11 px-4 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
        >
          Try again
        </button>
      </main>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
