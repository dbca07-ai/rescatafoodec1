import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { discount, money } from "@/lib/format";

export type PackageRow = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price: number;
  original_price: number;
  quantity_left: number;
  pickup_start: string;
  pickup_end: string;
  available_date: string;
  businesses?: { name: string; city: string; category: string } | null;
};

export function PackageCard({ pkg }: { pkg: PackageRow }) {
  return (
    <Link
      to="/paquete/$id"
      params={{ id: pkg.id }}
      className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={`Paquete sorpresa ${pkg.title}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-ec-gradient" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
          -{discount(pkg.price, pkg.original_price)}% · lo mismo por menos
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
          {pkg.quantity_left > 0 ? `${pkg.quantity_left} disponibles` : "Agotado"}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          {pkg.businesses?.name ?? "Negocio local"}
        </p>
        <h3 className="text-base font-semibold">{pkg.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{pkg.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {pkg.businesses?.city ?? "Ecuador"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {pkg.pickup_start.slice(0, 5)}–{pkg.pickup_end.slice(0, 5)}
          </span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-display text-2xl">{money(pkg.price)}</span>
          <span className="text-sm text-muted-foreground line-through">{money(pkg.original_price)}</span>
        </div>
      </div>
    </Link>
  );
}