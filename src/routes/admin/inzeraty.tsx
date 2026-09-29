import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { czk, sellerOf, vehicleTitle } from "@/lib/mock-data";
import { store, useAllVehicles, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/inzeraty")({ component: Moderation });

const statusLabel = {
  active: ["ok", "Aktivní"],
  in_auction: ["info", "V aukci"],
  sold: ["muted", "Prodáno"],
} as const;

function Moderation() {
  const { hidden } = useStore();
  const all = useAllVehicles();
  const [filter, setFilter] = useState<"all" | "private" | "hidden">("all");
  const list = all
    .filter((v) =>
      filter === "private"
        ? v.dealerId === "private"
        : filter === "hidden"
          ? hidden.includes(v.id)
          : true,
    )
    .sort((a, b) => a.listedDays - b.listedDays);

  return (
    <>
      <PageHeader
        title="Inzeráty"
        desc="Moderace a kontrola kvality. Skrytý inzerát zmizí z webu okamžitě."
      />
      <div className="mb-4 flex gap-1">
        {(
          [
            ["all", `Vše (${all.length})`],
            ["private", `Soukromí (${all.filter((v) => v.dealerId === "private").length})`],
            ["hidden", `Skryté (${hidden.length})`],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              filter === k ? "bg-foreground text-background" : "bg-card text-muted-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <DataTable head={["Vůz", "Prodejce", "Cena", "Stáří", "Stav", "Cebia", ""]}>
        {list.map((v) => {
          const isHidden = hidden.includes(v.id);
          const [tone, label] = statusLabel[v.status];
          return (
            <tr key={v.id} className={isHidden ? "opacity-40" : undefined}>
              <td>
                <Link
                  to="/inzerat/$id"
                  params={{ id: v.id }}
                  className="font-semibold hover:text-primary"
                >
                  {vehicleTitle(v)}
                </Link>
              </td>
              <td>{sellerOf(v).name}</td>
              <td>{czk(v.price)}</td>
              <td>{v.listedDays} dní</td>
              <td>
                <StatusBadge tone={isHidden ? "bad" : tone}>
                  {isHidden ? "Skryto" : label}
                </StatusBadge>
              </td>
              <td>
                {v.cebiaVerified ? (
                  <StatusBadge tone="ok">Ověřeno</StatusBadge>
                ) : (
                  <StatusBadge tone="muted">—</StatusBadge>
                )}
              </td>
              <td className="text-right">
                <button
                  className={cn(
                    "text-xs font-semibold",
                    isHidden ? "text-primary" : "text-destructive",
                  )}
                  onClick={() => {
                    store.toggleHidden(v.id);
                    toast(isHidden ? "Inzerát obnoven" : "Inzerát skryt z webu");
                  }}
                >
                  {isHidden ? "Obnovit" : "Skrýt"}
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
