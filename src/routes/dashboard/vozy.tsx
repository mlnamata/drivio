import { createFileRoute, Link } from "@tanstack/react-router";
import { Gavel, Pencil, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { btn, DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { CarImage } from "@/components/car-image";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CURRENT_DEALER, useDealerBilling } from "@/lib/billing";
import { czk, num, vehicleTitle, type Vehicle } from "@/lib/mock-data";
import { store, useAllVehicles } from "@/lib/store";

export const Route = createFileRoute("/dashboard/vozy")({ component: MyCars });

function MyCars() {
  const all = useAllVehicles();
  const b = useDealerBilling(CURRENT_DEALER);
  const soldList = all.filter((v) => v.dealerId === CURRENT_DEALER && v.status === "sold");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const lines = b.lines.filter((l) =>
    vehicleTitle(l.vehicle).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Moje vozy"
        desc={
          b.payg
            ? `${b.used} vozů · tarif Platba za vůz`
            : `${b.used} z ${b.plan.slots} slotů obsazeno · limit ceny ${b.plan.maxPrice ? czk(b.plan.maxPrice) : "bez limitu"}`
        }
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
          const v = l.vehicle;
          const inAuction = v.status === "in_auction";
          return (
            <tr key={v.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg">
                    <CarImage src={v.photos[0]!} alt="" />
                  </div>
                  <div>
                    <Link
                      to="/inzerat/$id"
                      params={{ id: v.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {vehicleTitle(v)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {v.year} · {num(v.km)} km · VIN {v.vin.slice(-6)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="font-semibold">{czk(v.price)}</td>
              <td>
                {v.listedDays} dní
                <p className="text-xs text-muted-foreground">
                  {Math.min(l.month, 3)}. měsíc{l.month > 3 ? "+" : ""}
                </p>
              </td>
              <td>
                <span className="font-semibold">{czk(l.total)}</span>
                <p className="text-xs text-muted-foreground">
                  {l.progression ? `+${czk(l.progression)} progrese ` : ""}
                  {l.surcharge ? `+${czk(l.surcharge)} doplatek` : ""}
                  {!l.progression && !l.surcharge
                    ? inAuction
                      ? "progrese odpuštěna"
                      : "základ"
                    : ""}
                </p>
              </td>
              <td>
                {inAuction ? (
                  <StatusBadge tone="info">V aukci</StatusBadge>
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
                  {!inAuction ? (
                    <button
                      className="rounded-lg p-2 hover:bg-muted"
                      aria-label="Změnit cenu"
                      title="Změnit cenu"
                      onClick={() => setEditing(v)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}
                  {l.month >= 3 && !inAuction ? (
                    <button
                      className="rounded-lg p-2 text-primary hover:bg-muted"
                      aria-label="Přesunout do aukce"
                      title="Přesunout do aukce od 1 Kč"
                      onClick={() => {
                        store.sendToAuction(v.id);
                        toast.success("Vůz je v aukci od 1 Kč", {
                          description: "Aukce běží 7 dní, progrese za tento měsíc je odpuštěna.",
                        });
                      }}
                    >
                      <Gavel className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    className="rounded-lg px-2 py-1 text-xs font-semibold hover:bg-muted"
                    onClick={() => {
                      store.markSold(v.id);
                      toast.success("Označeno jako prodané", {
                        description: "Slot je volný, provize se připíše do další faktury.",
                      });
                    }}
                  >
                    Prodáno
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {soldList.length ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Prodáno tento měsíc: {soldList.map((v) => vehicleTitle(v)).join(", ")}
        </p>
      ) : null}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle>Změnit cenu</DialogTitle>
          <DialogDescription>{editing ? vehicleTitle(editing) : ""}</DialogDescription>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const price = Number(new FormData(e.currentTarget).get("price"));
              if (editing && price > 0) {
                store.setPrice(editing.id, price);
                toast.success(`Nová cena ${czk(price)}`);
              }
              setEditing(null);
            }}
          >
            <input
              name="price"
              type="number"
              min={1000}
              step={1000}
              defaultValue={editing?.price}
              className="field text-lg font-semibold"
              autoFocus
            />
            <button className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
              Uložit
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
