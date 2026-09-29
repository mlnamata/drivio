import { createFileRoute, Link } from "@tanstack/react-router";
import heroCar from "@/assets/hero-car.jpg";
import { Page, SectionTitle } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { auctions, czk, plans, vehicles } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drivio — inzerce ojetých vozů, která tlačí na rychlý prodej" },
      {
        name: "description",
        content:
          "Drivio je inzertní platforma pro autobazary: sloty v digitální garáži, rostoucí poplatky za ležáky a aukce od 1 Kč.",
      },
      { property: "og:title", content: "Drivio — inzerce, která tlačí na rychlý prodej" },
      {
        property: "og:description",
        content:
          "Sloty místo plateb za inzerát, rostoucí sazba za ležáky a záchranná aukce od 1 Kč.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    n: "01",
    t: "Pronajmete si sloty",
    d: "Místo platby za každý inzerát platíte měsíční paušál za kapacitu digitální garáže.",
  },
  {
    n: "02",
    t: "Sazba roste s časem",
    d: "1. měsíc základ, 2. měsíc +50 %, 3. měsíc +100 %. Ležák se prostě nevyplatí.",
  },
  {
    n: "03",
    t: "Záchranná brzda: aukce",
    d: "Po 3 měsících nabídneme přesun do aukce od 1 Kč — poplatky za ten měsíc odpouštíme.",
  },
];

function Index() {
  return (
    <Page>
      <section className="relative overflow-hidden">
        <img
          src={heroCar}
          alt="Ojetý vůz na noční ploše autobazaru"
          width={1600}
          height={1008}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--gradient-night)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-28 md:py-40">
          <p className="mb-4 inline-flex rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            SaaS inzerce pro autobazary
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl">
            Auta, která stojí,{" "}
            <span className="text-heat">začnou stát peníze</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Drivio je inzertní portál s dynamickými poplatky. Čím déle vůz leží, tím
            dražší inzerát je — a tím rychleji se dostane na realistickou cenu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inzeraty"
              className="bg-heat rounded-lg px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Prohlédnout vozy
            </Link>
            <Link
              to="/cenik"
              className="rounded-lg border border-border bg-card/70 px-6 py-3 font-semibold backdrop-blur transition-colors hover:bg-accent"
            >
              Ceník slotů
            </Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 md:grid-cols-4">
            {[
              ["4 130", "aktivních vozů"],
              ["312", "autobazarů"],
              ["27 dní", "průměrná doba prodeje"],
              ["1 Kč", "vyvolávací cena aukcí"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-bold">{v}</dt>
                <dd className="text-sm text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle
          eyebrow="Jak to funguje"
          title="Tři kroky, jedna motivace: prodat rychle"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="surface-card p-6">
              <span className="font-display text-3xl font-bold text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow="Nabídka" title="Čerstvě vložené vozy" />
          <Link to="/inzeraty" className="mb-8 text-sm font-semibold text-primary">
            Všechny inzeráty →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.slice(0, 3).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="surface-card overflow-hidden md:flex">
          <div className="flex-1 p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Záchranná brzda
            </p>
            <h2 className="mt-3 text-3xl font-bold">Aukce od 1 Kč</h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Vůz leží tři měsíce? Přesuňte ho do aukce, odpustíme progresi poplatků a
              provizi platí vydražitel. Příhozy běží živě.
            </p>
            <Link
              to="/aukce"
              className="mt-6 inline-flex rounded-lg border border-primary/50 px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Zobrazit aukce
            </Link>
          </div>
          <div className="flex-1 border-t border-border/70 p-8 md:border-l md:border-t-0 md:p-10">
            {auctions.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border-b border-border/60 py-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.bids} příhozů · končí za {a.endsIn}
                  </p>
                </div>
                <p className="font-display font-bold text-primary">{czk(a.currentBid)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <SectionTitle
          eyebrow="Ceník"
          title="Platíte za místo v garáži, ne za každý inzerát"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`surface-card p-6 ${p.highlight ? "glow" : ""}`}
            >
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-3 font-display text-3xl font-bold">
                {czk(p.price)}
                <span className="text-base font-normal text-muted-foreground"> / měsíc</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {p.slots} slotů · {p.limit}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
