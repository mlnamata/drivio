import { Check as CheckIcon, ChevronDown, RotateCcw, Search } from "lucide-react";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  bodyTypes,
  brandBySlug,
  brands,
  ccmSteps,
  climateLevels,
  colors,
  conditions,
  doorOptions,
  drives,
  emissionClasses,
  equipment,
  equipmentGroups,
  fuels,
  gearboxes,
  interiorColors,
  interiorMaterials,
  kmSteps,
  labelOf,
  listedOptions,
  monthlySteps,
  ownerOptions,
  powerSteps,
  priceSteps,
  rangeSteps,
  regions,
  seatOptions,
  stkOptions,
  yearsRange,
} from "@/lib/catalog";
import { num } from "@/lib/mock-data";
import { activeFilterCount, type ListingSearch } from "@/lib/search";
import { cn } from "@/lib/utils";

type Patch = Partial<ListingSearch>;
type Props = {
  value: ListingSearch;
  onChange: (patch: Patch) => void;
  onReset: () => void;
};

/* ------------------------------------------------------------------ primitivy */

const CompactCtx = createContext(false);

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-[13px] font-semibold text-foreground/80">{children}</p>;
}

function NumSelect({
  label,
  value,
  options,
  fmt,
  onChange,
}: {
  label: string;
  value: number | undefined;
  options: readonly number[];
  fmt: (n: number) => string;
  onChange: (v: number | undefined) => void;
}) {
  const compact = useContext(CompactCtx);
  return (
    <select
      aria-label={label}
      className={cn("field", compact && "py-2")}
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

function Range({
  label,
  from,
  to,
  options,
  fmt,
  onFrom,
  onTo,
}: {
  label: string;
  from: number | undefined;
  to: number | undefined;
  options: readonly number[];
  fmt: (n: number) => string;
  onFrom: (v: number | undefined) => void;
  onTo: (v: number | undefined) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <NumSelect label="od" value={from} options={options} fmt={fmt} onChange={onFrom} />
        <NumSelect label="do" value={to} options={options} fmt={fmt} onChange={onTo} />
      </div>
    </div>
  );
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
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
        active
          ? "border-primary bg-primary/10 font-semibold text-primary"
          : "border-border bg-card hover:border-foreground/30",
      )}
    >
      {active ? <CheckIcon className="h-3.5 w-3.5" /> : null}
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
    <label className="flex cursor-pointer items-start gap-2.5 py-1 text-sm leading-snug">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[var(--primary)]"
      />
      <span>{label}</span>
    </label>
  );
}

function Swatches({
  list,
  value,
  onToggle,
}: {
  list: readonly { value: string; label: string; hex: string }[];
  value: string[] | undefined;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2.5">
      {list.map((c) => {
        const active = !!value?.includes(c.value);
        return (
          <button
            key={c.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(c.value)}
            className="group flex w-14 flex-col items-center gap-1 text-[11px] text-muted-foreground"
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border transition",
                active
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "border-black/15 group-hover:scale-105 dark:border-white/25",
              )}
              style={{ backgroundColor: c.hex }}
            >
              {active ? (
                <CheckIcon
                  className={cn(
                    "h-4 w-4",
                    ["#f8fafc", "#f4f4f5", "#eab308", "#d6c3a1", "#cbd5e1"].includes(c.hex)
                      ? "text-black"
                      : "text-white",
                  )}
                />
              ) : null}
            </span>
            <span className={cn(active && "font-semibold text-foreground")}>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const toggleIn = (list: string[] | undefined, v: string) => {
  const cur = list ?? [];
  const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  return next.length ? next : undefined;
};

const kw = (n: number) => `${n} kW (${Math.round(n * 1.36)} k)`;
const czkFmt = (n: number) => `${num(n)} Kč`;
const kmFmt = (n: number) => `${num(n)} km`;
const regionLabel = (r: string) => (r === "Praha" ? "Hlavní město Praha" : `${r} kraj`);

/** Výbava, která se zobrazuje v sekci Historie / Nabídka, ne mezi výbavou. */
const HISTORY_EQ = ["nekurak", "garazovane", "servis-znacka"];
const OFFER_EQ = ["zaruka", "doruceni", "protiucet"];

/* ------------------------------------------------------------------ boční panel */

function Group({
  title,
  children,
  defaultOpen = true,
  count = 0,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen || count > 0);
  return (
    <div className="border-b border-border py-3.5 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-sm font-semibold"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {title}
          {count ? (
            <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="mt-3 space-y-3">{children}</div> : null}
    </div>
  );
}

/** Kompaktní filtry v levém sloupci výpisu (nejpoužívanější parametry). */
export function ListingFilters({
  value: s,
  onChange,
  onReset,
  footer,
}: Props & { footer?: ReactNode }) {
  const models = s.brand ? (brandBySlug(s.brand)?.models ?? []) : [];
  const active = activeFilterCount(s);

  return (
    <CompactCtx.Provider value>
      <div className="flex items-center justify-between pb-1">
        <p className="font-display text-base font-bold">Filtry</p>
        <button
          type="button"
          onClick={onReset}
          disabled={!active}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:cursor-default disabled:text-muted-foreground disabled:no-underline"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Zrušit vše
        </button>
      </div>

      <Group title="Značka a model" count={(s.brand ? 1 : 0) + (s.model ? 1 : 0)}>
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
          <option value="">{s.brand ? "Všechny modely" : "Nejdřív vyberte značku"}</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Cena" count={+!!s.priceFrom + +!!s.priceTo + +!!s.monthlyTo + +!!s.vat}>
        <div className="grid grid-cols-2 gap-2">
          <NumSelect
            label="Od"
            value={s.priceFrom}
            options={priceSteps}
            fmt={czkFmt}
            onChange={(v) => onChange({ priceFrom: v })}
          />
          <NumSelect
            label="Do"
            value={s.priceTo}
            options={priceSteps}
            fmt={czkFmt}
            onChange={(v) => onChange({ priceTo: v })}
          />
        </div>
        <NumSelect
          label="Měsíční splátka do"
          value={s.monthlyTo}
          options={monthlySteps}
          fmt={(n) => `splátka do ${num(n)} Kč`}
          onChange={(v) => onChange({ monthlyTo: v })}
        />
        <Check
          checked={!!s.vat}
          onChange={() => onChange({ vat: !s.vat || undefined })}
          label="Možnost odpočtu DPH"
        />
      </Group>

      <Group title="Rok výroby" count={+!!s.yearFrom + +!!s.yearTo}>
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

      <Group title="Najeto" count={+!!s.kmFrom + +!!s.kmTo}>
        <div className="grid grid-cols-2 gap-2">
          <NumSelect
            label="Od"
            value={s.kmFrom}
            options={kmSteps}
            fmt={kmFmt}
            onChange={(v) => onChange({ kmFrom: v })}
          />
          <NumSelect
            label="Do"
            value={s.kmTo}
            options={kmSteps}
            fmt={kmFmt}
            onChange={(v) => onChange({ kmTo: v })}
          />
        </div>
      </Group>

      <Group title="Palivo" count={s.fuel?.length ?? 0}>
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

      <Group title="Převodovka" count={+!!s.gearbox}>
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
      </Group>

      <Group title="Karoserie" count={s.body?.length ?? 0} defaultOpen={false}>
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

      <Group title="Výkon" count={+!!s.powerFrom + +!!s.powerTo} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <NumSelect
            label="Od"
            value={s.powerFrom}
            options={powerSteps}
            fmt={kw}
            onChange={(v) => onChange({ powerFrom: v })}
          />
          <NumSelect
            label="Do"
            value={s.powerTo}
            options={powerSteps}
            fmt={kw}
            onChange={(v) => onChange({ powerTo: v })}
          />
        </div>
      </Group>

      <Group title="Prodejce a lokalita" count={+!!s.seller + +!!s.region} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["dealer", "Autobazar"],
              ["private", "Soukromý"],
            ] as const
          ).map(([v, l]) => (
            <Chip
              key={v}
              active={s.seller === v}
              onClick={() => onChange({ seller: s.seller === v ? undefined : v })}
            >
              {l}
            </Chip>
          ))}
        </div>
        <select
          aria-label="Kraj"
          className="field py-2"
          value={s.region ?? ""}
          onChange={(e) => onChange({ region: e.target.value || undefined })}
        >
          <option value="">Celá ČR</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {regionLabel(r)}
            </option>
          ))}
        </select>
      </Group>

      <Group
        title="Ověření"
        count={+!!s.cebia + +!!s.accidentFree + +!!s.serviceBook}
        defaultOpen={false}
      >
        <Check
          checked={!!s.cebia}
          onChange={() => onChange({ cebia: !s.cebia || undefined })}
          label="Historie ověřená Cebia"
        />
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

      {footer ? <div className="pt-3">{footer}</div> : null}
    </CompactCtx.Provider>
  );
}

/* ------------------------------------------------------------------ podrobné hledání */

type SectionId =
  "zakladni" | "technika" | "exterier" | "interier" | "vybava" | "historie" | "nabidka";

const equipmentInSection = (s: ListingSearch, list: string[]) =>
  (s.equipment ?? []).filter((e) => list.includes(e)).length;

const EXTERIOR_EQ = ["metaliza"];

export function sectionCounts(s: ListingSearch): Record<SectionId, number> {
  const c = (...keys: (keyof ListingSearch)[]) =>
    keys.reduce((n, k) => {
      const v = s[k];
      return n + (Array.isArray(v) ? v.length : v === undefined || v === false ? 0 : 1);
    }, 0);
  const special = [...HISTORY_EQ, ...OFFER_EQ, ...EXTERIOR_EQ];
  return {
    zakladni: c(
      "brand",
      "model",
      "q",
      "condition",
      "body",
      "priceFrom",
      "priceTo",
      "monthlyTo",
      "yearFrom",
      "yearTo",
      "kmFrom",
      "kmTo",
      "vat",
      "priceRating",
    ),
    technika: c(
      "fuel",
      "gearbox",
      "drive",
      "powerFrom",
      "powerTo",
      "ccmFrom",
      "ccmTo",
      "emission",
      "rangeFrom",
      "seatsFrom",
      "doors",
    ),
    exterier: c("color") + equipmentInSection(s, EXTERIOR_EQ),
    interier: c("interior", "interiorColor", "climate"),
    vybava: (s.equipment ?? []).filter((e) => !special.includes(e)).length,
    historie:
      c("accidentFree", "serviceBook", "cebia", "owners", "stk", "origin") +
      equipmentInSection(s, HISTORY_EQ),
    nabidka: c("seller", "dealerRating", "region", "listed") + equipmentInSection(s, OFFER_EQ),
  };
}

const SECTIONS: { id: SectionId; title: string; desc: string }[] = [
  { id: "zakladni", title: "Základní údaje", desc: "Značka, model, cena, rok a nájezd" },
  { id: "technika", title: "Technické údaje", desc: "Motor, palivo, převodovka, emise" },
  { id: "exterier", title: "Exteriér", desc: "Barva a lak" },
  { id: "interier", title: "Interiér", desc: "Čalounění, barva interiéru, klimatizace" },
  { id: "vybava", title: "Výbava", desc: "Bezpečnost, asistenty, komfort, multimédia…" },
  { id: "historie", title: "Historie a stav", desc: "Majitelé, STK, servis, nehody" },
  { id: "nabidka", title: "Nabídka a prodejce", desc: "Typ prodejce, lokalita, stáří inzerátu" },
];

function Section({
  id,
  title,
  desc,
  children,
}: {
  id: SectionId;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`filtr-${id}`}
      className="scroll-mt-4 border-t border-border pt-6 first:border-0 first:pt-0"
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mb-5 text-sm text-muted-foreground">{desc}</p>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Podrobné hledání (jako „Detailsuche“ na mobile.de) – všechny parametry ve skupinách. */
export function DetailedFilters({ value: s, onChange }: Props) {
  const models = s.brand ? (brandBySlug(s.brand)?.models ?? []) : [];
  const counts = sectionCounts(s);
  const [eqQuery, setEqQuery] = useState("");
  const eq = s.equipment;
  const toggleEq = (v: string) => onChange({ equipment: toggleIn(eq, v) });
  const eqGroups = useMemo(() => {
    const q = eqQuery.trim().toLowerCase();
    return equipmentGroups
      .filter((g) => g.id !== "historie")
      .map((g) => ({
        ...g,
        items: q ? g.items.filter((i) => i.label.toLowerCase().includes(q)) : g.items,
      }))
      .filter((g) => g.items.length);
  }, [eqQuery]);
  const historyItems = equipment.filter((e) => HISTORY_EQ.includes(e.value));
  const offerItems = equipment.filter((e) => OFFER_EQ.includes(e.value));

  return (
    <div className="grid gap-8 lg:grid-cols-[190px_1fr]">
      <nav aria-label="Sekce filtrů" className="hidden lg:block">
        <ul className="sticky top-0 space-y-0.5">
          {SECTIONS.map((sec) => (
            <li key={sec.id}>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(`filtr-${sec.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
              >
                {sec.title}
                {counts[sec.id] ? (
                  <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                    {counts[sec.id]}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-8">
        <Section {...SECTIONS[0]!}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Značka</Label>
              <select
                aria-label="Značka"
                className="field"
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
            </div>
            <div>
              <Label>Model</Label>
              <select
                aria-label="Model"
                className="field"
                value={s.model ?? ""}
                disabled={!s.brand}
                onChange={(e) => onChange({ model: e.target.value || undefined })}
              >
                <option value="">{s.brand ? "Všechny modely" : "Nejdřív vyberte značku"}</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Verze, motorizace nebo klíčové slovo</Label>
              <input
                className="field"
                placeholder="např. TDI, RS, Laurin & Klement"
                value={s.q ?? ""}
                onChange={(e) => onChange({ q: e.target.value || undefined })}
              />
            </div>
          </div>
          <div>
            <Label>Stav vozu</Label>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c) => (
                <Chip
                  key={c.value}
                  active={!!s.condition?.includes(c.value)}
                  onClick={() => onChange({ condition: toggleIn(s.condition, c.value) })}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Karoserie</Label>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Range
              label="Cena"
              from={s.priceFrom}
              to={s.priceTo}
              options={priceSteps}
              fmt={czkFmt}
              onFrom={(v) => onChange({ priceFrom: v })}
              onTo={(v) => onChange({ priceTo: v })}
            />
            <div>
              <Label>Měsíční splátka</Label>
              <NumSelect
                label="Bez omezení"
                value={s.monthlyTo}
                options={monthlySteps}
                fmt={(n) => `do ${num(n)} Kč / měs.`}
                onChange={(v) => onChange({ monthlyTo: v })}
              />
            </div>
            <Range
              label="Rok výroby"
              from={s.yearFrom}
              to={s.yearTo}
              options={yearsRange}
              fmt={String}
              onFrom={(v) => onChange({ yearFrom: v })}
              onTo={(v) => onChange({ yearTo: v })}
            />
            <Range
              label="Najeto"
              from={s.kmFrom}
              to={s.kmTo}
              options={kmSteps}
              fmt={kmFmt}
              onFrom={(v) => onChange({ kmFrom: v })}
              onTo={(v) => onChange({ kmTo: v })}
            />
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Check
              checked={!!s.vat}
              onChange={() => onChange({ vat: !s.vat || undefined })}
              label="Možnost odpočtu DPH"
            />
            <Check
              checked={!!s.priceRating}
              onChange={() => onChange({ priceRating: !s.priceRating || undefined })}
              label="Jen výhodná a dobrá cena"
            />
          </div>
        </Section>

        <Section {...SECTIONS[1]!}>
          <div>
            <Label>Palivo</Label>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Převodovka</Label>
              <div className="flex flex-wrap gap-1.5">
                {gearboxes.map((g) => (
                  <Chip
                    key={g.value}
                    active={s.gearbox === g.value}
                    onClick={() =>
                      onChange({ gearbox: s.gearbox === g.value ? undefined : g.value })
                    }
                  >
                    {g.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Pohon</Label>
              <div className="flex flex-wrap gap-1.5">
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
            </div>
            <Range
              label="Výkon"
              from={s.powerFrom}
              to={s.powerTo}
              options={powerSteps}
              fmt={kw}
              onFrom={(v) => onChange({ powerFrom: v })}
              onTo={(v) => onChange({ powerTo: v })}
            />
            <Range
              label="Objem motoru"
              from={s.ccmFrom}
              to={s.ccmTo}
              options={ccmSteps}
              fmt={(n) => `${num(n)} cm³`}
              onFrom={(v) => onChange({ ccmFrom: v })}
              onTo={(v) => onChange({ ccmTo: v })}
            />
            <div>
              <Label>Emisní norma (alespoň)</Label>
              <select
                aria-label="Emisní norma"
                className="field"
                value={s.emission ?? ""}
                onChange={(e) => onChange({ emission: e.target.value || undefined })}
              >
                <option value="">Libovolná</option>
                {emissionClasses.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Dojezd elektromobilu (WLTP)</Label>
              <NumSelect
                label="Libovolný"
                value={s.rangeFrom}
                options={rangeSteps}
                fmt={(n) => `alespoň ${n} km`}
                onChange={(v) => onChange({ rangeFrom: v })}
              />
            </div>
            <div>
              <Label>Počet míst</Label>
              <div className="flex flex-wrap gap-1.5">
                {seatOptions.map((n) => (
                  <Chip
                    key={n}
                    active={s.seatsFrom === n}
                    onClick={() => onChange({ seatsFrom: s.seatsFrom === n ? undefined : n })}
                  >
                    od {n}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Počet dveří</Label>
              <div className="flex flex-wrap gap-1.5">
                {doorOptions.map((d) => (
                  <Chip
                    key={d.value}
                    active={s.doors === d.value}
                    onClick={() => onChange({ doors: s.doors === d.value ? undefined : d.value })}
                  >
                    {d.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section {...SECTIONS[2]!}>
          <div>
            <Label>Barva karoserie</Label>
            <Swatches
              list={colors}
              value={s.color}
              onToggle={(v) => onChange({ color: toggleIn(s.color, v) })}
            />
          </div>
          <Check
            checked={!!eq?.includes("metaliza")}
            onChange={() => toggleEq("metaliza")}
            label="Metalický lak"
          />
        </Section>

        <Section {...SECTIONS[3]!}>
          <div>
            <Label>Čalounění</Label>
            <div className="flex flex-wrap gap-1.5">
              {interiorMaterials.map((m) => (
                <Chip
                  key={m.value}
                  active={!!s.interior?.includes(m.value)}
                  onClick={() => onChange({ interior: toggleIn(s.interior, m.value) })}
                >
                  {m.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Barva interiéru</Label>
            <Swatches
              list={interiorColors}
              value={s.interiorColor}
              onToggle={(v) => onChange({ interiorColor: toggleIn(s.interiorColor, v) })}
            />
          </div>
          <div>
            <Label>Klimatizace (alespoň)</Label>
            <div className="flex flex-wrap gap-1.5">
              {climateLevels.map((c) => (
                <Chip
                  key={c.value}
                  active={s.climate === c.value}
                  onClick={() => onChange({ climate: s.climate === c.value ? undefined : c.value })}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
        </Section>

        <Section {...SECTIONS[4]!}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={eqQuery}
              onChange={(e) => setEqQuery(e.target.value)}
              placeholder="Hledat ve výbavě, např. „vyhřívaný volant“"
              className="field pl-9"
              aria-label="Hledat ve výbavě"
            />
          </div>
          {eqGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Žádná položka výbavy neodpovídá.</p>
          ) : (
            eqGroups.map((g) => {
              const selected = g.items.filter((i) => eq?.includes(i.value)).length;
              return (
                <div key={g.id}>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    {g.label}
                    {selected ? (
                      <span className="text-xs font-medium text-primary">vybráno {selected}</span>
                    ) : null}
                  </p>
                  <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                    {g.items.map((i) => (
                      <Check
                        key={i.value}
                        checked={!!eq?.includes(i.value)}
                        onChange={() => toggleEq(i.value)}
                        label={i.label}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Section>

        <Section {...SECTIONS[5]!}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Počet majitelů</Label>
              <div className="flex flex-wrap gap-1.5">
                {ownerOptions.map((n) => (
                  <Chip
                    key={n}
                    active={s.owners === n}
                    onClick={() => onChange({ owners: s.owners === n ? undefined : n })}
                  >
                    {n === 1 ? "První majitel" : `nejvýše ${n}`}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Technická kontrola (STK)</Label>
              <select
                aria-label="Platnost STK"
                className="field"
                value={s.stk ?? ""}
                onChange={(e) =>
                  onChange({ stk: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              >
                <option value="">Nerozhoduje</option>
                {stkOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Původ vozu</Label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["cz", "Původem z ČR"],
                    ["import", "Dovoz"],
                  ] as const
                ).map(([v, l]) => (
                  <Chip
                    key={v}
                    active={s.origin === v}
                    onClick={() => onChange({ origin: s.origin === v ? undefined : v })}
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
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
            <Check
              checked={!!s.cebia}
              onChange={() => onChange({ cebia: !s.cebia || undefined })}
              label="Historie ověřená Cebia"
            />
            {historyItems.map((i) => (
              <Check
                key={i.value}
                checked={!!eq?.includes(i.value)}
                onChange={() => toggleEq(i.value)}
                label={i.label}
              />
            ))}
          </div>
        </Section>

        <Section {...SECTIONS[6]!}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Prodejce</Label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["dealer", "Autobazar"],
                    ["private", "Soukromý prodejce"],
                  ] as const
                ).map(([v, l]) => (
                  <Chip
                    key={v}
                    active={s.seller === v}
                    onClick={() => onChange({ seller: s.seller === v ? undefined : v })}
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Hodnocení autobazaru</Label>
              <div className="flex flex-wrap gap-1.5">
                {[4, 4.5, 4.8].map((r) => (
                  <Chip
                    key={r}
                    active={s.dealerRating === r}
                    onClick={() => onChange({ dealerRating: s.dealerRating === r ? undefined : r })}
                  >
                    od {r.toLocaleString("cs-CZ")} ★
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Kraj</Label>
              <select
                aria-label="Kraj"
                className="field"
                value={s.region ?? ""}
                onChange={(e) => onChange({ region: e.target.value || undefined })}
              >
                <option value="">Celá ČR</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {regionLabel(r)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Inzerát vložen</Label>
              <select
                aria-label="Stáří inzerátu"
                className="field"
                value={s.listed ?? ""}
                onChange={(e) =>
                  onChange({ listed: e.target.value ? Number(e.target.value) : undefined })
                }
              >
                <option value="">Kdykoli</option>
                {listedOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
            {offerItems.map((i) => (
              <Check
                key={i.value}
                checked={!!eq?.includes(i.value)}
                onChange={() => toggleEq(i.value)}
                label={i.label}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ štítky aktivních filtrů */

export type FilterChip = { key: string; label: string; patch: Patch };

const range = (from: number | undefined, to: number | undefined, fmt: (n: number) => string) =>
  from && to ? `${fmt(from)} – ${fmt(to)}` : from ? `od ${fmt(from)}` : to ? `do ${fmt(to)}` : "";

export function filterChips(s: ListingSearch): FilterChip[] {
  const out: FilterChip[] = [];
  const push = (key: string, label: string, patch: Patch) => out.push({ key, label, patch });
  const list = <K extends keyof ListingSearch>(key: K, labelFn: (v: string) => string) => {
    const arr = s[key] as string[] | undefined;
    arr?.forEach((v) =>
      push(`${String(key)}-${v}`, labelFn(v), { [key]: arr.filter((x) => x !== v) } as Patch),
    );
  };

  if (s.q) push("q", `„${s.q}“`, { q: undefined });
  if (s.brand)
    push("brand", brandBySlug(s.brand)?.name ?? s.brand, { brand: undefined, model: undefined });
  if (s.model) push("model", s.model, { model: undefined });
  list("condition", (v) => labelOf(conditions, v));
  list("body", (v) => labelOf(bodyTypes, v));
  if (s.priceFrom || s.priceTo)
    push("price", `Cena ${range(s.priceFrom, s.priceTo, czkFmt)}`, {
      priceFrom: undefined,
      priceTo: undefined,
    });
  if (s.monthlyTo) push("mt", `Splátka do ${num(s.monthlyTo)} Kč`, { monthlyTo: undefined });
  if (s.yearFrom || s.yearTo)
    push("year", `Rok ${range(s.yearFrom, s.yearTo, String)}`, {
      yearFrom: undefined,
      yearTo: undefined,
    });
  if (s.kmFrom || s.kmTo)
    push("km", `Najeto ${range(s.kmFrom, s.kmTo, kmFmt)}`, { kmFrom: undefined, kmTo: undefined });
  if (s.vat) push("vat", "Odpočet DPH", { vat: undefined });
  if (s.priceRating) push("pr", "Výhodná cena", { priceRating: undefined });
  list("fuel", (v) => labelOf(fuels, v));
  if (s.gearbox) push("g", labelOf(gearboxes, s.gearbox), { gearbox: undefined });
  if (s.drive) push("d", `Pohon ${labelOf(drives, s.drive).toLowerCase()}`, { drive: undefined });
  if (s.powerFrom || s.powerTo)
    push("pw", `Výkon ${range(s.powerFrom, s.powerTo, (n) => `${n} kW`)}`, {
      powerFrom: undefined,
      powerTo: undefined,
    });
  if (s.ccmFrom || s.ccmTo)
    push("ccm", `Objem ${range(s.ccmFrom, s.ccmTo, (n) => `${num(n)} cm³`)}`, {
      ccmFrom: undefined,
      ccmTo: undefined,
    });
  if (s.emission)
    push("em", `Alespoň ${labelOf(emissionClasses, s.emission)}`, { emission: undefined });
  if (s.rangeFrom) push("rg", `Dojezd od ${s.rangeFrom} km`, { rangeFrom: undefined });
  if (s.seatsFrom) push("st", `Od ${s.seatsFrom} míst`, { seatsFrom: undefined });
  if (s.doors)
    push("dr", doorOptions.find((d) => d.value === s.doors)?.label ?? `${s.doors} dveří`, {
      doors: undefined,
    });
  list("color", (v) => labelOf(colors, v));
  list("interior", (v) => `Čalounění: ${labelOf(interiorMaterials, v).toLowerCase()}`);
  list("interiorColor", (v) => `Interiér ${labelOf(interiorColors, v).toLowerCase()}`);
  if (s.climate)
    push("cl", `Klimatizace: ${labelOf(climateLevels, s.climate).toLowerCase()} a lepší`, {
      climate: undefined,
    });
  list("equipment", (v) => labelOf(equipment, v));
  if (s.accidentFree) push("af", "Nehavarované", { accidentFree: undefined });
  if (s.serviceBook) push("sb", "Servisní knížka", { serviceBook: undefined });
  if (s.cebia) push("cb", "Ověřeno Cebia", { cebia: undefined });
  if (s.owners)
    push("ow", s.owners === 1 ? "První majitel" : `Nejvýše ${s.owners} majitelé`, {
      owners: undefined,
    });
  if (s.stk !== undefined)
    push("stk", s.stk ? `STK ještě ${s.stk} měsíců` : "Platná STK", { stk: undefined });
  if (s.origin) push("or", s.origin === "cz" ? "Původ ČR" : "Dovoz", { origin: undefined });
  if (s.seller)
    push("sl", s.seller === "dealer" ? "Autobazar" : "Soukromý prodejce", { seller: undefined });
  if (s.dealerRating)
    push("dr-r", `Hodnocení od ${s.dealerRating.toLocaleString("cs-CZ")} ★`, {
      dealerRating: undefined,
    });
  if (s.region) push("r", regionLabel(s.region), { region: undefined });
  if (s.listed)
    push("ls", listedOptions.find((o) => o.value === s.listed)?.label ?? "Nové inzeráty", {
      listed: undefined,
    });
  return out;
}
