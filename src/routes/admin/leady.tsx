import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PageHeader, Stat, StatusBadge } from "@/components/app-shell";
import { leadsSample } from "@/lib/billing";
import { financePartners } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/leady")({ component: AdminLeads });

function AdminLeads() {
  const fin = leadsSample.filter((l) => l.kind === "financing");
  return (
    <>
      <PageHeader
        title="Leady a partneři"
        desc="Předávání žádostí o financování partnerům (podepsané webhooky, idempotence, souhlas GDPR)."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {financePartners.map((p) => (
          <Stat
            key={p.id}
            label={p.name}
            value="API online"
            hint="p95 odezva 420 ms · CPL 350 Kč"
            tone="ok"
          />
        ))}
      </div>
      <DataTable head={["ID", "Žadatel", "Partner", "Souhlas", "Doručení", "Výsledek"]}>
        {fin.map((l) => (
          <tr key={l.id}>
            <td className="font-mono text-xs">{l.id}</td>
            <td>{l.name}</td>
            <td>{"partner" in l ? l.partner : "—"}</td>
            <td className="text-xs text-muted-foreground">v2026-09-v1 · IP uložena</td>
            <td>
              <StatusBadge tone="ok">200 OK</StatusBadge>
            </td>
            <td>
              {l.status === "approved" ? (
                <StatusBadge tone="ok">Schváleno</StatusBadge>
              ) : l.status === "rejected" ? (
                <StatusBadge tone="bad">Zamítnuto</StatusBadge>
              ) : (
                <StatusBadge tone="muted">Čeká</StatusBadge>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
