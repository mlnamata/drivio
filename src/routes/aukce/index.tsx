import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Gavel, Info, Users } from "lucide-react";
import { AuctionCountdown } from "@/components/auction-countdown";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { fuels, labelOf } from "@/lib/catalog";
import { auctions, czk, dealerById, num, vehicleById, vehicleTitle } from "@/lib/mock-data";

export const Route = createFileRoute("/aukce/")({
  head: () => ({
    meta: [
      { title: "Aukce aut od 1 Kč | Drivio" },
      {
        name: "description",
        content:
          "Živé aukce ojetých aut s vyvolávací cenou 1 Kč. Přihazujte v reálném čase, bez skrytých poplatků.",
      },
      { property: "og:title", content: "Aukce aut od 1 Kč | Drivio" },
    ],
  }),
  component: AuctionList,
});

function AuctionList() {
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Aukce" }]} />
        <div className="relative overflow-hidden rounded-3xl bg-sidebar p-8 text-white md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-auction/25 px-3 py-1 text-xs font-semibold text-[oklch(0.86_0.1_40)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-auction" /> {auctions.length}{" "}
              aukcí právě běží
            </p>
            <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Aukce aut od 1 Kč</h1>
            <p className="mt-3 text-white/70">
              Autobazary sem posílají vozy, které chtějí prodat hned. Vyvolávací cena je 1 Kč,
              příhozy se zobrazují živě a vydražitel platí jen aukční poplatek 3–5 %.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [
              Gavel,
              "Přihazujete online",
              "Minimální příhoz je uveden u každé aukce. Při příhozu v posledních 2 minutách se aukce prodlouží.",
            ],
            [
              Users,
              "Férově a transparentně",
              "Vidíte historii všech příhozů. Prodejce nemůže přihazovat na vlastní vůz.",
            ],
            [
              Info,
              "Aukční poplatek",
              "Po vydražení zaplatíte cenu vozu prodejci a aukční poplatek platformě.",
            ],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Gavel;
            return (
              <div key={t as string} className="surface-card flex gap-3 p-5">
                <I className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{t as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {auctions.map((a) => {
            const v = vehicleById(a.vehicleId)!;
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
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="glass absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                    <Clock className="h-3.5 w-3.5" /> <AuctionCountdown minutes={a.endsInMinutes} />
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{vehicleTitle(v)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {v.year} · {num(v.km)} km · {labelOf(fuels, v.fuel)} ·{" "}
                    {dealerById(v.dealerId).city}
                  </p>
                  <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Aktuální příhoz</p>
                      <p className="font-display text-xl font-extrabold">{czk(a.currentBid)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.bids} příhozů</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </Page>
  );
}
