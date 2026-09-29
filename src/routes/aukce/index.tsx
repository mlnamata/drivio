import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  CalendarClock,
  ChevronDown,
  Clock,
  Gavel,
  Info,
  Scale,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AuctionCountdown } from "@/components/auction-countdown";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { fuels, labelOf } from "@/lib/catalog";
import { czk, num, sellerOf, vehicleTitle, type Vehicle } from "@/lib/mock-data";
import { store, useAllVehicles, useAuctions, type LiveAuction } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aukce/")({
  head: () => ({
    meta: [
      { title: "Aukce aut od 1 Kč | Drivio" },
      {
        name: "description",
        content:
          "Živé aukce ojetých aut s vyvolávací cenou 1 Kč a galerie vozů, které čekají na aukci. Automatické přihazování, transparentní aukční poplatek.",
      },
      { property: "og:title", content: "Aukce aut od 1 Kč | Drivio" },
    ],
  }),
  component: AuctionHub,
});

/** Jedna stránka: živé aukce, galerie připravovaných, moje příhozy a výsledky. */
function AuctionHub() {
  const auctions = useAuctions();
  const vehicles = useAllVehicles();
  const withVehicle = (list: LiveAuction[]) =>
    list
      .map((a) => ({ a, v: vehicles.find((x) => x.id === a.vehicleId) }))
      .filter((x): x is { a: LiveAuction; v: Vehicle } => !!x.v);

  const live = withVehicle(
    auctions
      .filter((a) => !a.ended && !a.upcoming)
      .sort((x, y) => x.endsInMinutes - y.endsInMinutes),
  );
  const upcoming = withVehicle(
    auctions
      .filter((a) => a.upcoming)
      .sort((x, y) => (x.startsInMinutes ?? 0) - (y.startsInMinutes ?? 0)),
  );
  const mine = withVehicle(auctions.filter((a) => a.myBest !== null && !a.ended));
  const ended = withVehicle(auctions.filter((a) => a.ended));

  const sections = [
    { id: "zive", label: "Živě", count: live.length },
    { id: "pripravujeme", label: "Čekají na aukci", count: upcoming.length },
    ...(mine.length ? [{ id: "moje", label: "Moje příhozy", count: mine.length }] : []),
    { id: "vysledky", label: "Výsledky", count: ended.length },
  ];

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Aukce" }]} />
        <div className="relative overflow-hidden rounded-[2rem] bg-sidebar p-8 text-white md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> {live.length}{" "}
                aukcí právě běží
              </p>
              <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Aukce aut od 1 Kč</h1>
              <p className="mt-3 max-w-xl text-white/70">
                Živé dražby a galerie vozů, které se brzy začnou dražit. Vyvolávací cena 1 Kč,
                příhozy živě, vydražitel platí jen aukční poplatek 3–5 %.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                [String(live.length), "živých aukcí"],
                [String(upcoming.length), "čeká na start"],
                [num(live.reduce((s, x) => s + x.a.bids, 0)), "příhozů"],
              ].map(([v, l]) => (
                <div key={l} className="glass-dark rounded-2xl p-3">
                  <dt className="font-display text-2xl font-extrabold">{v}</dt>
                  <dd className="text-xs text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Navigace po sekcích jedné stránky */}
        <nav className="glass sticky top-16 z-30 mt-6 flex gap-1 overflow-x-auto rounded-full p-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-foreground/75 transition hover:bg-foreground hover:text-background"
            >
              {s.label} <span className="ml-1 text-xs opacity-70">{s.count}</span>
            </a>
          ))}
        </nav>

        {/* ŽIVĚ */}
        <section id="zive" className="scroll-mt-32 pt-10">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" /> Právě se draží
          </h2>
          {live.length === 0 ? (
            <Empty text="Momentálně neběží žádná aukce. Podívejte se na vozy, které čekají na start." />
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {live.map(({ a, v }) => (
                <AuctionCard key={a.id} a={a} v={v} />
              ))}
            </div>
          )}
        </section>

        {/* GALERIE PŘIPRAVOVANÝCH */}
        <section id="pripravujeme" className="scroll-mt-32 pt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <CalendarClock className="h-6 w-6 text-primary" /> Vozy čekající na aukci
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Prohlédněte si auta předem a nechte si poslat upozornění, až aukce začne.
              </p>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <Empty text="Žádné připravované aukce." />
          ) : (
            <div className="-mx-4 mt-5 flex snap-x gap-5 overflow-x-auto px-4 pb-4">
              {upcoming.map(({ a, v }) => (
                <article
                  key={a.id}
                  className="surface-card w-[85%] shrink-0 snap-start overflow-hidden sm:w-[48%] lg:w-[32%]"
                >
                  <Link to="/aukce/$id" params={{ id: a.id }} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <CarImage
                        src={v.photos[0]!}
                        alt={vehicleTitle(v)}
                        className="transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="glass absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                        <Clock className="h-3.5 w-3.5" /> Start za{" "}
                        <AuctionCountdown minutes={a.startsInMinutes ?? 0} />
                      </span>
                    </div>
                    <div className="p-4 pb-0">
                      <h3 className="text-lg font-semibold">{vehicleTitle(v)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {v.year} · {num(v.km)} km · {labelOf(fuels, v.fuel)} · {sellerOf(v).city}
                      </p>
                      <p className="mt-2 text-sm">
                        Vyvolávací cena <strong>{czk(a.startPrice)}</strong>
                        {a.reservePrice ? " · s minimální cenou" : " · bez minimální ceny"}
                      </p>
                    </div>
                  </Link>
                  <div className="p-4">
                    <button
                      onClick={() => {
                        store.toggleReminder(a.id);
                        toast(
                          a.reminded
                            ? "Upozornění zrušeno"
                            : "Pošleme vám upozornění na start aukce",
                        );
                      }}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold",
                        a.reminded
                          ? "bg-accent text-accent-foreground"
                          : "bg-foreground text-background hover:bg-foreground/85",
                      )}
                    >
                      {a.reminded ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      {a.reminded ? "Upozorníme vás" : "Upozornit na start"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* MOJE PŘÍHOZY */}
        {mine.length ? (
          <section id="moje" className="scroll-mt-32 pt-14">
            <h2 className="text-2xl font-bold">Moje příhozy</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {mine.map(({ a, v }) => (
                <AuctionCard key={a.id} a={a} v={v} />
              ))}
            </div>
          </section>
        ) : null}

        {/* VÝSLEDKY */}
        <section id="vysledky" className="scroll-mt-32 pt-14">
          <details className="surface-card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-bold">
              <span className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Výsledky ukončených aukcí (
                {ended.length})
              </span>
              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ended.map(({ a, v }) => (
                <AuctionCard key={a.id} a={a} v={v} />
              ))}
            </div>
          </details>
        </section>

        <h2 className="mt-14 text-2xl font-bold">Jak aukce funguje</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            [
              Users,
              "Registrace dražitele",
              "Jednorázově potvrdíte kontakt a aukční řád. Pak můžete přihazovat.",
            ],
            [
              Gavel,
              "Přihazujte nebo nastavte maximum",
              "Automatické přihazování vás drží ve vedení až do vámi zvolené částky.",
            ],
            [
              Timer,
              "Ochrana proti snipingu",
              "Příhoz v posledních 2 minutách prodlouží aukci o další 2 minuty.",
            ],
            [
              Trophy,
              "Vyhráli jste",
              "Do 3 dnů uhradíte cenu prodejci a aukční poplatek platformě, pak si vůz převezmete.",
            ],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Gavel;
            return (
              <div key={t as string} className="surface-card p-5">
                <I className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold">{t as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="surface-card flex gap-3 p-5">
            <Scale className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Férová pravidla:</strong> prodejce nesmí
              přihazovat na vlastní vůz, všechny příhozy jsou veřejně vidět a zpracovává je databáze
              atomicky – dva současné příhozy se nikdy nepřepíšou.
            </p>
          </div>
          <div className="surface-card flex gap-3 p-5">
            <Info className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Aukční poplatek</strong> 3–5 % z vydražené ceny
              platí vydražitel. Výše je uvedena u každé aukce ještě před příhozem.{" "}
              <Link to="/pravni/obchodni-podminky" className="text-primary underline">
                Aukční řád
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </Page>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="surface-card mt-5 p-10 text-center">
      <Gavel className="mx-auto h-9 w-9 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function AuctionCard({ a, v }: { a: LiveAuction; v: Vehicle }) {
  return (
    <Link to="/aukce/$id" params={{ id: a.id }} className="surface-card lift group overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <CarImage
          src={v.photos[0]!}
          alt={vehicleTitle(v)}
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.04]",
            a.ended && "grayscale",
          )}
        />
        <span className="glass absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
          <Clock className="h-3.5 w-3.5" />{" "}
          {a.ended ? "Ukončeno" : <AuctionCountdown minutes={a.endsInMinutes} />}
        </span>
        {a.myBest !== null && !a.ended ? (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold",
              a.leading
                ? "bg-success text-success-foreground"
                : "bg-destructive text-destructive-foreground",
            )}
          >
            {a.leading ? "Vedete" : "Přehozeno"}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{vehicleTitle(v)}</h3>
        <p className="text-xs text-muted-foreground">
          {v.year} · {num(v.km)} km · {labelOf(fuels, v.fuel)} · {sellerOf(v).city}
        </p>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {a.ended ? "Vydraženo za" : "Aktuální příhoz"}
            </p>
            <p className="font-display text-xl font-extrabold">
              {czk(Math.max(a.currentBid, a.startPrice))}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{a.bids} příhozů</p>
        </div>
      </div>
    </Link>
  );
}
