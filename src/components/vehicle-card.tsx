import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Heart, MapPin, Settings2, ShieldCheck } from "lucide-react";
import { CarImage } from "@/components/car-image";
import { CompareButton } from "@/components/compare";
import { useFavorites } from "@/hooks/use-favorites";
import { fuels, gearboxes, labelOf } from "@/lib/catalog";
import {
  czk,
  sellerOf,
  monthlyPayment,
  num,
  priceRating,
  vehicleTitle,
  type Vehicle,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const active = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      className={cn(
        "glass inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          active ? "fill-destructive text-destructive" : "text-foreground/70",
        )}
      />
    </button>
  );
}

export function VehicleCard({
  vehicle,
  layout = "grid",
}: {
  vehicle: Vehicle;
  layout?: "grid" | "list";
}) {
  const dealer = sellerOf(vehicle);
  const title = vehicleTitle(vehicle);
  const isNew = vehicle.listedDays <= 7;

  return (
    <Link
      to="/inzerat/$id"
      params={{ id: vehicle.id }}
      className={cn(
        "surface-card lift group block overflow-hidden",
        layout === "list" && "sm:flex",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden",
          layout === "list" && "sm:aspect-auto sm:w-72 sm:shrink-0",
        )}
      >
        <CarImage
          src={vehicle.photos[0]!}
          alt={title}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {vehicle.top ? (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-bold text-background">
              TOP
            </span>
          ) : null}
          {isNew ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              Nové
            </span>
          ) : null}
          {vehicle.vatDeductible ? (
            <span className="glass rounded-full px-2.5 py-1 text-[11px] font-semibold">
              Odpočet DPH
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <CompareButton id={vehicle.id} />
          <FavoriteButton id={vehicle.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-semibold">{title}</h3>
          {vehicle.cebiaVerified ? (
            <span
              title="Historie ověřena Cebia"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-bold text-success"
            >
              <ShieldCheck className="h-3 w-3" /> Cebia
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {vehicle.year} · {vehicle.trim}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <Gauge className="h-3.5 w-3.5 shrink-0" /> {num(vehicle.km)} km
          </span>
          <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <Fuel className="h-3.5 w-3.5 shrink-0" /> {labelOf(fuels, vehicle.fuel)}
          </span>
          <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <Settings2 className="h-3.5 w-3.5 shrink-0" /> {labelOf(gearboxes, vehicle.gearbox)}
          </span>
          <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {dealer.city}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div>
            <p className="font-display text-xl font-extrabold">{czk(vehicle.price)}</p>
            <PriceRatingBadge vehicle={vehicle} />
          </div>
          <p className="whitespace-nowrap rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            od {czk(monthlyPayment(vehicle.price))}/měs.
          </p>
        </div>
      </div>
    </Link>
  );
}

const ratingTone = {
  great: "text-success",
  good: "text-success",
  fair: "text-muted-foreground",
  high: "text-[oklch(0.55_0.14_60)]",
} as const;

export function PriceRatingBadge({ vehicle, className }: { vehicle: Vehicle; className?: string }) {
  const r = priceRating(vehicle);
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-[11px] font-semibold",
        ratingTone[r.tone],
        className,
      )}
    >
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-2.5 rounded-full",
              i < { great: 4, good: 3, fair: 2, high: 1 }[r.tone] ? "bg-current" : "bg-border",
            )}
          />
        ))}
      </span>
      {r.label}
    </p>
  );
}
