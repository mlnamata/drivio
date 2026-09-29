import { createFileRoute, Link } from "@tanstack/react-router";
import { Gavel, Pencil, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { btn, DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { CarImage } from "@/components/car-image";
import { CURRENT_DEALER, dealerBilling } from "@/lib/billing";
import { czk, num, vehicleTitle } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/vozy")({ component: MyCars });

function MyCars() {
  const b = dealerBilling(CURRENT_DEALER);
  const [q, setQ] = useState("");
  const [sold, setSold] = useState<string[]>([]);
  const lines = b.lines.filter((l) =>
    vehicleTitle(l.vehicle).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Moje vozy"
        desc={`${b.used} z ${b.plan.slots} slotů obsazeno · limit ceny ${b.plan.maxPrice ? czk(b.plan.maxPrice) : "bez limitu"}`}
        actions={
          <Link to="/dashboard/pridat" className={btn.primary}>
            Přidat vůz
          </Link>
        }
      />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat vůz…"
          className="field pl-9"
        />
      </div>
      <DataTable head={["Vůz", "Cena", "Inzerce", "Náklad slotu", "Stav", ""]}>
        {lines.map((l) => {
          const isSold = sold.includes(l.vehicle.id);
          return (
            <tr key={l.vehicle.id} className={isSold ? "opacity-50" : undefined}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-16 overflow-hidden rounded-lg">
                    <CarImage src={l.vehicle.photos[0]!} alt="" />
                  </div>
                  <div>
                    <Link
                      to="/inzerat/$id"
                      params={{ id: l.vehicle.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {vehicleTitle(l.vehicle)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {l.vehicle.year} · {num(l.vehicle.km)} km · VIN {l.vehicle.vin.slice(-6)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="font-semibold">{czk(l.vehicle.price)}</td>
              <td>
                {l.vehicle.listedDays} dní
                <p className="text-xs text-muted-foreground">
                  {Math.min(l.month, 3)}. měsíc{l.month > 3 ? "+" : ""}
                </p>
              </td>
              <td>
                <span className="font-semibold">{czk(l.total)}</span>
                <p className="text-xs text-muted-foreground">
                  {l.progression ? `+${czk(l.progression)} progrese ` : ""}
                  {l.surcharge ? `+${czk(l.surcharge)} doplatek` : ""}
                  {!l.progression && !l.surcharge ? "základ" : ""}
                </p>
              </td>
              <td>
                {isSold ? (
                  <StatusBadge tone="muted">Prodáno</StatusBadge>
                ) : l.stale ? (
                  <StatusBadge tone="warn">Ležák</StatusBadge>
                ) : l.surcharge ? (
                  <StatusBadge tone="info">Nad limit</StatusBadge>
                ) : (
                  <StatusBadge tone="ok">Aktivní</StatusBadge>
                )}
              </td>
              <td>
                <div className="flex justify-end gap-1">
                  <button
                    className="rounded-lg p-2 hover:bg-muted"
                    aria-label="Upravit"
                    onClick={() =>
                      toast("Editace inzerátu", {
                        description: "Formulář je stejný jako Přidat vůz.",
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {l.month >= 3 && !isSold ? (
                    <button
                      className="rounded-lg p-2 text-auction hover:bg-muted"
                      aria-label="Do aukce"
                      onClick={() => toast.success("Vůz odeslán do aukce od 1 Kč")}
                    >
                      <Gavel className="h-4 w-4" />
                    </button>
                  ) : null}
                  {!isSold ? (
                    <button
                      className="rounded-lg px-2 py-1 text-xs font-semibold hover:bg-muted"
                      onClick={() => {
                        setSold((s) => [...s, l.vehicle.id]);
                        toast.success("Označeno jako prodané", {
                          description: "Slot je volný, provize se připíše do další faktury.",
                        });
                      }}
                    >
                      Prodáno
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
