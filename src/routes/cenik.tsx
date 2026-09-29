import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, SectionTitle } from "@/components/site-shell";
import { czk, plans } from "@/lib/mock-data";

export const Route = createFileRoute("/cenik")({
  head: () => ({
    meta: [
      { title: "Ceník slotů a doplatků | Drivio" },
      {
        name: "description",
        content:
          "Měsíční balíčky slotů pro autobazary, progrese poplatků v čase a kalkulačka dynamického doplatku.",
      },
      { property: "og:title", content: "Ceník slotů a doplatků | Drivio" },
      {
        property: "og:description",
        content: "Balíčky Garáž ECONOMY, STANDARD a PREMIUM plus kalkulačka doplatku.",
      },
    ],
  }),
  component: Pricing,
});

const TOP_RATE = 499;

function Pricing() {
  const [planIdx, setPlanIdx] = useState(0);
  const [price, setPrice] = useState(2000000);
  const plan = plans[planIdx]!;
  const limit = [200000, 700000, Infinity][planIdx]!;
  const over = price > limit;
  const surcharge = over ? Math.max(0, TOP_RATE - plan.perSlot) : 0;

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle
          eyebrow="Ceník"
          title="Sloty v digitální garáži"
          desc="Pronajmete si kapacitu, ne jednotlivé inzeráty. Vozy v rámci limitu točíte libovolně."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`surface-card p-6 ${p.highlight ? "glow" : ""}`}>
              {p.highlight ? (
                <span className="mb-3 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  Nejoblíbenější
                </span>
              ) : null}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-3 font-display text-3xl font-bold">
                {czk(p.price)}
                <span className="text-base font-normal text-muted-foreground"> / měsíc</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li>{p.slots} aktivních inzerátů</li>
                <li>{p.limit}</li>
                <li>{czk(p.perSlot)} za slot</li>
                <li>Neomezené střídání vozů</li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="surface-card p-6">
            <h3 className="text-xl font-bold">Progrese poplatku v čase</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sazba za konkrétní slot roste podle stáří inzerátu.
            </p>
            <div className="mt-6 space-y-4">
              {[
                ["1. měsíc", 1],
                ["2. měsíc", 1.5],
                ["3. měsíc", 2],
              ].map(([label, f]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">
                      {czk(Math.round(plan.perSlot * (f as number)))} / slot
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-secondary">
                    <div
                      className="bg-heat h-2 rounded-full"
                      style={{ width: `${((f as number) / 2) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="text-xl font-bold">Kalkulačka dynamického doplatku</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Dražší vůz v levném balíčku nezdraží celý balíček — doplatíte jen jeden slot.
            </p>
            <label className="mt-6 block text-sm">
              Balíček
              <select
                value={planIdx}
                onChange={(e) => setPlanIdx(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"
              >
                {plans.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm">
              Cena vozu
              <input
                type="number"
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <div className="mt-6 space-y-2 border-t border-border/70 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Předplatné</span>
                <span>{czk(plan.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doplatek za nadlimitní vůz</span>
                <span>{czk(surcharge)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Celkem za měsíc</span>
                <span className="text-primary">{czk(plan.price + surcharge)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
