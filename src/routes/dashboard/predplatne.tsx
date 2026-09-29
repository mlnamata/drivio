import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { SlotCalculator } from "@/components/pricing";
import { useCurrentDealer, dealerBilling, useDealerBilling } from "@/lib/billing";
import { czk, num, PAYG_PLAN, perVehicleTiers, plans, type PlanId } from "@/lib/mock-data";
import { store, useAllVehicles } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/predplatne")({ component: Subscription });

function Subscription() {
  const dealerId = useCurrentDealer();
  const b = useDealerBilling(dealerId);
  const all = useAllVehicles();
  const choose = (id: PlanId, name: string) => {
    const next = dealerBilling(dealerId, all, id);
    if (id !== "payg" && next.used > next.plan.slots) {
      toast.error(`Balíček má jen ${next.plan.slots} slotů, máte ${next.used} aktivních vozů.`);
      return;
    }
    store.setDealerPlan(dealerId, id);
    toast.success(`Tarif „${name}“ je aktivní`, {
      description: `Odhad faktury za tento měsíc: ${czk(next.total)}`,
    });
  };

  return (
    <>
      <PageHeader
        title="Tarif a předplatné"
        desc="Vyberte, jestli chcete platit za každý vůz zvlášť, nebo si předplatit balíček slotů."
      />

      <div
        className={cn(
          "surface-card mb-6 flex flex-col gap-5 p-6 md:flex-row md:items-center",
          b.payg && "ring-2 ring-primary",
        )}
      >
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bez závazku</p>
          <p className="mt-1 text-xl font-bold">{PAYG_PLAN.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Platíte jen za vozy, které máte zrovna vystavené. Vhodné pro menší prodejce a firmy.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {perVehicleTiers.map((t) => (
              <li key={t.label} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> {t.label}:{" "}
                <strong>{czk(t.price)}</strong> / 30 dní
              </li>
            ))}
          </ul>
        </div>
        <button
          disabled={b.payg}
          onClick={() => choose("payg", PAYG_PLAN.name)}
          className={cn(
            "shrink-0 rounded-full px-6 py-3 text-sm font-semibold",
            b.payg
              ? "bg-muted text-muted-foreground"
              : "bg-foreground text-background hover:bg-foreground/85",
          )}
        >
          {b.payg ? "Aktuální tarif" : "Platit za vůz"}
        </button>
      </div>

      <p className="mb-3 text-sm font-semibold">Předplatné balíčku slotů</p>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const current = p.id === b.plan.id;
          return (
            <div key={p.id} className={cn("surface-card p-5", current && "ring-2 ring-primary")}>
              <p className="font-semibold">{p.name}</p>
              <p className="mt-2 font-display text-3xl font-extrabold">
                {czk(p.price)}
                <span className="text-sm font-medium text-muted-foreground"> / měsíc</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {p.slots} slotů · {p.maxPrice ? `do ${num(p.maxPrice)} Kč` : "bez limitu"} ·{" "}
                {czk(p.perSlot)}/slot
              </p>
              <button
                disabled={current}
                onClick={() => choose(p.id, p.name)}
                className={cn(
                  "mt-4 w-full rounded-full py-2 text-sm font-semibold",
                  current
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {current ? "Aktuální balíček" : "Předplatit"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <SlotCalculator />
      </div>
    </>
  );
}
