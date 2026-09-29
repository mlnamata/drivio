import { Check } from "lucide-react";
import { useState } from "react";
import {
  commissionFor,
  commissionTiers,
  czk,
  num,
  plans,
  slotSurcharge,
  surchargeFactor,
  TOP_TIER_LISTING_PRICE,
  type PlanId,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PlanCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {plans.map((p) => (
        <div
          key={p.id}
          className={cn("surface-card relative p-6", p.highlight && "ring-2 ring-primary")}
        >
          {p.highlight ? (
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Nejoblíbenější
            </span>
          ) : null}
          <h3 className="text-lg font-bold">{p.name}</h3>
          <p className="mt-3 font-display text-4xl font-extrabold">
            {num(p.price)} Kč
            <span className="text-base font-medium text-muted-foreground"> / měsíc</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">bez DPH · {czk(p.perSlot)} za slot</p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              `${p.slots} aktivních inzerátů současně`,
              p.maxPrice ? `Vozy do ${num(p.maxPrice)} Kč` : "Bez limitu ceny vozu",
              "Neomezená výměna vozů ve slotech",
              "Faktura ve formátu ISDOC",
              "Přístup k aukčnímu modulu",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" /> {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Interaktivní výpočet měsíčního poplatku za jeden slot (progrese + doplatek). */
export function SlotCalculator() {
  const [planId, setPlanId] = useState<PlanId>("economy");
  const [price, setPrice] = useState(2000000);
  const [month, setMonth] = useState(1);
  const plan = plans.find((p) => p.id === planId)!;
  const surcharge = slotSurcharge(plan, price);
  const factor = surchargeFactor(month);
  const progression = Math.round(plan.perSlot * (factor - 1));
  const commission = commissionFor(price);

  return (
    <div className="surface-card grid gap-8 p-6 md:grid-cols-2 md:p-8">
      <div className="space-y-5">
        <p className="font-display text-xl font-bold">Spočítejte si poplatek za vůz</p>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Balíček</span>
          <select
            className="field"
            value={planId}
            onChange={(e) => setPlanId(e.target.value as PlanId)}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Cena vozu (Kč)</span>
          <input
            type="number"
            className="field"
            value={price}
            step={10000}
            min={0}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />
        </label>
        <div className="text-sm">
          <span className="mb-1.5 block text-muted-foreground">Měsíc inzerce</span>
          <div className="flex gap-2">
            {[1, 2, 3].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonth(m)}
                className={cn(
                  "flex-1 rounded-full border py-2 font-semibold",
                  month === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {m}. měsíc{m === 3 ? "+" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-muted p-6">
        <dl className="space-y-3 text-sm">
          <Row k="Podíl slotu v balíčku" v={czk(plan.perSlot)} />
          <Row
            k={`Časová progrese (${month}. měsíc, ×${factor.toLocaleString("cs-CZ")})`}
            v={progression ? `+ ${czk(progression)}` : "0 Kč"}
          />
          <Row
            k={
              surcharge
                ? `Doplatek nad limit (${czk(TOP_TIER_LISTING_PRICE)} − ${czk(plan.perSlot)})`
                : "Doplatek nad limit balíčku"
            }
            v={surcharge ? `+ ${czk(surcharge)}` : "0 Kč"}
          />
          <div className="border-t border-border pt-3">
            <Row k="Náklad slotu za měsíc" v={czk(plan.perSlot + progression + surcharge)} strong />
          </div>
          <Row
            k={`Provize při prodeji (${(commissionTiers.find((t) => price <= t.upTo)!.rate * 100).toLocaleString("cs-CZ")} %)`}
            v={czk(commission)}
          />
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Doplatek se týká jen konkrétního slotu s dražším vozem – balíček ani ostatní vozy se
          nezdražují. Po 3. měsíci můžete vůz přesunout do aukce a progresi za daný měsíc
          odpouštíme.
        </p>
      </div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={cn("text-muted-foreground", strong && "font-semibold text-foreground")}>
        {k}
      </dt>
      <dd className={cn("font-semibold tabular-nums", strong && "font-display text-lg")}>{v}</dd>
    </div>
  );
}
