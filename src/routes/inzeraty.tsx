import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BellRing, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { ListingFilters } from "@/components/listing-filters";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  bodyTypes,
  brandBySlug,
  colors,
  drives,
  equipment,
  fuels,
  gearboxes,
  labelOf,
} from "@/lib/catalog";
import { dealerById, num } from "@/lib/mock-data";
import {
  cleanSearch,
  filterVehicles,
  listingSearchSchema,
  PAGE_SIZE,
  type ListingSearch,
} from "@/lib/search";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inzeraty")({
  validateSearch: (s) => listingSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Ojetá auta na prodej | Drivio" },
      {
        name: "description",
        content:
          "Vyhledávání ojetých aut podle značky, modelu, ceny, roku, paliva, karoserie i výbavy. Cena i měsíční splátka u každého vozu.",
      },
      { property: "og:title", content: "Ojetá auta na prodej | Drivio" },
    ],
  }),
  component: Listings,
});

const sortOptions: { value: NonNullable<ListingSearch["sort"]>; label: string }[] = [
  { value: "newest", label: "Nejnovější inzeráty" },
  { value: "price-asc", label: "Nejlevnější" },
  { value: "price-desc", label: "Nejdražší" },
  { value: "km-asc", label: "Nejméně najeto" },
  { value: "year-desc", label: "Nejmladší" },
];

function activeChips(
  s: ListingSearch,
): { key: string; label: string; patch: Partial<ListingSearch> }[] {
  const out: { key: string; label: string; patch: Partial<ListingSearch> }[] = [];
  if (s.q) out.push({ key: "q", label: `„${s.q}"`, patch: { q: undefined } });
  if (s.brand)
    out.push({
      key: "brand",
      label: brandBySlug(s.brand)?.name ?? s.brand,
      patch: { brand: undefined, model: undefined },
    });
  if (s.model) out.push({ key: "model", label: s.model, patch: { model: undefined } });
  if (s.priceFrom)
    out.push({ key: "pf", label: `od ${num(s.priceFrom)} Kč`, patch: { priceFrom: undefined } });
  if (s.priceTo)
    out.push({ key: "pt", label: `do ${num(s.priceTo)} Kč`, patch: { priceTo: undefined } });
  if (s.yearFrom)
    out.push({ key: "yf", label: `rok od ${s.yearFrom}`, patch: { yearFrom: undefined } });
  if (s.yearTo) out.push({ key: "yt", label: `rok do ${s.yearTo}`, patch: { yearTo: undefined } });
  if (s.kmTo) out.push({ key: "km", label: `do ${num(s.kmTo)} km`, patch: { kmTo: undefined } });
  if (s.powerFrom)
    out.push({ key: "pw", label: `od ${s.powerFrom} kW`, patch: { powerFrom: undefined } });
  s.fuel?.forEach((f) =>
    out.push({
      key: `f-${f}`,
      label: labelOf(fuels, f),
      patch: { fuel: s.fuel!.filter((x) => x !== f) },
    }),
  );
  s.body?.forEach((b) =>
    out.push({
      key: `b-${b}`,
      label: labelOf(bodyTypes, b),
      patch: { body: s.body!.filter((x) => x !== b) },
    }),
  );
  s.color?.forEach((c) =>
    out.push({
      key: `c-${c}`,
      label: labelOf(colors, c),
      patch: { color: s.color!.filter((x) => x !== c) },
    }),
  );
  s.equipment?.forEach((e) =>
    out.push({
      key: `e-${e}`,
      label: labelOf(equipment, e),
      patch: { equipment: s.equipment!.filter((x) => x !== e) },
    }),
  );
  if (s.gearbox)
    out.push({ key: "g", label: labelOf(gearboxes, s.gearbox), patch: { gearbox: undefined } });
  if (s.drive) out.push({ key: "d", label: labelOf(drives, s.drive), patch: { drive: undefined } });
  if (s.region) out.push({ key: "r", label: s.region, patch: { region: undefined } });
  if (s.vat) out.push({ key: "vat", label: "Odpočet DPH", patch: { vat: undefined } });
  if (s.accidentFree)
    out.push({ key: "af", label: "Nehavarované", patch: { accidentFree: undefined } });
  if (s.serviceBook)
    out.push({ key: "sb", label: "Servisní knížka", patch: { serviceBook: undefined } });
  return out;
}

function Listings() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/inzeraty" });

  const update = (patch: Partial<ListingSearch>, keepPage = false) =>
    void navigate({
      search: (prev) =>
        cleanSearch({ ...prev, ...patch, ...(keepPage ? {} : { page: undefined }) }),
      replace: true,
      resetScroll: false,
    });
  const reset = () => void navigate({ search: { category: search.category }, replace: true });

  const all = useMemo(() => filterVehicles(search, (v) => dealerById(v.dealerId).region), [search]);
  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const list = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const chips = activeChips(search);
  const view = search.view ?? "grid";
  const brand = search.brand ? brandBySlug(search.brand) : undefined;
  const heading = brand
    ? `${brand.name}${search.model ? ` ${search.model}` : ""} – ojetá auta`
    : search.category === "uzitkove"
      ? "Užitková vozidla"
      : "Ojetá auta na prodej";

  const filters = <ListingFilters value={search} onChange={(p) => update(p)} onReset={reset} />;

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Inzeráty" }]} />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">{heading}</h1>
            <p className="mt-1 text-muted-foreground">
              {num(all.length)} vozů odpovídá vašemu hledání
            </p>
          </div>
          <input
            defaultValue={search.q}
            onKeyDown={(e) => {
              if (e.key === "Enter") update({ q: e.currentTarget.value || undefined });
            }}
            placeholder="Hledat např. „octavia dsg“ a Enter"
            className="field md:w-80"
            aria-label="Fulltextové hledání"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <div className="surface-card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto px-5 py-4">
              {filters}
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" /> Filtry{" "}
                    {chips.length ? `(${chips.length})` : ""}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                  <SheetTitle className="sr-only">Filtry</SheetTitle>
                  <div className="pt-6">{filters}</div>
                </SheetContent>
              </Sheet>
              <select
                aria-label="Řazení"
                className="field w-auto py-2"
                value={search.sort ?? "newest"}
                onChange={(e) => update({ sort: e.target.value as ListingSearch["sort"] })}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() =>
                    toast.success("Hlídací pes nastaven", {
                      description: "Nové vozy podle filtru vám pošleme e-mailem.",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/40"
                >
                  <BellRing className="h-4 w-4 text-primary" /> Hlídat
                </button>
                <div className="flex rounded-full border border-border bg-card p-1">
                  {(["grid", "list"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update({ view: v === "grid" ? undefined : v }, true)}
                      className={cn(
                        "rounded-full p-1.5",
                        view === v ? "bg-foreground text-background" : "text-muted-foreground",
                      )}
                      aria-label={v === "grid" ? "Mřížka" : "Seznam"}
                    >
                      {v === "grid" ? (
                        <LayoutGrid className="h-4 w-4" />
                      ) : (
                        <List className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {chips.length ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => update(c.patch)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground hover:bg-accent/70"
                  >
                    {c.label} <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            ) : null}

            {list.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <p className="text-lg font-semibold">Tomuto hledání neodpovídá žádný vůz</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Zkuste uvolnit některé filtry nebo si nastavte hlídacího psa.
                </p>
                <button
                  onClick={reset}
                  className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Zrušit filtry
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-5",
                  view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
                )}
              >
                {list.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} layout={view} />
                ))}
              </div>
            )}

            {pages > 1 ? (
              <nav className="mt-10 flex justify-center gap-1" aria-label="Stránkování">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    to="/inzeraty"
                    search={{ ...search, page: p === 1 ? undefined : p }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                      p === page ? "bg-foreground text-background" : "hover:bg-foreground/5",
                    )}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </Container>
    </Page>
  );
}
