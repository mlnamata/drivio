import { Link } from "@tanstack/react-router";
import { BadgeCheck, Heart, MapPin, ShieldCheck } from "lucide-react";
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
        "photo-chip inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-card",
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
        <CarImage src={vehicle.photos[0]!} alt={title} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
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
            <span className="photo-chip rounded-md px-2 py-0.5 text-[11px] font-semibold">
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
          <h3 className="truncate text-base font-semibold group-hover:underline group-hover:underline-offset-4">
            {title}
          </h3>
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
          {vehicle.year}, {vehicle.trim}
        </p>
        {/* Parametry jako na prodejním štítku: nájezd, palivo, převodovka, místo */}
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Najeto</dt>
            <dd className="truncate font-medium tabular-nums">{num(vehicle.km)} km</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Palivo</dt>
            <dd className="truncate font-medium">{labelOf(fuels, vehicle.fuel)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Převodovka</dt>
            <dd className="truncate font-medium">{labelOf(gearboxes, vehicle.gearbox)}</dd>
          </div>
        </dl>
        <p className="mt-2 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> {dealer.city}
          {dealer.isDealer ? (
            <>
              <BadgeCheck className="ml-1 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
              <span>ověřený prodejce</span>
            </>
          ) : null}
        </p>
        <div className="flex-1" />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-border pt-3">
          <div>
            <p className="font-display text-xl font-extrabold">{czk(vehicle.price)}</p>
            <PriceRatingBadge vehicle={vehicle} />
          </div>
          <p className="text-right text-xs text-muted-foreground">
            splátka od
            <span className="block font-display text-sm font-bold text-primary-ink">
              {czk(monthlyPayment(vehicle.price))}/měs.
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
