import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Link,
  useRouter,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { name: "theme-color", content: "#FFFFFF" },
      { title: "SoSkin — SOS for your Skin" },
      { name: "description", content: "SoSkin — intelligent skincare rescue powered by AI. Personalized routines, ingredient analysis, and trusted beauty guidance." },
      { property: "og:title", content: "SoSkin — SOS for your Skin" },
      { property: "og:description", content: "SoSkin — intelligent skincare rescue powered by AI. Personalized routines, ingredient analysis, and trusted beauty guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "SoSkin — SOS for your Skin" },
      { name: "twitter:description", content: "SoSkin — intelligent skincare rescue powered by AI. Personalized routines, ingredient analysis, and trusted beauty guidance." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/usbTzRVDOhdaQblfKjEFFh0mS2v2/social-images/social-1779848745775-99ce58ad-789b-4c9b-bb29-627af4cd3040.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/usbTzRVDOhdaQblfKjEFFh0mS2v2/social-images/social-1779848745775-99ce58ad-789b-4c9b-bb29-627af4cd3040.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "256x256", href: "/favicon-256.png" },
      { rel: "apple-touch-icon", sizes: "1024x1024", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SoSkin",
          url: "https://soskin-omarsoliman.lovable.app",
          logo: "https://soskin-omarsoliman.lovable.app/icon-512.png",
          description:
            "SoSkin — intelligent skincare rescue powered by AI. Personalized routines, ingredient analysis, and trusted beauty guidance.",
          founder: { "@type": "Person", name: "Omar Soliman" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SoSkin",
          url: "https://soskin-omarsoliman.lovable.app",
        }),
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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


