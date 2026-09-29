import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, Gavel, Info, Scale, Timer, Trophy, Users } from "lucide-react";
import { z } from "zod";
import { AuctionCountdown } from "@/components/auction-countdown";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { fuels, labelOf } from "@/lib/catalog";
import { czk, num, sellerOf, vehicleTitle } from "@/lib/mock-data";
import { useAllVehicles, useAuctions, type LiveAuction } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "live", label: "Probíhající" },
  { value: "ending", label: "Končí do 24 h" },
  { value: "mine", label: "Moje příhozy" },
  { value: "ended", label: "Ukončené" },
] as const;
type Tab = (typeof tabs)[number]["value"];

export const Route = createFileRoute("/aukce/")({
  validateSearch: (s) =>
    z
      .object({ tab: z.enum(["live", "ending", "mine", "ended"]).optional().catch(undefined) })
      .parse(s),
  head: () => ({
    meta: [
      { title: "Aukce aut od 1 Kč | Drivio" },
      {
        name: "description",
        content:
          "Živé aukce ojetých aut s vyvolávací cenou 1 Kč. Přihazujte v reálném čase, automatické přihazování, transparentní aukční poplatek.",
      },
      { property: "og:title", content: "Aukce aut od 1 Kč | Drivio" },
    ],
  }),
  component: AuctionList,
});

const filterFor: Record<Tab, (a: LiveAuction) => boolean> = {
  live: (a) => !a.ended,
  ending: (a) => !a.ended && a.endsInMinutes <= 24 * 60,
  mine: (a) => a.myBest !== null,
  ended: (a) => a.ended,
};

function AuctionList() {
  const { tab = "live" } = Route.useSearch();
  const navigate = useNavigate({ from: "/aukce/" });
  const auctions = useAuctions();
  const vehicles = useAllVehicles();
  const live = auctions.filter((a) => !a.ended);
  const list = auctions
    .filter(filterFor[tab])
    .sort((a, b) => (tab === "ended" ? 0 : a.endsInMinutes - b.endsInMinutes));

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
                Autobazary sem posílají vozy, které chtějí prodat hned. Vyvolávací cena je 1 Kč,
                příhozy se zobrazují živě a vydražitel platí jen aukční poplatek 3–5 %.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                [String(live.length), "živých aukcí"],
                [num(live.reduce((s, a) => s + a.bids, 0)), "příhozů"],
                ["1 Kč", "vyvolávací cena"],
              ].map(([v, l]) => (
                <div key={l} className="glass-dark rounded-2xl p-3">
                  <dt className="font-display text-2xl font-extrabold">{v}</dt>
                  <dd className="text-xs text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() =>
                void navigate({ search: t.value === "live" ? {} : { tab: t.value }, replace: true })
              }
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === t.value ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">
                {auctions.filter(filterFor[t.value]).length}
              </span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="surface-card mt-6 p-12 text-center">
            <Gavel className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">
              {tab === "mine" ? "Zatím jste nepřihazovali" : "V této kategorii nejsou žádné aukce"}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((a) => {
              const v = vehicles.find((x) => x.id === a.vehicleId);
              if (!v) return null;
              return (
                <Link
                  key={a.id}
                  to="/aukce/$id"
                  params={{ id: a.id }}
                  className="surface-card lift group overflow-hidden"
                >
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
            })}
          </div>
        )}

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
