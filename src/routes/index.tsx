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
import { AuctionCountdown } from "@/components/auction-countdown";
import { AdSlot } from "@/components/ad-slot";
import { Faq, Partners, Reviews } from "@/components/trust";
import { BrandLogo } from "@/components/brand-logo";
import { CarImage } from "@/components/car-image";
import { QuickSearch } from "@/components/quick-search";
import { Container, Page, SectionTitle } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { brands } from "@/lib/catalog";
import { czk, monthlyPayment, priceRating, vehicleTitle } from "@/lib/mock-data";
import { useAllVehicles, useAuctions, useVehicles } from "@/lib/store";
import { cars } from "@/lib/utils";

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
  { label: "Elektro a hybridy", search: { fuel: ["elektro", "hybrid", "phev", "mhev"] } },
  { label: "Výhodná cena", search: { priceRating: true } },
  { label: "První majitel", search: { owners: 1 } },
  { label: "S odpočtem DPH", search: { vat: true } },
  { label: "Ověřeno Cebia", search: { cebia: true } },
  { label: "7 míst", search: { seatsFrom: 7 } },
  { label: "Tažné zařízení", search: { equipment: ["tazne"] } },
  { label: "Nehavarované se servisní knihou", search: { accidentFree: true, serviceBook: true } },
];

/** Siluety karoserií (z boku, příď vlevo), kola se kreslí zvlášť. */
const bodyIcons: { value: string; label: string; d: string }[] = [
  {
    value: "hatchback",
    label: "Hatchback",
    d: "M3 23v-4.5c0-1.5 1-2.5 2.5-2.7L15 14.5l7-5.9c1-.8 2.2-1.1 3.5-1.1H45c1.6 0 2.8.8 3.5 2.1l4 5.4 5.5.8c1.7.2 3 1.5 3 3.2V23z",
  },
  {
    value: "kombi",
    label: "Kombi",
    d: "M3 23v-4.5c0-1.5 1-2.5 2.5-2.7L14 14.6l7-6c1-.8 2.2-1.1 3.5-1.1H56c1.6 0 2.6.9 3 2.3l2 5.7V23z",
  },
  {
    value: "sedan",
    label: "Sedan",
    d: "M3 23v-4.5c0-1.5 1-2.5 2.5-2.7L15 14.6l7.5-5.8c1-.8 2.2-1.1 3.5-1.1h14c1.5 0 2.8.7 3.6 1.9l4.4 5 10.5.8c1.5.1 2.5 1.3 2.5 2.8V23z",
  },
  {
    value: "liftback",
    label: "Liftback",
    d: "M3 23v-4.5c0-1.5 1-2.5 2.5-2.7L15 14.6l7.5-5.8c1-.8 2.2-1.1 3.5-1.1h14c2 0 3.5.8 5 2.1l8 5.2 5.5.6c1.5.2 2.5 1.2 2.5 2.7V23z",
  },
  {
    value: "suv",
    label: "SUV",
    d: "M3 23v-6.5c0-1.5 1-2.5 2.5-2.7l7.5-1 6-6.6c1-.9 2.2-1.2 3.5-1.2H55c1.6 0 2.7 1 3 2.4l3 5.6V23z",
  },
  {
    value: "mpv",
    label: "MPV",
    d: "M3 23v-6c0-1.4.8-2.4 2-2.7l6-1.7 8-7c1-.8 2.2-1.1 3.5-1.1H54c1.8 0 3 .9 3.6 2.5L61 14v9z",
  },
  {
    value: "kupe",
    label: "Kupé",
    d: "M3 23v-4.2c0-1.4 1-2.4 2.5-2.6L18 14.8l8-5.2c1.2-.8 2.6-1.1 4-1.1h8c2 0 3.6.7 5 2L50 15l8.5.8c1.5.2 2.5 1.2 2.5 2.7V23z",
  },
  {
    value: "kabriolet",
    label: "Kabriolet",
    d: "M3 23v-4.2c0-1.4 1-2.4 2.5-2.6L18 14.8l6.5-5 1.5.6-3.8 4.2H46c1-1.6 2.5-2.4 4.5-2.4H52l1 2.8 5.5.8c1.5.2 2.5 1.2 2.5 2.7V23z",
  },
  {
    value: "pickup",
    label: "Pick-up",
    d: "M3 23v-6.5c0-1.5 1-2.5 2.5-2.7l7.5-1 6-6.6c1-.9 2.2-1.2 3.5-1.2H35c1.4 0 2.4 1 2.6 2.4l.6 5.8H61V23z",
  },
  {
    value: "dodavka",
    label: "Dodávka",
    d: "M3 23v-7.5c0-1.5.8-2.5 2-2.9l4-1.2 5.5-6.6c.9-1 2.1-1.5 3.5-1.5h40c1.7 0 3 1.3 3 3V23z",
  },
];

function BodyIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 64 30" className="h-8 w-[3.75rem]" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {[16, 49].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy="23"
          r="4.6"
          fill="var(--card)"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function Index() {
  const list = useVehicles();
  const all = useAllVehicles();
  const auctions = useAuctions();
  const [allBrands, setAllBrands] = useState(false);
  const newest = list.slice().sort((a, b) => a.listedDays - b.listedDays);
  const latest = newest.slice(0, 8);
  const topBase = list.filter((v) => v.top);
  const top = topBase.length ? [...topBase, ...newest.filter((v) => !v.top)].slice(0, 4) : [];
  const deals = newest.filter((v) => ["great", "good"].includes(priceRating(v).tone)).slice(0, 4);
  const shownBrands = allBrands ? brands : brands.filter((b) => b.popular);
  const countBy = (slug: string) => list.filter((v) => v.brand === slug).length;
  const liveAuctions = auctions.filter((a) => !a.ended && !a.upcoming).slice(0, 4);

  return (
    <Page>
      {/* HERO – světlý, bez fotky na pozadí (styl driveto.cz) */}
      <section className="border-b border-border bg-card">
        <Container className="pb-10 pt-8 md:pb-12 md:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BadgeCheck className="h-4 w-4 text-success" /> {cars(list.length)} od ověřených
                autobazarů a prodejců
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.06] md:text-[3.25rem]">
                Auto, které si můžete dovolit.
                <span className="block text-primary">Koupě, splátky i leasing.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Ojetá auta s ověřenou historií a splátkou na první pohled, operativní leasing se
                vším v ceně a aukce od 1 Kč. Na jednom místě.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                {(
                  [
                    [ShieldCheck, "Historie ověřená Cebia"],
                    [Wallet, "Splátky bez akontace"],
                    [Gavel, "Aukce od 1 Kč"],
                  ] as const
                ).map(([Icon, t]) => (
                  <li key={t} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            {deals.length ? (
              <div className="hidden lg:block">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-bold">Výhodné nabídky</p>
                  <Link
                    to="/inzeraty"
                    search={{ priceRating: true }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Všechny →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {deals.map((v) => (
                    <Link
                      key={v.id}
                      to="/inzerat/$id"
                      params={{ id: v.id }}
                      className="group relative overflow-hidden rounded-xl border border-border"
                    >
                      <div className="aspect-[16/10]">
                        <CarImage
                          src={v.photos[0]!}
                          alt={vehicleTitle(v)}
                          eager
                          className="transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 pt-10 text-white">
                        <p className="truncate text-sm font-semibold">{vehicleTitle(v)}</p>
                        <p className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-base font-extrabold">
                            {czk(v.price)}
                          </span>
                          <span className="text-xs text-white/80">
                            {czk(monthlyPayment(v.price))}/měs.
                          </span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 md:mt-10">
            <QuickSearch />
          </div>
        </Container>
      </section>

      {/* PODLE SPLÁTKY */}
      <Container className="pt-10">
        <SectionTitle
          title="Kolik chcete měsíčně splácet?"
          action={
            <Link to="/financovani" className="hover:underline">
              Jak funguje financování →
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[2500, 3500, 5000, 8000].map((m) => {
            const count = list.filter((v) => monthlyPayment(v.price) <= m).length;
            return (
              <Link
                key={m}
                to="/inzeraty"
                search={{ monthlyTo: m, sort: "price-desc" }}
                className="surface-card lift group flex items-center justify-between gap-3 px-5 py-4"
              >
                <span>
                  <span className="block text-xs text-muted-foreground">splátka do</span>
                  <span className="font-display text-xl font-extrabold group-hover:text-primary md:text-2xl">
                    {czk(m)}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                  {cars(count)}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>

      {/* ZNAČKY */}
      <Container className="pt-12">
        <SectionTitle
          title="Značky"
          action={
            <button
              onClick={() => setAllBrands((v) => !v)}
              className="inline-flex items-center gap-1 hover:underline"
            >
              {allBrands ? "Jen nejhledanější" : `Všech ${brands.length} značek`}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${allBrands ? "rotate-180" : ""}`}
              />
            </button>
          }
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {shownBrands.map((b) => {
            const n = countBy(b.slug);
            return (
              <Link
                key={b.slug}
                to="/inzeraty"
                search={{ brand: b.slug }}
                className="surface-card lift flex flex-col items-center gap-2 px-2 pb-3 pt-4 text-center"
              >
                <BrandLogo slug={b.slug} name={b.name} className="h-9 w-14" />
                <span className="text-[13px] font-semibold leading-tight">{b.name}</span>
                <span className="text-[11px] text-muted-foreground">{n ? cars(n) : " "}</span>
              </Link>
            );
          })}
        </div>
      </Container>

      {/* KAROSERIE */}
      <Container className="pt-12">
        <SectionTitle title="Podle typu karoserie" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-10">
          {bodyIcons.map((b) => (
            <Link
              key={b.value}
              to="/inzeraty"
              search={{ body: [b.value] }}
              className="surface-card lift group flex flex-col items-center gap-1.5 px-2 py-4 text-foreground/70 hover:text-primary"
            >
              <BodyIcon d={b.d} />
              <span className="text-[13px] font-medium text-foreground">{b.label}</span>
            </Link>
          ))}
        </div>
      </Container>

      <Container>
        <AdSlot format="leaderboard" className="mt-12" />
      </Container>

      {/* TOP NABÍDKY */}
      {top.length ? (
        <Container className="pt-12">
          <SectionTitle
            title="Doporučené vozy"
            desc="Vybrané nabídky ověřených autobazarů."
            action={
              <Link to="/inzeraty" className="hover:underline">
                Všechny vozy →
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* NOVĚ PŘIDANÉ */}
      <Container className="pt-12">
        <SectionTitle
          title="Nově přidané vozy"
          action={
            <Link to="/inzeraty" search={{ sort: "newest" }} className="hover:underline">
              Zobrazit vše →
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </Container>

      {/* ZKRATKY */}
      <Container className="pt-10">
        <p className="mb-3 text-sm font-bold">Oblíbená hledání</p>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <Link
              key={s.label}
              to="/inzeraty"
              search={s.search}
              className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </Container>

      {/* AUKCE */}
      {liveAuctions.length ? (
        <Container className="pt-14">
          <div className="overflow-hidden rounded-2xl bg-sidebar p-6 text-white md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-md bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Živé aukce
                </p>
                <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Aukce aut od 1 Kč</h2>
                <p className="mt-3 max-w-md text-white/70">
                  Vozy, které autobazary chtějí rychle prodat. Přihazujete v reálném čase, cenu
                  určuje trh. Vydražitel platí jen transparentní aukční poplatek.
                </p>
                <Link
                  to="/aukce"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Všechny aukce <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {liveAuctions.map((a) => {
                  const v = all.find((x) => x.id === a.vehicleId);
                  if (!v) return null;
                  return (
                    <Link
                      key={a.id}
                      to="/aukce/$id"
                      params={{ id: a.id }}
                      className="group flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                        <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{vehicleTitle(v)}</p>
                        <p className="font-display text-lg font-bold">
                          {czk(Math.max(a.currentBid, a.startPrice))}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-white/60">
                          <Clock className="h-3 w-3" />{" "}
                          <AuctionCountdown minutes={a.endsInMinutes} />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      ) : null}

      {/* PROČ DRIVIO */}
      <section className="mt-14 border-y border-border bg-card">
        <Container className="py-12">
          <SectionTitle title="Proč nakupovat na Drivio" />
          <div className="grid gap-8 md:grid-cols-3">
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
                t: "Ověření prodejci",
                d: "Autobazary ověřujeme podle IČO a ukazujeme jejich hodnocení. U každého vozu vidíte i hodnocení ceny.",
              },
            ].map((f) => (
              <div key={f.t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{f.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Reviews />

      {/* HLÍDACÍ PES + FINANCOVÁNÍ */}
      <Container className="grid gap-4 pt-14 md:grid-cols-2">
        <div className="surface-card flex flex-col justify-between gap-6 p-7">
          <div>
            <BellRing className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-xl font-bold">Hlídací pes</h2>
            <p className="mt-2 text-muted-foreground">
              Nastavte si filtr a nové vozy, které mu odpovídají, vám pošleme e-mailem hned, jak se
              objeví.
            </p>
          </div>
          <Link
            to="/inzeraty"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/85"
          >
            Nastavit hlídání <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="surface-card flex flex-col justify-between gap-6 p-7">
          <div>
            <Wallet className="h-6 w-6 text-primary" />
            <h2 className="mt-3 text-xl font-bold">Auto na splátky bez akontace</h2>
            <p className="mt-2 text-muted-foreground">
              Porovnáme nabídky od partnerů Essox, Home Credit a Cofidis. Předschválení online,
              financování až 100 % ceny vozu.
            </p>
          </div>
          <Link
            to="/financovani"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Spočítat splátku <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
      <Container className="pt-16">
        <Faq />
      </Container>
      <Container className="pt-16">
        <Partners />
      </Container>
    </Page>
  );
}
