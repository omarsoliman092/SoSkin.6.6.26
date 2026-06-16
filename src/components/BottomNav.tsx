import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageCircle, ScanLine, Scale, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { tr } from "@/lib/profile";

export function BottomNav() {
  const loc = useLocation();
  const { profile } = useProfile();
  const t = tr(profile.lang);
  const items = [
    { to: "/", icon: Home, label: t.home },
    { to: "/chat", icon: MessageCircle, label: t.chat },
    { to: "/scan", icon: ScanLine, label: t.scan },
    { to: "/compare", icon: Scale, label: t.compare },
    { to: "/profile", icon: User, label: t.profile },
  ] as const;

  return (
    <nav data-tour="bottom-nav" className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60">
      <div className="max-w-md mx-auto flex justify-around items-center px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all ${
                  active ? "gradient-primary shadow-glow" : ""
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
