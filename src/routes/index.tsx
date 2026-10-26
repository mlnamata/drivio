import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, ChevronDown, Wallet } from "lucide-react";
import { useState } from "react";
import { AuctionCountdown } from "@/components/auction-countdown";
import { AdSlot } from "@/components/ad-slot";
import { Faq, Partners } from "@/components/trust";
import { BrandLogo } from "@/components/brand-logo";
import { CarImage } from "@/components/car-image";
import { QuickSearch } from "@/components/quick-search";
import { Container, Page, SectionTitle } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { bodyTypes, brands } from "@/lib/catalog";
import { czk, monthlyPayment, vehicleTitle } from "@/lib/mock-data";
import { useAllVehicles, useAuctions, useVehicles } from "@/lib/store";

import { cars, plural } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ojetá auta od prověřených autobazarů | Drivio" },
      {
        name: "description",
        content:
          "Ojetá auta od prověřených autobazarů. Cena i měsíční splátka na první pohled, ověřená historie Cebia, hlídací pes a aukce aut od 1 Kč.",
      },
      { property: "og:title", content: "Ojetá auta od prověřených autobazarů | Drivio" },
      {
        property: "og:description",
        content: "Cena i splátka na první pohled, prověřené vozy a aukce od 1 Kč.",
      },
    ],
  }),
  component: Index,
});

const shortcuts = [
  { label: "Auta do 100 000 Kč", search: { priceTo: 100000 } },
  { label: "Auta do 200 000 Kč", search: { priceTo: 200000 } },
  { label: "Rodinná kombi", search: { body: ["kombi"] } },
  { label: "SUV 4×4", search: { body: ["suv"], drive: "4x4" } },
  { label: "Automaty", search: { gearbox: "automat" } },
  { label: "Elektro a hybridy", search: { fuel: ["elektro", "hybrid", "phev"] } },
  { label: "Výhodná cena", search: { priceRating: true } },
  { label: "Původ ČR", search: { origin: "cz" as const } },
  { label: "S odpočtem DPH", search: { vat: true } },
  { label: "Ověřeno Cebia", search: { cebia: true } },
  { label: "7 míst", search: { seatsFrom: 7 } },
  { label: "Nehavarované se servisní knihou", search: { accidentFree: true, serviceBook: true } },
];

const monthlySteps = [2500, 3500, 5000, 8000];

const bodyIcons: Record<string, string> = {
  hatchback: "M6 30h52l-4-10c-1-3-4-4-7-4H26l-8 6H10c-3 0-4 2-4 4z",
  kombi: "M4 30h56l-2-10c-1-2-3-4-6-4H22l-8 6H8c-2 0-4 2-4 4z",
  sedan: "M4 30h56l-4-6-10-2-8-6H24l-8 6H8c-2 0-4 2-4 4z",
  liftback: "M4 30h56l-4-6-16-8H24l-8 6H8c-2 0-4 2-4 4z",
  suv: "M6 30h52v-8c0-2-2-4-4-4l-6-6H20l-6 6h-4c-2 0-4 2-4 4z",
  mpv: "M6 30h52l-2-10-10-8H22l-8 8H10c-2 0-4 2-4 4z",
  kupe: "M4 30h56l-6-6-12-2-8-5H24l-10 7H8c-2 0-4 2-4 4z",
  kabriolet: "M4 30h56l-4-6-12-2h-8l-4-4-4 4H8c-2 0-4 2-4 4z",
  pickup: "M4 30h56v-8H36v-8H18l-6 8H8c-2 0-4 2-4 4z",
  dodavka: "M6 30h52V14c0-2-2-4-4-4H18l-8 10H8c-1 0-2 1-2 2z",
};

const textLink = "text-sm font-semibold text-foreground underline-offset-4 hover:underline";

function Index() {
  const list = useVehicles();
  const all = useAllVehicles();
  const auctions = useAuctions();
  const [allBrands, setAllBrands] = useState(false);
  const latest = list
    .slice()
    .sort((a, b) => a.listedDays - b.listedDays)
    .slice(0, 8);
  const top = list.filter((v) => v.top).slice(0, 4);
  const shownBrands = allBrands ? brands : brands.filter((b) => b.popular);
  const cebiaCount = list.filter((v) => v.cebiaVerified).length;
  const live = auctions.filter((a) => !a.ended && !a.upcoming);
  const upcoming = auctions.filter((a) => a.upcoming);

  return (
    <Page>
      {/* Úvod: hledání je hlavní úkol, proto stojí hned pod nadpisem */}
      <section className="border-b border-border bg-card">
        <Container className="pb-10 pt-10 md:pb-12 md:pt-14">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-12">
            <h1 className="text-[2.1rem] font-extrabold leading-[1.04] sm:text-5xl lg:text-[3.6rem]">
              Ojetá auta s{" "}cenou i{" "}splátkou na první pohled
            </h1>
            <p className="max-w-md text-lg text-muted-foreground lg:pb-1.5">
              {cars(list.length)} od ověřených autobazarů a{" "}soukromníků. U{" "}
              každého vidíte, kolik byste měsíčně spláceli
              {cebiaCount ? (
                <>
                  , a{" "}u{" "}
                  {cebiaCount} je historie prověřená v{" "}Cebii
                </>
              ) : null}
              .
            </p>
          </div>

          <div className="mt-8">
            <QuickSearch />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 text-muted-foreground">Podle měsíční splátky</span>
            {monthlySteps.map((m) => {
              const count = list.filter((v) => monthlyPayment(v.price) <= m).length;
              return (
                <Link
                  key={m}
                  to="/inzeraty"
                  search={{ monthlyTo: m, sort: "price-desc" }}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 transition-colors hover:border-foreground/40"
                  aria-label={`Splátka do ${czk(m)}, ${cars(count)}`}
                >
                  do <span className="font-display font-bold">{czk(m)}</span>
                  <span className="ml-1.5 text-muted-foreground">{count}</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Doporučené vozy (TOP) */}
      {top.length ? (
        <Container className="pt-12">
          <SectionTitle
            title="Doporučené vozy"
            action={
              <Link to="/inzeraty" className={textLink}>
                Všechny inzeráty
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* Značky – mřížka se sdílenými linkami, ne samostatné karty */}
      <Container className="py-12">
        <SectionTitle
          title="Nejhledanější značky"
          action={
            <button
              type="button"
              onClick={() => setAllBrands((v) => !v)}
              className={`${textLink} inline-flex items-center gap-1`}
              aria-expanded={allBrands}
            >
              {allBrands ? "Jen nejhledanější" : `Všech ${brands.length} značek`}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${allBrands ? "rotate-180" : ""}`}
              />
            </button>
          }
        />
        <div className="ruled-grid grid grid-cols-2 overflow-hidden rounded-xl bg-card sm:grid-cols-4 md:grid-cols-6">
          {shownBrands.map((b) => {
            const count = list.filter((v) => v.brand === b.slug).length;
            return (
              <Link
                key={b.slug}
                to="/inzeraty"
                search={{ brand: b.slug }}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted"
              >
                <BrandLogo slug={b.slug} name={b.name} className="h-9 w-9 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{b.name}</span>
                  <span className="block text-xs text-muted-foreground">{cars(count)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </Container>

      <Container>
        <AdSlot format="leaderboard" />
      </Container>

      {/* Nově přidané */}
      <Container className="py-12">
        <SectionTitle
          title="Nově přidané vozy"
          action={
            <Link to="/inzeraty" search={{ sort: "newest" }} className={textLink}>
              Seřadit od nejnovějších
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Container>

      {/* Karoserie a oblíbená hledání */}
      <Container className="pb-14">
        <SectionTitle title="Hledejte podle typu vozu" />
        <div className="ruled-grid grid grid-cols-2 overflow-hidden rounded-xl bg-card sm:grid-cols-5">
          {bodyTypes.map((b) => (
            <Link
              key={b.value}
              to="/inzeraty"
              search={{ body: [b.value] }}
              className="group flex flex-col items-center gap-2 py-5 transition-colors hover:bg-muted"
            >
              <svg
                viewBox="0 0 64 40"
                className="h-9 w-16 text-foreground/70 transition-colors group-hover:text-primary"
                aria-hidden
              >
                <path
                  d={bodyIcons[b.value]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <circle
                  cx="18"
                  cy="31"
                  r="4.5"
                  fill="var(--card)"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <circle
                  cx="46"
                  cy="31"
                  r="4.5"
                  fill="var(--card)"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
              </svg>
              <span className="text-sm font-medium">{b.label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-muted-foreground">Oblíbená hledání</span>
          {shortcuts.map((s) => (
            <Link
              key={s.label}
              to="/inzeraty"
              search={s.search}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-foreground/40"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </Container>

      {/* Aukce – tmavý pás přes celou šířku se živou tabulkou */}
      <section className="bg-sidebar text-sidebar-foreground">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_1.6fr] lg:py-16">
          <div>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">Aukce aut od 1 Kč</h2>
            <p className="mt-3 max-w-md text-white/70">
              Vozy, které autobazary chtějí rychle prodat. Přihazujete živě a{" "}cenu určí zájem
              kupujících. Platíte jen aukční poplatek, který vidíte předem.
            </p>
            <p className="mt-4 text-sm text-white/55">
              Právě běží {live.length} {plural(live.length, "aukce", "aukce", "aukcí")}
              {upcoming.length
                ? `, ${upcoming.length} ${plural(upcoming.length, "vůz čeká", "vozy čekají", "vozů čeká")} na start`
                : ""}
              .
            </p>
            <Link
              to="/aukce"
              className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Otevřít aukční síň
            </Link>
          </div>

          {live.length ? (
            <table className="w-full self-start text-sm">
              <caption className="sr-only">Právě probíhající aukce</caption>
              <thead>
                <tr className="border-b border-white/15 text-left text-xs text-white/50">
                  <th className="pb-2 font-medium">Vůz</th>
                  <th className="hidden pb-2 text-right font-medium sm:table-cell">Příhozy</th>
                  <th className="pb-2 text-right font-medium">Aktuální cena</th>
                  <th className="hidden pb-2 text-right font-medium sm:table-cell">Do konce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {live.slice(0, 5).map((a) => {
                  const v = all.find((x) => x.id === a.vehicleId);
                  if (!v) return null;
                  return (
                    <tr key={a.id} className="group">
                      <td className="py-3 pr-3">
                        <Link
                          to="/aukce/$id"
                          params={{ id: a.id }}
                          className="flex items-center gap-3"
                        >
                          <span className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-white/10">
                            <CarImage src={v.photos[0]!} alt="" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-white group-hover:underline">
                              {vehicleTitle(v)}
                            </span>
                            <span className="block text-xs text-white/50">
                              {v.year}
                              <span className="sm:hidden">
                                , končí za <AuctionCountdown minutes={a.endsInMinutes} />
                              </span>
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="hidden py-3 text-right tabular-nums text-white/70 sm:table-cell">
                        {a.bids}
                      </td>
                      <td className="whitespace-nowrap py-3 text-right font-display text-base font-bold text-white">
                        {czk(Math.max(a.currentBid, a.startPrice))}
                      </td>
                      <td className="hidden whitespace-nowrap py-3 pl-4 text-right text-white/70 sm:table-cell">
                        <AuctionCountdown minutes={a.endsInMinutes} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="self-center text-white/60">
              Teď neběží žádná aukce. Připravované vozy najdete v{" "}aukční síni.
            </p>
          )}
        </Container>
      </section>

      {/* Na co se můžete spolehnout – seznam s linkami místo tří karet s ikonami */}
      <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-2xl font-bold md:text-[1.75rem]">Na co se u nás můžete spolehnout</h2>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Tři věci, které u{" "}inzerátů hlídáme, abyste nekupovali naslepo.
          </p>
        </div>
        <dl className="divide-y divide-border border-y border-border">
          <div className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="font-semibold">Historie z{" "}Cebie</dt>
            <dd className="text-muted-foreground">
              U označených vozů je prověřený VIN, rok výroby, stav tachometru, financování i{" "}
              databáze odcizených vozidel.
            </dd>
          </div>
          <div className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="font-semibold">Splátka u{" "}každého auta</dt>
            <dd className="text-muted-foreground">
              Orientační měsíční splátku vidíte už ve výpisu. Nezávaznou nabídku financování máte do
              pár minut.
            </dd>
          </div>
          <div className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="font-semibold">Ověření prodejci</dt>
            <dd className="text-muted-foreground">
              Autobazary inzerují s{" "}IČO, soukromník může mít jeden inzerát zdarma. U{" "}každého
              vozu je hodnocení prodejce i{" "}ceny.
            </dd>
          </div>
        </dl>
      </Container>

      {/* Hlídací pes a financování – jeden pás rozdělený linkou */}
      <Container className="pb-6">
        <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2 md:divide-x md:divide-border">
          <div className="flex flex-col justify-between gap-6 p-7 md:p-8">
            <div>
              <BellRing className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-bold md:text-2xl">Hlídací pes</h2>
              <p className="mt-2 text-muted-foreground">
                Uložte si hledání a{" "}nové vozy, které mu odpovídají, vám pošleme e-mailem,
                jakmile se objeví.
              </p>
            </div>
            <Link
              to="/inzeraty"
              className="inline-flex w-fit rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
            >
              Nastavit hlídání
            </Link>
          </div>
          <div className="flex flex-col justify-between gap-6 border-t border-border p-7 md:border-t-0 md:p-8">
            <div>
              <Wallet className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-bold md:text-2xl">Auto na splátky bez akontace</h2>
              <p className="mt-2 text-muted-foreground">
                Porovnáme nabídky od partnerů Essox, Home Credit a{" "}Cofidis. Předschválení
                online, financování až do 100{" "}% ceny vozu.
              </p>
            </div>
            <Link
              to="/financovani"
              className="inline-flex w-fit rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Spočítat splátku
            </Link>
          </div>
        </div>
      </Container>

      <Container className="py-16">
        <Faq />
      </Container>
      <Container className="pb-4">
        <Partners />
      </Container>
    </Page>
  );
}
