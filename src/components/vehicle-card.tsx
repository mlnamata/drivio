import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Heart, MapPin, Settings2 } from "lucide-react";
import { CarImage } from "@/components/car-image";
import { useFavorites } from "@/hooks/use-favorites";
import { fuels, gearboxes, labelOf } from "@/lib/catalog";
import { czk, dealerById, monthlyPayment, num, vehicleTitle, type Vehicle } from "@/lib/mock-data";
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
  const dealer = dealerById(vehicle.dealerId);
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
        <div className="absolute left-3 top-3 flex gap-1.5">
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
        <FavoriteButton id={vehicle.id} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-base font-semibold">{title}</h3>
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
          <p className="font-display text-xl font-extrabold">{czk(vehicle.price)}</p>
          <p className="whitespace-nowrap rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            od {czk(monthlyPayment(vehicle.price))}/měs.
          </p>
        </div>
      </div>
    </Link>
  );
}
