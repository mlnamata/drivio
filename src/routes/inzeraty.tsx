import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Flag,
  LayoutGrid,
  List,
  ScanLine,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Fragment, useMemo } from "react";
import { AdSlot } from "@/components/ad-slot";
import { filterChips, ListingFilters } from "@/components/listing-filters";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { FilterDialog } from "@/components/filter-dialog";
import { brandBySlug } from "@/lib/catalog";
import {
  activeFilterCount,
  cleanSearch,
  filterVehicles,
  listingSearchSchema,
  PAGE_SIZE,
  type ListingSearch,
} from "@/lib/search";
import { useVehicles } from "@/lib/store";
import { cars, cn, plural } from "@/lib/utils";
import { WatchdogDialog } from "@/components/watchdog-dialog";

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
  { value: "power-desc", label: "Nejvyšší výkon" },
];

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
  const applyAll = (next: ListingSearch) =>
    void navigate({
      search: { ...next, view: search.view, sort: search.sort },
      replace: true,
      resetScroll: false,
    });

  const source = useVehicles();
  const all = useMemo(() => filterVehicles(source, search), [source, search]);
  const cebiaPct = source.length
    ? Math.round((source.filter((v) => v.cebiaVerified).length / source.length) * 100)
    : 0;
  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const list = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const chips = filterChips(search);
  const active = activeFilterCount(search);
  const view = search.view ?? "grid";
  const brand = search.brand ? brandBySlug(search.brand) : undefined;
  const heading = brand
    ? `${brand.name}${search.model ? ` ${search.model}` : ""} – ojetá auta`
    : search.category === "uzitkove"
      ? "Užitková vozidla"
      : "Ojetá auta na prodej";

  return (
    <Page>
      <Container className="py-6">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Inzeráty" }]} />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold md:text-[2.2rem]">{heading}</h1>
            <p className="mt-1 text-muted-foreground">
              <strong className="font-semibold text-foreground">{cars(all.length)}</strong>{" "}
              {plural(all.length, "odpovídá", "odpovídají", "odpovídá")} vašemu hledání
            </p>
          </div>
          <form
            className="relative md:w-80"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              update({ q: (typeof q === "string" && q.trim()) || undefined });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              key={search.q ?? ""}
              name="q"
              defaultValue={search.q}
              placeholder="Hledat např. „octavia dsg“"
              className="field pl-9"
              aria-label="Fulltextové hledání"
            />
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-foreground/70">
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-success" /> Autobazary ověřené podle IČO
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-success" /> {cebiaPct} % vozů s historií Cebia
          </span>
          <span className="flex items-center gap-1.5">
            <ScanLine className="h-4 w-4 text-success" /> VIN u každého inzerátu
          </span>
          <span className="flex items-center gap-1.5">
            <Flag className="h-4 w-4 text-success" /> Podezřelé inzeráty prověřujeme do 24 h
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="surface-card px-4 py-3">
              <ListingFilters
                value={search}
                onChange={(p) => update(p)}
                onReset={reset}
                footer={
                  <FilterDialog
                    value={search}
                    onApply={applyAll}
                    trigger={
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
                      >
                        <SlidersHorizontal className="h-4 w-4" /> Všechny filtry a výbava
                      </button>
                    }
                  />
                }
              />
            </div>
            <AdSlot format="rectangle" className="mt-5" />
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <FilterDialog value={search} onApply={applyAll} />
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
                <WatchdogDialog search={search} />
                <div className="flex rounded-lg border border-border bg-card p-1">
                  {(["grid", "list"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update({ view: v === "grid" ? undefined : v }, true)}
                      className={cn(
                        "rounded-md p-1.5",
                        view === v ? "bg-foreground text-background" : "text-muted-foreground",
                      )}
                      aria-label={v === "grid" ? "Mřížka" : "Seznam"}
                      aria-pressed={view === v}
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
              <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Aktivní filtry">
                {chips.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => update(c.patch)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary"
                    aria-label={`Zrušit filtr ${c.label}`}
                  >
                    {c.label} <X className="h-3 w-3 text-primary" />
                  </button>
                ))}
                {active > 1 ? (
                  <button
                    onClick={reset}
                    className="px-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Zrušit vše
                  </button>
                ) : null}
              </div>
            ) : null}

            {list.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <p className="text-lg font-semibold">Tomuto hledání neodpovídá žádný vůz</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Zkuste uvolnit některé filtry nebo si nastavte hlídacího psa – dáme vědět, až se
                  takový vůz objeví.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={reset}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Zrušit filtry
                  </button>
                  <WatchdogDialog search={search} />
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4",
                  view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
                )}
              >
                {list.map((v, i) => (
                  <Fragment key={v.id}>
                    <VehicleCard vehicle={v} layout={view} />
                    {i === 5 ? <AdSlot format="infeed" /> : null}
                  </Fragment>
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
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold",
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
