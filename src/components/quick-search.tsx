import { Link, useNavigate } from "@tanstack/react-router";
import { Bike, Car, Caravan, Search, SlidersHorizontal, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  brands,
  brandBySlug,
  categories,
  fuels,
  gearboxes,
  kmSteps,
  priceSteps,
  yearsRange,
} from "@/lib/catalog";
import { sellerOf, num } from "@/lib/mock-data";
import { cleanSearch, filterVehicles, type ListingSearch } from "@/lib/search";
import { useVehicles } from "@/lib/store";
import { cn } from "@/lib/utils";

const selectCls = "field appearance-none bg-card pr-8";
const categoryIcons = { osobni: Car, uzitkove: Truck, obytne: Caravan, motorky: Bike } as const;

function NumberSelect({
  label,
  value,
  options,
  fmt,
  onChange,
}: {
  label: string;
  value: number | undefined;
  options: number[];
  fmt: (n: number) => string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <select
      aria-label={label}
      className={selectCls}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {fmt(o)}
        </option>
      ))}
    </select>
  );
}

/** Vyhledávání na úvodní stránce – rozložení podle sauto.cz, skleněný panel. */
export function QuickSearch() {
  const navigate = useNavigate();
  const source = useVehicles();
  const [s, setS] = useState<ListingSearch>({ category: "osobni" });
  const set = (patch: Partial<ListingSearch>) => setS((p) => ({ ...p, ...patch }));
  const count = useMemo(
    () => filterVehicles(source, s, (v) => sellerOf(v).region).length,
    [source, s],
  );
  const models = s.brand ? (brandBySlug(s.brand)?.models ?? []) : [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void navigate({ to: "/inzeraty", search: cleanSearch(s) });
      }}
      className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-lift)] md:p-6"
    >
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {categories.map((c) => {
          const disabled = c.value !== "osobni" && c.value !== "uzitkove";
          const Icon = categoryIcons[c.value];
          return (
            <button
              key={c.value}
              type="button"
              disabled={disabled}
              onClick={() => set({ category: c.value as ListingSearch["category"] })}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                s.category === c.value
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-foreground/5",
                disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              )}
              title={disabled ? "Připravujeme" : undefined}
            >
              <Icon className="h-4 w-4" /> {c.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <select
          aria-label="Značka"
          className={selectCls}
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
        <NumberSelect
          label="Cena od"
          value={s.priceFrom}
          options={priceSteps}
          fmt={(p) => `od ${num(p)} Kč`}
          onChange={(v) => set({ priceFrom: v })}
        />
        <NumberSelect
          label="Cena do"
          value={s.priceTo}
          options={priceSteps}
          fmt={(p) => `do ${num(p)} Kč`}
          onChange={(v) => set({ priceTo: v })}
        />
        <NumberSelect
          label="Vyrobeno od"
          value={s.yearFrom}
          options={yearsRange}
          fmt={(y) => `od ${y}`}
          onChange={(v) => set({ yearFrom: v })}
        />
        <NumberSelect
          label="Najeto do"
          value={s.kmTo}
          options={kmSteps}
          fmt={(k) => `do ${num(k)} km`}
          onChange={(v) => set({ kmTo: v })}
        />
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
        <select
          aria-label="Převodovka"
          className={selectCls}
          value={s.gearbox ?? ""}
          onChange={(e) => set({ gearbox: e.target.value || undefined })}
        >
          <option value="">Převodovka</option>
          {gearboxes.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={!!s.cebia}
              onChange={(e) => set({ cebia: e.target.checked || undefined })}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Ověřená historie (Cebia)
          </label>
          <label className="flex cursor-pointer items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={!!s.vat}
              onChange={(e) => set({ vat: e.target.checked || undefined })}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Odpočet DPH
          </label>
          <Link
            to="/inzeraty"
            search={cleanSearch(s)}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <SlidersHorizontal className="h-4 w-4" /> Další parametry
          </Link>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
        >
          <Search className="h-4 w-4" /> Zobrazit {num(count)} vozů
        </button>
      </div>
    </form>
  );
}
