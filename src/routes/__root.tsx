import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  Link,
  useRouter,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProfileProvider } from "@/hooks/useProfile";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";

// Simple Error Component for SPA
function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-destructive">SoSkin Error</h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => window.location.assign("/")} className="h-11 px-6 rounded-2xl gradient-primary text-white font-bold shadow-glow">
          Reload App
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

const PUBLIC_PATHS = ["/", "/login", "/signup", "/reset-password", "/founder", "/quick-scan"];

function AuthSync() {
  const router = useRouter();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Temporary fix to stop the login loop while we verify the new design
  useEffect(() => {
    if (isLoading) return;
    const path = location.pathname;
    const isPublic = PUBLIC_PATHS.includes(path);
    // Only redirect if NOT authenticated AND trying to access a restricted page
    // if (!isAuthenticated && !isPublic) {
    //   navigate({ to: "/login" });
    // }
  }, [isAuthenticated, isLoading, location.pathname]);

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
