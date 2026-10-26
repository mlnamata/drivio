import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellRing, CalendarClock, ChevronDown, Clock, Gavel, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AuctionCountdown } from "@/components/auction-countdown";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { fuels, labelOf } from "@/lib/catalog";
import { czk, num, sellerOf, vehicleTitle, type Vehicle } from "@/lib/mock-data";
import { store, useAllVehicles, useAuctions, type LiveAuction } from "@/lib/store";
import { cn, plural } from "@/lib/utils";

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

  const totalBids = live.reduce((sum, x) => sum + x.a.bids, 0);
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
        <div className="grid gap-4 border-b border-border pb-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-12">
          <h1 className="text-4xl font-extrabold leading-[1.05] md:text-5xl">Aukce aut od 1 Kč</h1>
          <div>
            <p className="max-w-xl text-muted-foreground">
              Živé dražby a{"\u00a0"}galerie vozů, které se brzy začnou dražit. Vyvolávací cena 1
              {"\u00a0"}Kč, příhozy živě, vydražitel platí jen aukční poplatek 3–5{"\u00a0"}%.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium">
              {live.length ? (
                <span
                  className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-auction"
                  aria-hidden
                />
              ) : null}
              Právě běží {live.length} {plural(live.length, "aukce", "aukce", "aukcí")},{" "}
              {upcoming.length} {plural(upcoming.length, "vůz čeká", "vozy čekají", "vozů čeká")} na
              start, zatím {num(totalBids)} {plural(totalBids, "příhoz", "příhozy", "příhozů")}.
            </p>
          </div>
        </div>

        {/* Navigace po sekcích jedné stránky */}
        <nav className="sticky top-16 z-30 mt-6 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 shadow-[var(--shadow-card)]">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-foreground/75 transition hover:bg-foreground hover:text-background"
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
                      <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} />
                      <span className="photo-chip absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
                        <Clock className="h-3.5 w-3.5" /> Start za{" "}
                        <AuctionCountdown minutes={a.startsInMinutes ?? 0} />
                      </span>
                    </div>
                    <div className="p-4 pb-0">
                      <h3 className="text-lg font-semibold">{vehicleTitle(v)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {v.year}, {num(v.km)} km, {labelOf(fuels, v.fuel)}, {sellerOf(v).city}
                      </p>
                      <p className="mt-2 text-sm">
                        Vyvolávací cena <strong>{czk(a.startPrice)}</strong>
                        {a.reservePrice ? ", s minimální cenou" : ", bez minimální ceny"}
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
                        "inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold",
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

        <h2 className="mt-16 text-2xl font-bold">Jak aukce funguje</h2>
        <ol className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-4">
          {[
            [
              "Registrace dražitele",
              "Jednorázově potvrdíte kontakt a\u00a0aukční řád. Pak můžete přihazovat.",
            ],
            [
              "Přihazujte, nebo nastavte maximum",
              "Automatické přihazování vás drží ve vedení až do vámi zvolené částky.",
            ],
            [
              "Ochrana proti snipingu",
              "Příhoz v\u00a0posledních 2\u00a0minutách prodlouží aukci o\u00a0další 2\u00a0minuty.",
            ],
            [
              "Vyhráli jste",
              "Do 3\u00a0dnů uhradíte cenu prodejci a\u00a0aukční poplatek platformě, pak si vůz převezmete.",
            ],
          ].map(([t, d], i) => (
            <li key={t} className="border-t-2 border-foreground pt-4">
              <span className="font-display text-sm font-bold text-muted-foreground">
                Krok {i + 1}
              </span>
              <p className="mt-1 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-x-8 gap-y-4 border-t border-border pt-6 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            <strong className="text-foreground">Férová pravidla.</strong> Prodejce nesmí přihazovat
            na vlastní vůz, všechny příhozy jsou veřejně vidět a{"\u00a0"}databáze je zpracovává
            jeden po druhém, takže se dva současné příhozy nikdy nepřepíšou.
          </p>
          <p>
            <strong className="text-foreground">Aukční poplatek</strong> 3–5{"\u00a0"}% z{"\u00a0"}
            vydražené ceny platí vydražitel. Výši vidíte u{"\u00a0"}každé aukce ještě před příhozem.{" "}
            <Link to="/pravni/obchodni-podminky" className="text-primary-ink underline">
              Aukční řád
            </Link>
          </p>
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
        <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} className={cn(a.ended && "grayscale")} />
        <span className="photo-chip absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
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
          {v.year}, {num(v.km)} km, {labelOf(fuels, v.fuel)}, {sellerOf(v).city}
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
