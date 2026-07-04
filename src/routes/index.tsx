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

  if (!ready || dismissed === null) {
    return <div className="min-h-screen bg-background" />;
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
