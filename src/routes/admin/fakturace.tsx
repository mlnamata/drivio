import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { btn, DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { dealerBilling } from "@/lib/billing";
import { useAllVehicles } from "@/lib/store";
import { czk, dealers } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/fakturace")({ component: Billing });

function Billing() {
  const vehicles = useAllVehicles();
  return (
    <>
      <PageHeader
        title="Fakturace"
        desc="Podklad z Edge Function billing-processor → Fakturoid API v3 (ISDOC). Úhrady se párují webhookem."
        actions={
          <button
            className={btn.primary}
            onClick={() =>
              toast.success("Zúčtování spuštěno", {
                description: "5 faktur odesláno do Fakturoidu.",
              })
            }
          >
            Spustit zúčtování
          </button>
        }
      />
      <DataTable
        head={[
          "Autobazar",
          "Paušál",
          "Progrese + doplatky",
          "Celkem bez DPH",
          "Fakturoid",
          "Úhrada",
        ]}
      >
        {dealers.map((d, i) => {
          const b = dealerBilling(d.id, vehicles);
          return (
            <tr key={d.id}>
              <td className="font-semibold">{d.name}</td>
              <td>{czk(b.plan.price)}</td>
              <td>{czk(b.extras)}</td>
              <td className="font-semibold">{czk(b.total)}</td>
              <td className="font-mono text-xs">2026-09{String(31 + i)}</td>
              <td>
                {i % 2 ? (
                  <StatusBadge tone="ok">Webhook: zaplaceno</StatusBadge>
                ) : (
                  <StatusBadge tone="warn">Čeká na úhradu</StatusBadge>
                )}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
