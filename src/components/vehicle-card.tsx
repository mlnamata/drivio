import { Link } from "@tanstack/react-router";
import { BadgeCheck, Fuel, Gauge, Heart, MapPin, Settings2, ShieldCheck } from "lucide-react";
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
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm transition-transform hover:scale-105",
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
        "surface-card lift group flex flex-col overflow-hidden",
        layout === "list" && "sm:flex-row",
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
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
          {vehicle.top ? (
            <span className="rounded-md bg-foreground px-2 py-0.5 text-[11px] font-bold text-background">
              TOP
            </span>
          ) : null}
          {isNew ? (
            <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              Nové
            </span>
          ) : null}
          {vehicle.vatDeductible ? (
            <span className="rounded-md bg-card/90 px-2 py-0.5 text-[11px] font-semibold text-foreground">
              Odpočet DPH
            </span>
          ) : null}
        </div>
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          <CompareButton id={vehicle.id} />
          <FavoriteButton id={vehicle.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-semibold">{title}</h3>
          {vehicle.cebiaVerified ? (
            <span
              title="Historie ověřena Cebia"
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-success/12 px-1.5 py-0.5 text-[10px] font-bold text-success"
            >
              <ShieldCheck className="h-3 w-3" /> Cebia
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {vehicle.year} · {vehicle.trim}
        </p>
        <div className="mb-3 mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
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
            {dealer.isDealer ? (
              <BadgeCheck
                className="h-3.5 w-3.5 shrink-0 text-success"
                aria-label="Ověřený prodejce"
              />
            ) : null}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-extrabold leading-tight">
              {czk(vehicle.price)}
            </p>
            <PriceRatingBadge vehicle={vehicle} className="mt-1" />
          </div>
          <p className="shrink-0 text-right text-[11px] leading-tight text-muted-foreground">
            splátka od
            <span className="block text-sm font-bold text-accent-foreground">
              {czk(monthlyPayment(vehicle.price))}
            </span>
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
  high: "text-[oklch(0.55_0.14_60)] dark:text-warning",
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
