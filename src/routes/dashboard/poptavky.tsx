import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { leadsSample } from "@/lib/billing";
import { vehicleById, vehicleTitle } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/poptavky")({ component: Leads });

const statusMap = {
  new: ["info", "Nová"],
  sent: ["muted", "Předáno partnerovi"],
  replied: ["ok", "Zodpovězeno"],
  approved: ["ok", "Úvěr schválen"],
  rejected: ["bad", "Zamítnuto"],
} as const;

function Leads() {
  return (
    <>
      <PageHeader
        title="Poptávky"
        desc="Dotazy zákazníků na vaše vozy a stav jejich žádostí o financování."
      />
      <DataTable head={["ID", "Zákazník", "Vůz", "Typ", "Přijato", "Stav"]}>
        {leadsSample.map((l) => {
          const [tone, label] = statusMap[l.status];
          return (
            <tr key={l.id}>
              <td className="font-mono text-xs">{l.id}</td>
              <td>
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.contact}</p>
              </td>
              <td>{vehicleTitle(vehicleById(l.vehicleId)!)}</td>
              <td>
                {l.kind === "financing"
                  ? `Financování${"partner" in l ? ` · ${l.partner}` : ""}`
                  : "Dotaz na vůz"}
              </td>
              <td className="text-muted-foreground">{l.at}</td>
              <td>
                <StatusBadge tone={tone}>{label}</StatusBadge>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
