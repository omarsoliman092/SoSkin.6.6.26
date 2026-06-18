import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  Link,
  useRouter,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProfileProvider } from "@/hooks/useProfile";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">SoSkin</h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while loading this screen.
        </p>
        <div className="flex items-center justify-center gap-2">
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
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="h-11 px-4 rounded-2xl bg-card border border-border text-sm font-semibold"
          >
            Go home
          </button>
        </div>
      </main>
    </div>
  );
}

function RootNotFoundComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">This SoSkin screen is no longer available.</p>
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center px-4 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
        >
          Go home
        </Link>
      </main>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
});

const PUBLIC_PATHS = ["/", "/login", "/signup", "/reset-password", "/founder", "/quick-scan"];

function AuthSync() {
  const router = useRouter();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isLoading) return;
    const path = location.pathname;
    const isPublic = PUBLIC_PATHS.includes(path);
    if (!isAuthenticated && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <AuthSync />
          <main>
            <Outlet />
          </main>
          <Toaster />
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
