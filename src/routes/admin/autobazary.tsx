import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { dealerBilling } from "@/lib/billing";
import { czk, dealers } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/autobazary")({ component: Tenants });

function Tenants() {
  return (
    <>
      <PageHeader
        title="Autobazary"
        desc="Tenanti platformy, jejich balíčky a odhad měsíční faktury."
      />
      <DataTable
        head={["Autobazar", "Lokalita", "Balíček", "Sloty", "Odhad faktury", "Hodnocení", ""]}
      >
        {dealers.map((d) => {
          const b = dealerBilling(d.id);
          return (
            <tr key={d.id}>
              <td>
                <p className="font-semibold">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.email}</p>
              </td>
              <td>{d.city}</td>
              <td>
                <StatusBadge tone="info">{b.plan.name}</StatusBadge>
              </td>
              <td>
                {b.used}/{b.plan.slots}
              </td>
              <td className="font-semibold">{czk(b.total)}</td>
              <td>★ {d.rating.toLocaleString("cs-CZ")}</td>
              <td className="text-right">
                <button
                  className="text-xs font-semibold text-primary"
                  onClick={() => toast(`Přihlášení jako ${d.name} (impersonace, audit log)`)}
                >
                  Spravovat
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
