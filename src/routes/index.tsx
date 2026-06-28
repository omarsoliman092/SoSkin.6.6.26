import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { Onboarding } from "@/components/Onboarding";
import { BottomNav } from "@/components/BottomNav";
import { HeroScreen, useHeroDismissed } from "@/components/HeroScreen";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { profile, ready } = useProfile();
  const [dismissed, setDismissed] = useHeroDismissed();

  // Show a simple fallback if loading takes too long
  if (!ready || dismissed === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse">
          <h1 className="text-2xl font-bold text-primary">SoSkin</h1>
          <p className="text-sm text-muted-foreground mt-2">Loading your skin profile...</p>
        </div>
      </div>
    );
  }
  if (!profile.onboarded) return <Onboarding />;

  if (dismissed) return <Navigate to="/tools" />;

  return (
    <>
      <HeroScreen onDismiss={() => setDismissed(true)} />
      <BottomNav />
    </>
  );
}
