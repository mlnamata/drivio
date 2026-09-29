import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { VehicleForm } from "@/components/vehicle-form";
import { CURRENT_DEALER, dealerBilling } from "@/lib/billing";
import { czk, monthlyPayment, slotSurcharge } from "@/lib/mock-data";
import { store, useAllVehicles } from "@/lib/store";

export const Route = createFileRoute("/dashboard/pridat")({ component: AddCar });

function AddCar() {
  const b = dealerBilling(CURRENT_DEALER, useAllVehicles());
  const navigate = useNavigate();
  const full = b.used >= b.plan.slots;

  return (
    <>
      <PageHeader
        title="Přidat vůz"
        desc="Začněte VIN kódem – výrobce a modelový rok doplníme automaticky."
      />
      {full ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 text-warning" /> Všechny sloty jsou obsazené. Označte
          vůz jako prodaný nebo navyšte balíček.
        </div>
      ) : null}
      <VehicleForm
        submitLabel="Zveřejnit inzerát"
        disabled={full}
        aside={(price) => {
          const surcharge = price ? slotSurcharge(b.plan, price) : 0;
          return (
            <>
              {price ? (
                <p className="text-sm text-muted-foreground">
                  Splátka pro zákazníky od {czk(monthlyPayment(price))}/měs.
                </p>
              ) : null}
              <div className="rounded-xl bg-muted p-4 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Slot v balíčku</span>
                  <span className="font-semibold">{czk(b.plan.perSlot)}</span>
                </p>
                <p className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Doplatek nad limit</span>
                  <span className="font-semibold">
                    {surcharge ? `+ ${czk(surcharge)}` : "0 Kč"}
                  </span>
                </p>
                <p className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Volné sloty</span>
                  <span className="font-semibold">
                    {b.plan.slots - b.used} z {b.plan.slots}
                  </span>
                </p>
                {surcharge ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Cena přesahuje limit balíčku {czk(b.plan.maxPrice ?? 0)}. Doplatek platí jen pro
                    tento slot, balíček se nemění.
                  </p>
                ) : null}
              </div>
            </>
          );
        }}
        onSubmit={(v) => {
          const { contact: _c, ...vehicle } = v;
          store.addVehicle({
            ...vehicle,
            dealerId: CURRENT_DEALER,
            listedAt: new Date().toISOString(),
          });
          toast.success("Inzerát zveřejněn", { description: "Vůz je na webu a zabírá 1 slot." });
          void navigate({ to: "/dashboard/vozy" });
        }}
      />
    </>
  );
}
