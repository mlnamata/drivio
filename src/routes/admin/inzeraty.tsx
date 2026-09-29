import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { czk, dealerById, vehicles, vehicleTitle } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/inzeraty")({ component: Moderation });

function Moderation() {
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <>
      <PageHeader
        title="Inzeráty"
        desc="Moderace a kontrola kvality. Nahlášené inzeráty jsou nahoře."
      />
      <DataTable head={["Vůz", "Autobazar", "Cena", "Stáří", "VIN kontrola", ""]}>
        {vehicles
          .slice()
          .sort((a, b) => b.listedDays - a.listedDays)
          .map((v, i) => (
            <tr key={v.id} className={hidden.includes(v.id) ? "opacity-40" : undefined}>
              <td className="font-semibold">{vehicleTitle(v)}</td>
              <td>{dealerById(v.dealerId).name}</td>
              <td>{czk(v.price)}</td>
              <td>{v.listedDays} dní</td>
              <td>
                {i === 2 ? (
                  <StatusBadge tone="warn">Nesoulad roku</StatusBadge>
                ) : (
                  <StatusBadge tone="ok">OK</StatusBadge>
                )}
              </td>
              <td className="text-right">
                <button
                  className="text-xs font-semibold text-destructive"
                  onClick={() => {
                    setHidden((h) =>
                      h.includes(v.id) ? h.filter((x) => x !== v.id) : [...h, v.id],
                    );
                    toast(hidden.includes(v.id) ? "Inzerát obnoven" : "Inzerát skryt");
                  }}
                >
                  {hidden.includes(v.id) ? "Obnovit" : "Skrýt"}
                </button>
              </td>
            </tr>
          ))}
      </DataTable>
    </>
  );
}
