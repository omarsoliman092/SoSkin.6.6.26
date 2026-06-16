import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

interface LazyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  rounded?: string;
}

/**
 * LazyImage — IntersectionObserver-driven lazy loader.
 * Soft Gold shimmering skeleton while loading.
 * Deep Charcoal fallback icon + product name on error or missing src.
 */
export function LazyImage({ src, alt, className = "", rounded = "rounded-xl" }: LazyImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  const showImage = inView && src && !errored;
  const showFallback = inView && (!src || errored);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${rounded} ${className}`}
      aria-label={alt}
    >
      {/* Shimmer skeleton */}
      {!loaded && !errored && (
        <div className={`absolute inset-0 shimmer-gold ${rounded}`} />
      )}

      {showImage && (
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`relative w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {showFallback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-foreground/90 text-background p-2">
          <ImageOff className="w-5 h-5 opacity-70" />
          <span className="text-[9px] text-center line-clamp-2 leading-tight px-1 opacity-80">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
