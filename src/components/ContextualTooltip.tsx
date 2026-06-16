import { useEffect, useState } from "react";

/**
 * ContextualTooltip — minimal, premium tooltip.
 * Shows only during the user's first 3 login sessions for a given key,
 * then permanently hides. Auto-dismisses after 3s.
 *
 * Brand: Deep Charcoal bg + Soft Gold border. Single-word labels only.
 */

const SESSION_KEY = "soskin_session_count";
const TIP_KEY = (k: string) => `soskin_tip_${k}`;

export function bumpSession() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(SESSION_KEY);
  const n = raw ? Number(raw) || 0 : 0;
  localStorage.setItem(SESSION_KEY, String(n + 1));
}

interface Props {
  id: string;
  label: string;
  /** position relative to its parent (parent must be `relative`) */
  position?: "top" | "bottom";
}

export function ContextualTooltip({ id, label, position = "bottom" }: Props) {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessions = Number(localStorage.getItem(SESSION_KEY) || "0");
    const seen = localStorage.getItem(TIP_KEY(id));
    if (sessions > 3 || seen) return;

    const showT = setTimeout(() => setShow(true), 600);
    const fadeT = setTimeout(() => setFading(true), 3300);
    const hideT = setTimeout(() => {
      setShow(false);
      localStorage.setItem(TIP_KEY(id), "1");
    }, 3900);

    return () => {
      clearTimeout(showT);
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, [id]);

  if (!show) return null;

  const pos =
    position === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";

  return (
    <div
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${pos} z-50 transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="px-3 py-1.5 rounded-full border text-[11px] font-medium tracking-wide whitespace-nowrap shadow-card"
        style={{
          background: "oklch(0.13 0.005 60 / 0.92)",
          color: "oklch(0.88 0.14 88)",
          borderColor: "oklch(0.78 0.13 85 / 0.55)",
          backdropFilter: "blur(8px)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
