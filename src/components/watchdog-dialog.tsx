import { Link } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { brandBySlug } from "@/lib/catalog";
import { num } from "@/lib/mock-data";
import type { ListingSearch } from "@/lib/search";
import { store } from "@/lib/store";

export function describeSearch(s: ListingSearch) {
  const parts: string[] = [];
  if (s.brand)
    parts.push(`${brandBySlug(s.brand)?.name ?? s.brand}${s.model ? ` ${s.model}` : ""}`);
  if (s.priceTo) parts.push(`do ${num(s.priceTo)} Kč`);
  if (s.yearFrom) parts.push(`od roku ${s.yearFrom}`);
  if (s.kmTo) parts.push(`do ${num(s.kmTo)} km`);
  if (s.fuel?.length) parts.push(s.fuel.join(", "));
  if (s.body?.length) parts.push(s.body.join(", "));
  return parts.length ? parts.join(" · ") : "Všechna auta";
}

/** Uložení hledání jako hlídacího psa (e-mail při novém voze odpovídajícím filtru). */
export function WatchdogDialog({ search }: { search: ListingSearch }) {
  const [open, setOpen] = useState(false);
  const { page: _p, view: _v, sort: _s, ...criteria } = search;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/50">
          <BellRing className="h-4 w-4 text-primary" /> Hlídat
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Hlídací pes</DialogTitle>
        <DialogDescription>
          Pošleme vám e-mail, jakmile se objeví nový vůz odpovídající hledání:{" "}
          <strong className="text-foreground">{describeSearch(criteria)}</strong>
        </DialogDescription>
        <form
          className="mt-2 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            store.saveSearch(
              String(f.get("name") || describeSearch(criteria)),
              criteria,
              String(f.get("email") || ""),
            );
            setOpen(false);
            toast.success("Hlídací pes nastaven", {
              description: "Uložená hledání najdete v sekci Hlídací pes.",
            });
          }}
        >
          <input
            name="name"
            className="field"
            placeholder="Název hledání (nepovinné)"
            defaultValue={describeSearch(criteria)}
          />
          <input name="email" type="email" required className="field" placeholder="Váš e-mail" />
          <p className="text-xs text-muted-foreground">
            Odběr můžete kdykoli zrušit odkazem v e-mailu nebo v sekci{" "}
            <Link to="/hlidaci-pes" className="text-primary underline">
              Hlídací pes
            </Link>
            .
          </p>
          <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Začít hlídat
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
