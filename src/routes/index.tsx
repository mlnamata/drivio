import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  ChevronDown,
  Clock,
  Gavel,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import heroCar from "@/assets/hero-car.jpg";
import { AuctionCountdown } from "@/components/auction-countdown";
import { AdSlot } from "@/components/ad-slot";
import { BrandLogo } from "@/components/brand-logo";
import { CarImage } from "@/components/car-image";
import { QuickSearch } from "@/components/quick-search";
import { Container, Page, SectionTitle } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { bodyTypes, brands } from "@/lib/catalog";
import { czk, num, vehicleTitle } from "@/lib/mock-data";
import { useAllVehicles, useAuctions, useVehicles } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drivio — ojetá auta od prověřených autobazarů" },
      {
        name: "description",
        content:
          "Ojetá auta od prověřených autobazarů. Cena i měsíční splátka na první pohled, ověřená historie Cebia, hlídací pes a aukce aut od 1 Kč.",
      },
      { property: "og:title", content: "Drivio — ojetá auta od prověřených autobazarů" },
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

  return (
    <Page>
      {/* HERO */}
      <Container className="pt-6">
        <section className="relative isolate overflow-hidden rounded-[2rem]">
          <img
            src={heroCar}
            alt=""
            width={1600}
            height={1008}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[oklch(0.16_0.004_60/0.88)] via-[oklch(0.16_0.004_60/0.6)] to-[oklch(0.16_0.004_60/0.25)]" />
          <div className="px-5 pb-8 pt-10 md:px-10 md:pb-10 md:pt-14">
            <p className="glass-dark mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white/90">
              <BadgeCheck className="h-4 w-4 text-primary" /> {num(list.length)} vozů od prověřených
              autobazarů
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.08] text-white md:text-5xl">
              Najděte své další auto. <span className="text-primary">Rychle a férově.</span>
            </h1>
            <div className="mt-8">
              <QuickSearch />
            </div>
          </div>
        </section>
      </Container>

      {/* ZNAČKY */}
      <Container className="py-12">
        <SectionTitle eyebrow="Značky" title="Nejhledanější značky" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {shownBrands.map((b) => (
            <Link
              key={b.slug}
              to="/inzeraty"
              search={{ brand: b.slug }}
              className="surface-card lift flex flex-col items-center gap-2 px-3 py-5"
            >
              <BrandLogo slug={b.slug} name={b.name} className="h-11 w-11" />
              <span className="text-sm font-semibold">{b.name}</span>
              <span className="text-xs text-muted-foreground">
                {list.filter((v) => v.brand === b.slug).length} vozů
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-5 text-center">
          <button
            onClick={() => setAllBrands((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:border-primary/50"
          >
            {allBrands ? "Méně značek" : `Všech ${brands.length} značek`}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${allBrands ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </Container>

      <Container>
        <AdSlot format="leaderboard" />
      </Container>

      {/* KAROSERIE */}
      <Container className="py-6">
        <SectionTitle eyebrow="Karoserie" title="Hledejte podle typu vozu" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {bodyTypes.map((b) => (
            <Link
              key={b.value}
              to="/inzeraty"
              search={{ body: [b.value] }}
              className="surface-card lift group flex flex-col items-center gap-2 py-5"
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
      </Container>

      {/* TOP NABÍDKY */}
      {top.length ? (
        <Container className="py-12">
          <SectionTitle eyebrow="TOP nabídky" title="Doporučené vozy" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* NOVĚ PŘIDANÉ */}
      <Container className="py-8">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle eyebrow="Nabídka" title="Nově přidané vozy" />
          <Link
            to="/inzeraty"
            search={{ sort: "newest" }}
            className="mb-8 text-sm font-semibold text-primary"
          >
            Zobrazit vše →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Container>

      {/* ZKRATKY */}
      <Container className="py-6">
        <div className="surface-card p-6">
          <p className="mb-4 text-sm font-bold">Oblíbená hledání</p>
          <div className="flex flex-wrap gap-2">
            {shortcuts.map((s) => (
              <Link
                key={s.label}
                to="/inzeraty"
                search={s.search}
                className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* AUKCE */}
      <Container className="py-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-sidebar p-6 text-white md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/35 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                <Gavel className="h-3.5 w-3.5" /> Živé aukce
              </p>
              <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Aukce aut od 1 Kč</h2>
              <p className="mt-3 max-w-md text-white/70">
                Vozy, které autobazary chtějí rychle prodat. Přihazujete v reálném čase, cenu určuje
                trh. Vydražitel platí jen transparentní aukční poplatek.
              </p>
              <Link
                to="/aukce"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Všechny aukce <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {auctions.slice(0, 4).map((a) => {
                const v = all.find((x) => x.id === a.vehicleId);
                if (!v) return null;
                return (
                  <Link
                    key={a.id}
                    to="/aukce/$id"
                    params={{ id: a.id }}
                    className="glass-dark group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-white/10"
                  >
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                      <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{vehicleTitle(v)}</p>
                      <p className="font-display text-lg font-bold">
                        {czk(Math.max(a.currentBid, a.startPrice))}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-white/60">
                        <Clock className="h-3 w-3" /> <AuctionCountdown minutes={a.endsInMinutes} />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Container>

      {/* PROČ DRIVIO */}
      <Container className="py-12">
        <SectionTitle eyebrow="Proč Drivio" title="Nakupujte s jistotou" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              t: "Ověřená historie Cebia",
              d: "U označených vozů je prověřen VIN, rok výroby, stav tachometru, financování i databáze odcizených vozidel.",
            },
            {
              icon: Wallet,
              t: "Splátka na první pohled",
              d: "U každého auta vidíte orientační měsíční splátku. Nezávaznou nabídku financování máte do pár minut.",
            },
            {
              icon: BadgeCheck,
              t: "Jen profesionální prodejci",
              d: "Inzerují pouze ověřené autobazary s IČO. Hodnocení prodejce a hodnocení ceny vidíte u každého vozu.",
            },
          ].map((f) => (
            <div key={f.t} className="surface-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* HLÍDACÍ PES + FINANCOVÁNÍ */}
      <Container className="grid gap-5 py-6 md:grid-cols-2">
        <div className="surface-card flex flex-col justify-between gap-6 p-8">
          <div>
            <BellRing className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Hlídací pes</h2>
            <p className="mt-2 text-muted-foreground">
              Nastavte si filtr a nové vozy, které mu odpovídají, vám pošleme e-mailem hned, jak se
              objeví.
            </p>
          </div>
          <Link
            to="/inzeraty"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/85"
          >
            Nastavit hlídání <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="surface-card flex flex-col justify-between gap-6 p-8">
          <div>
            <Wallet className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Auto na splátky bez akontace</h2>
            <p className="mt-2 text-muted-foreground">
              Porovnáme nabídky od partnerů Essox, Home Credit a Cofidis. Předschválení online,
              financování až 100 % ceny vozu.
            </p>
          </div>
          <Link
            to="/financovani"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Spočítat splátku <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Page>
  );
}
