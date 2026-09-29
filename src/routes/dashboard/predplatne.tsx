import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { SlotCalculator } from "@/components/pricing";
import { CURRENT_DEALER, dealerBilling } from "@/lib/billing";
import { useAllVehicles } from "@/lib/store";
import { czk, num, plans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/predplatne")({ component: Subscription });

function Subscription() {
  const b = dealerBilling(CURRENT_DEALER, useAllVehicles());
  return (
    <>
      <PageHeader
        title="Předplatné"
        desc="Změna balíčku platí od následujícího zúčtovacího období."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const current = p.id === b.plan.id;
          return (
            <div key={p.id} className={cn("surface-card p-5", current && "ring-2 ring-primary")}>
              <p className="font-semibold">{p.name}</p>
              <p className="mt-2 font-display text-3xl font-extrabold">{czk(p.price)}</p>
              <p className="text-sm text-muted-foreground">
                {p.slots} slotů · {p.maxPrice ? `do ${num(p.maxPrice)} Kč` : "bez limitu"}
              </p>
              <button
                disabled={current}
                onClick={() => toast.success(`Balíček ${p.name} bude aktivní od 1. 10.`)}
                className={cn(
                  "mt-4 w-full rounded-full py-2 text-sm font-semibold",
                  current
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {current ? "Aktuální balíček" : "Přejít na tento balíček"}
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
