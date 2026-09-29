import { czk, surchargeFactor, type Vehicle } from "@/lib/mock-data";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const factor = surchargeFactor(vehicle.ageMonths);
  return (
    <article className="surface-card group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={vehicle.photo}
          alt={vehicle.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
          {vehicle.ageMonths}. měsíc inzerce
        </span>
        {factor > 1 ? (
          <span className="absolute right-3 top-3 rounded-full bg-warning px-3 py-1 text-xs font-semibold text-warning-foreground">
            sazba +{Math.round((factor - 1) * 100)} %
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-lg font-semibold">{vehicle.title}</h3>
          <p className="text-sm text-muted-foreground">
            {vehicle.year} · {vehicle.km.toLocaleString("cs-CZ")} km · {vehicle.fuel} ·{" "}
            {vehicle.gearbox}
          </p>
        </div>
        <div className="flex items-end justify-between border-t border-border/70 pt-3">
          <div>
            <p className="text-xl font-bold">{czk(vehicle.price)}</p>
            <p className="text-sm text-primary">od {czk(vehicle.monthly)} / měsíc</p>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {vehicle.dealer}
            <br />
            {vehicle.city}
          </p>
        </div>
      </div>
    </article>
  );
}
