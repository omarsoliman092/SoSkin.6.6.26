import { useState, useEffect } from "react";
import { GraduationCap, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { STRINGS } from "@/lib/strings";

const STORAGE_KEY = "academy-notification-dismissed";

export default function AcademyNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { profile } = useProfile();
  const ar = profile.lang === "ar";

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (isAuthenticated && !dismissed) {
      setIsOpen(true);
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 mx-4 rounded-3xl bg-primary/20 border-2 border-primary shadow-glow text-center animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-foreground/70 hover:text-foreground transition-colors"
          aria-label={STRINGS.academy.close[profile.lang]}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-foreground/10 text-foreground">
          <GraduationCap className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2">
          {STRINGS.academy.title[profile.lang]}
        </h3>

        {/* Description */}
        <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
          {STRINGS.academy.welcome[profile.lang]}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-2xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
        >
          {STRINGS.academy.start[profile.lang]}
        </button>
      </div>
    </div>
  );
}
