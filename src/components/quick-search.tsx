import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { brands, brandBySlug, categories, fuels, priceSteps, yearsRange } from "@/lib/catalog";
import { dealerById, num } from "@/lib/mock-data";
import { cleanSearch, filterVehicles, type ListingSearch } from "@/lib/search";
import { cn } from "@/lib/utils";

const selectCls = "field appearance-none bg-card/90 pr-8";

/** Rychlé vyhledávání na úvodní stránce (skleněný panel nad fotkou). */
export function QuickSearch() {
  const navigate = useNavigate();
  const [s, setS] = useState<ListingSearch>({ category: "osobni" });
  const set = (patch: Partial<ListingSearch>) => setS((p) => ({ ...p, ...patch }));
  const count = useMemo(() => filterVehicles(s, (v) => dealerById(v.dealerId).region).length, [s]);
  const models = s.brand ? (brandBySlug(s.brand)?.models ?? []) : [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void navigate({ to: "/inzeraty", search: cleanSearch(s) });
      }}
      className="glass rounded-3xl p-4 md:p-5"
    >
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {categories.map((c) => {
          const disabled = c.value !== "osobni" && c.value !== "uzitkove";
          return (
            <button
              key={c.value}
              type="button"
              disabled={disabled}
              onClick={() => set({ category: c.value as ListingSearch["category"] })}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                s.category === c.value
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-foreground/5",
                disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              )}
              title={disabled ? "Připravujeme" : undefined}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <select
          aria-label="Značka"
          className={cn(selectCls, "lg:col-span-1")}
          value={s.brand ?? ""}
          onChange={(e) => set({ brand: e.target.value || undefined, model: undefined })}
        >
          <option value="">Všechny značky</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Model"
          className={selectCls}
          value={s.model ?? ""}
          disabled={!s.brand}
          onChange={(e) => set({ model: e.target.value || undefined })}
        >
          <option value="">{s.brand ? "Všechny modely" : "Model"}</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Cena do"
          className={selectCls}
          value={s.priceTo ?? ""}
          onChange={(e) => set({ priceTo: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Cena do</option>
          {priceSteps.map((p) => (
            <option key={p} value={p}>
              do {num(p)} Kč
            </option>
          ))}
        </select>
        <select
          aria-label="Rok od"
          className={selectCls}
          value={s.yearFrom ?? ""}
          onChange={(e) => set({ yearFrom: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Rok výroby od</option>
          {yearsRange.map((y) => (
            <option key={y} value={y}>
              od {y}
            </option>
          ))}
        </select>
        <select
          aria-label="Palivo"
          className={selectCls}
          value={s.fuel?.[0] ?? ""}
          onChange={(e) => set({ fuel: e.target.value ? [e.target.value] : undefined })}
        >
          <option value="">Palivo</option>
          {fuels.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
        >
          <Search className="h-4 w-4" /> Zobrazit {num(count)} vozů
        </button>
      </div>
    </form>
  );
}
