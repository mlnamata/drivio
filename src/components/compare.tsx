import { Link } from "@tanstack/react-router";
import { GitCompareArrows, X } from "lucide-react";
import { toast } from "sonner";
import { CarImage } from "@/components/car-image";
import { vehicleTitle } from "@/lib/mock-data";
import { MAX_COMPARE, store, useAllVehicles, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CompareButton({ id, className }: { id: string; className?: string }) {
  const { compare } = useStore();
  const active = compare.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!store.toggleCompare(id)) toast.error(`Porovnat lze nejvýše ${MAX_COMPARE} vozy`);
      }}
      aria-pressed={active}
      aria-label={active ? "Odebrat z porovnání" : "Přidat do porovnání"}
      title={active ? "Odebrat z porovnání" : "Porovnat"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105",
        active ? "bg-primary text-primary-foreground" : "glass text-foreground/70",
        className,
      )}
    >
      <GitCompareArrows className="h-4 w-4" />
    </button>
  );
}

/** Plovoucí lišta s vybranými vozy k porovnání. */
export function CompareBar() {
  const { compare } = useStore();
  const all = useAllVehicles();
  const list = compare.map((id) => all.find((v) => v.id === id)).filter((v) => !!v);
  if (list.length === 0) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl">
      <div className="glass flex items-center gap-3 rounded-2xl p-3 shadow-2xl">
        <GitCompareArrows className="ml-1 hidden h-5 w-5 shrink-0 text-primary sm:block" />
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {list.map((v) => (
            <div
              key={v.id}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-card px-2 py-1.5 text-xs font-semibold"
            >
              <span className="h-7 w-10 overflow-hidden rounded-md">
                <CarImage src={v.photos[0]!} alt="" />
              </span>
              <span className="max-w-28 truncate">{vehicleTitle(v)}</span>
              <button onClick={() => store.toggleCompare(v.id)} aria-label="Odebrat">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
        <Link
          to="/porovnani"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-bold",
            list.length > 1
              ? "bg-primary text-primary-foreground"
              : "pointer-events-none bg-muted text-muted-foreground",
          )}
        >
          Porovnat ({list.length})
        </Link>
      </div>
    </div>
  );
}
