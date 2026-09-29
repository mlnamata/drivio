import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, SectionTitle } from "@/components/site-shell";
import { auctions, bidFeed, czk } from "@/lib/mock-data";

export const Route = createFileRoute("/aukce")({
  head: () => ({
    meta: [
      { title: "Aukce ojetých vozů od 1 Kč | Drivio" },
      {
        name: "description",
        content:
          "Živé aukce vozů od 1 Kč. Autobazary uvolňují ležáky, provizi platí vydražitel.",
      },
      { property: "og:title", content: "Aukce vozů od 1 Kč | Drivio" },
      {
        property: "og:description",
        content: "Živé příhozy, vozy od 1 Kč, provizi platí vydražitel.",
      },
    ],
  }),
  component: Auctions,
});

function Auctions() {
  const main = auctions[0];
  const [bid, setBid] = useState(main.currentBid + 500);
  const [feed, setFeed] = useState(bidFeed);
  const current = feed[0].amount;

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle
          eyebrow="Záchranná brzda"
          title="Aukce od 1 Kč"
          desc="Náznak aukčního modulu: aktuální cena, historie příhozů a formulář pro příhoz."
        />

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface-card overflow-hidden">
            <img
              src={main.photo}
              alt={main.title}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold">{main.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {main.year} · {main.km.toLocaleString("cs-CZ")} km · {main.dealer}
              </p>
              <div className="mt-6 flex flex-wrap items-end gap-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Aktuální příhoz
                  </p>
                  <p className="font-display text-4xl font-bold text-primary">
                    {czk(current)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Konec za
                  </p>
                  <p className="font-display text-2xl font-bold">{main.endsIn}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  step={500}
                  value={bid}
                  onChange={(e) => setBid(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary"
                />
                <button
                  onClick={() => {
                    if (bid <= current) return;
                    setFeed([{ user: "Vy", amount: bid, time: "právě teď" }, ...feed]);
                    setBid(bid + 500);
                  }}
                  className="bg-heat rounded-lg px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Přihodit
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ukázka. Ostrý provoz bude příhozy zamykat na úrovni databáze a
                rozesílat je živě všem účastníkům.
              </p>
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="mb-4 font-semibold">Historie příhozů</h3>
            <ul className="space-y-3">
              {feed.map((b, i) => (
                <li
                  key={`${b.user}-${b.amount}-${i}`}
                  className="flex items-center justify-between border-b border-border/60 pb-3 text-sm last:border-0"
                >
                  <span>{b.user}</span>
                  <span className="text-right">
                    <span className="block font-semibold">{czk(b.amount)}</span>
                    <span className="text-xs text-muted-foreground">{b.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mb-4 mt-14 text-xl font-bold">Další probíhající aukce</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {auctions.map((a) => (
            <article key={a.id} className="surface-card overflow-hidden">
              <img
                src={a.photo}
                alt={a.title}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="p-5">
                <h4 className="font-semibold">{a.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {a.bids} příhozů · končí za {a.endsIn}
                </p>
                <p className="mt-3 font-display text-xl font-bold text-primary">
                  {czk(a.currentBid)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Page>
  );
}
