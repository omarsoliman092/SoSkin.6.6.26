import { Link } from "@tanstack/react-router";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  asLink?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "text-xl sm:text-2xl md:text-3xl",
  md: "text-3xl sm:text-4xl md:text-5xl",
  lg: "text-5xl sm:text-6xl md:text-7xl",
  xl: "text-6xl sm:text-7xl md:text-8xl lg:text-9xl",
};

/**
 * SOSKIN serif wordmark — Tiffany-style elegant brand mark.
 * Use in headers, hero sections, splash screens.
 */
export function SoskinWordmark({ size = "md", asLink = true, className = "" }: Props) {
  const content = (
    <span className={`soskin-wordmark ${sizeMap[size]} ${className}`}>
      SOSKIN
    </span>
  );
  if (!asLink) return content;
  return (
    <Link to="/" aria-label="SoSkin home" className="inline-block">
      {content}
    </Link>
  );
}
