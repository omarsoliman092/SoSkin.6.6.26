import { Star, Scale, Sparkles, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LazyImage } from "@/components/LazyImage";

export interface Product {
  name: string;
  brand: string;
  benefit: string;
  ingredients: string;
  price: string;
  trust: number;
  why?: string;
  emoji?: string;
  image?: string;
  suitableFor?: string;
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card animate-scale-in">
      <div className="flex gap-3">
        {/* Image with lazy-load, gold shimmer skeleton, charcoal fallback */}
        <div className="w-20 h-20 shrink-0">
          {p.image ? (
            <LazyImage src={p.image} alt={p.name} className="w-20 h-20 border border-border" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center text-3xl">
              <span>{p.emoji || "✨"}</span>
            </div>
          )}
        </div>


        {/* Header info */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.brand}</div>
          <div className="font-semibold leading-tight text-sm mt-0.5 line-clamp-2">{p.name}</div>

          {/* Price + Trust */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold text-foreground">{p.price}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-[11px] font-medium text-foreground">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {p.trust}
            </span>
          </div>
        </div>
      </div>

      {/* Suitable for */}
      {(p.suitableFor || p.why) && (
        <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
          <span className="leading-snug">{p.suitableFor || p.why}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to="/compare"
          className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-secondary border border-border text-xs font-medium hover:border-primary/50 transition"
        >
          <Scale className="w-3.5 h-3.5" /> Compare
        </Link>
        <Link
          to="/chat"
          className="flex items-center justify-center gap-1.5 h-9 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold shadow-card hover:shadow-glow transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Alternatives
        </Link>
      </div>
    </div>
  );
}
