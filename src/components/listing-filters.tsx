import { ChevronDown, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  bodyTypes,
  brandBySlug,
  brands,
  colors,
  drives,
  equipment,
  fuels,
  gearboxes,
  kmSteps,
  priceSteps,
  regions,
  yearsRange,
} from "@/lib/catalog";
import { num } from "@/lib/mock-data";
import type { ListingSearch } from "@/lib/search";
import { cn } from "@/lib/utils";

type Props = {
  value: ListingSearch;
  onChange: (patch: Partial<ListingSearch>) => void;
  onReset: () => void;
};

function Group({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function NumSelect({
  label,
  value,
  options,
  fmt,
  onChange,
}: {
  label: string;
  value?: number | undefined;
  options: number[];
  fmt: (n: number) => string;
  onChange: (v?: number) => void;
}) {
  return (
    <select
      aria-label={label}
      className="field py-2"
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

function toggleIn(list: string[] | undefined, v: string) {
  const cur = list ?? [];
  const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  return next.length ? next : undefined;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-input accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}

export function ListingFilters({ value: s, onChange, onReset }: Props) {
  const models = s.brand ? (brandBySlug(s.brand)?.models ?? []) : [];

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="font-display text-lg font-bold">Filtry</p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Zrušit vše
        </button>
      </div>

      <Group title="Značka a model">
        <div className="space-y-2">
          <select
            aria-label="Značka"
            className="field py-2"
            value={s.brand ?? ""}
            onChange={(e) => onChange({ brand: e.target.value || undefined, model: undefined })}
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
            className="field py-2"
            value={s.model ?? ""}
            disabled={!s.brand}
            onChange={(e) => onChange({ model: e.target.value || undefined })}
          >
            <option value="">Všechny modely</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </Group>

      <Group title="Cena">
        <div className="grid grid-cols-2 gap-2">
          <NumSelect
            label="Od"
            value={s.priceFrom}
            options={priceSteps}
            fmt={(n) => `${num(n)} Kč`}
            onChange={(v) => onChange({ priceFrom: v })}
          />
          <NumSelect
            label="Do"
            value={s.priceTo}
            options={priceSteps}
            fmt={(n) => `${num(n)} Kč`}
            onChange={(v) => onChange({ priceTo: v })}
          />
        </div>
        <div className="mt-2">
          <NumSelect
            label="Měsíční splátka do"
            value={s.monthlyTo}
            options={[1500, 2500, 3500, 5000, 7500, 10000, 15000]}
            fmt={(n) => `splátka do ${num(n)} Kč/měs.`}
            onChange={(v) => onChange({ monthlyTo: v })}
          />
        </div>
        <div className="mt-3">
          <Check
            checked={!!s.vat}
            onChange={() => onChange({ vat: !s.vat || undefined })}
            label="Možnost odpočtu DPH"
          />
        </div>
      </Group>

      <Group title="Rok výroby">
        <div className="grid grid-cols-2 gap-2">
          <NumSelect
            label="Od"
            value={s.yearFrom}
            options={yearsRange}
            fmt={String}
            onChange={(v) => onChange({ yearFrom: v })}
          />
          <NumSelect
            label="Do"
            value={s.yearTo}
            options={yearsRange}
            fmt={String}
            onChange={(v) => onChange({ yearTo: v })}
          />
        </div>
      </Group>

      <Group title="Najeto">
        <NumSelect
          label="Najeto do"
          value={s.kmTo}
          options={kmSteps}
          fmt={(n) => `do ${num(n)} km`}
          onChange={(v) => onChange({ kmTo: v })}
        />
      </Group>

      <Group title="Palivo">
        <div className="flex flex-wrap gap-1.5">
          {fuels.map((f) => (
            <Chip
              key={f.value}
              active={!!s.fuel?.includes(f.value)}
              onClick={() => onChange({ fuel: toggleIn(s.fuel, f.value) })}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Karoserie">
        <div className="flex flex-wrap gap-1.5">
          {bodyTypes.map((b) => (
            <Chip
              key={b.value}
              active={!!s.body?.includes(b.value)}
              onClick={() => onChange({ body: toggleIn(s.body, b.value) })}
            >
              {b.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Převodovka a pohon">
        <div className="flex flex-wrap gap-1.5">
          {gearboxes.map((g) => (
            <Chip
              key={g.value}
              active={s.gearbox === g.value}
              onClick={() => onChange({ gearbox: s.gearbox === g.value ? undefined : g.value })}
            >
              {g.label}
            </Chip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {drives.map((d) => (
            <Chip
              key={d.value}
              active={s.drive === d.value}
              onClick={() => onChange({ drive: s.drive === d.value ? undefined : d.value })}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Výkon" defaultOpen={false}>
        <NumSelect
          label="Výkon od"
          value={s.powerFrom}
          options={[50, 70, 85, 100, 125, 150, 200, 250]}
          fmt={(n) => `od ${n} kW (${Math.round(n * 1.36)} k)`}
          onChange={(v) => onChange({ powerFrom: v })}
        />
      </Group>

      <Group title="Barva" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const active = !!s.color?.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                title={c.label}
                aria-label={c.label}
                aria-pressed={active}
                onClick={() => onChange({ color: toggleIn(s.color, c.value) })}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                  active ? "border-primary ring-2 ring-primary/30" : "border-border",
                )}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </Group>

      <Group title="Výbava" defaultOpen={false}>
        {equipment.map((e) => (
          <Check
            key={e.value}
            checked={!!s.equipment?.includes(e.value)}
            onChange={() => onChange({ equipment: toggleIn(s.equipment, e.value) })}
            label={e.label}
          />
        ))}
      </Group>

      <Group title="Prodejce">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              [undefined, "Všichni"],
              ["dealer", "Autobazar"],
              ["private", "Soukromý"],
            ] as const
          ).map(([v, l]) => (
            <Chip key={l} active={s.seller === v} onClick={() => onChange({ seller: v })}>
              {l}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Ověření a cena">
        <Check
          checked={!!s.cebia}
          onChange={() => onChange({ cebia: !s.cebia || undefined })}
          label="Ověřená historie (Cebia)"
        />
        <Check
          checked={!!s.priceRating}
          onChange={() => onChange({ priceRating: !s.priceRating || undefined })}
          label="Jen výhodná a dobrá cena"
        />
      </Group>

      <Group title="Stav a historie" defaultOpen={false}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(
            [
              [undefined, "Vše"],
              ["cz", "Původ ČR"],
              ["import", "Dovoz"],
            ] as const
          ).map(([v, l]) => (
            <Chip key={l} active={s.origin === v} onClick={() => onChange({ origin: v })}>
              {l}
            </Chip>
          ))}
        </div>
        <Check
          checked={!!s.accidentFree}
          onChange={() => onChange({ accidentFree: !s.accidentFree || undefined })}
          label="Nehavarované"
        />
        <Check
          checked={!!s.serviceBook}
          onChange={() => onChange({ serviceBook: !s.serviceBook || undefined })}
          label="Servisní knížka"
        />
      </Group>

      <Group title="Dveře a místa" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {[3, 4, 5].map((d) => (
            <Chip
              key={d}
              active={s.doors === d}
              onClick={() => onChange({ doors: s.doors === d ? undefined : d })}
            >
              {d} dveře
            </Chip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[2, 5, 7].map((n) => (
            <Chip
              key={n}
              active={s.seatsFrom === n}
              onClick={() => onChange({ seatsFrom: s.seatsFrom === n ? undefined : n })}
            >
              od {n} míst
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Lokalita" defaultOpen={false}>
        <select
          aria-label="Kraj"
          className="field py-2"
          value={s.region ?? ""}
          onChange={(e) => onChange({ region: e.target.value || undefined })}
        >
          <option value="">Celá ČR</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r === "Praha" ? "Hlavní město Praha" : `${r} kraj`}
            </option>
          ))}
        </select>
      </Group>
    </div>
  );
}
