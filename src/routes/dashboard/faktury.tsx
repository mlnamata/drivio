import { createFileRoute } from "@tanstack/react-router";
import { Download, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import { btn, DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { invoices } from "@/lib/billing";
import { czk } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/faktury")({ component: Invoices });

function Invoices() {
  return (
    <>
      <PageHeader
        title="Faktury"
        desc="Faktury vystavuje Fakturoid. PDF obsahuje ISDOC vrstvu pro import do Pohody, Money S3 či ABRA Flexi."
      />
      <DataTable head={["Číslo", "Období", "Vystaveno", "Splatnost", "Částka", "Stav", ""]}>
        {invoices.map((i) => (
          <tr key={i.id}>
            <td className="font-mono text-xs">{i.id}</td>
            <td>{i.period}</td>
            <td>{i.issued}</td>
            <td>{i.due}</td>
            <td className="font-semibold">{czk(i.amount)}</td>
            <td>
              {i.status === "paid" ? (
                <StatusBadge tone="ok">Uhrazeno</StatusBadge>
              ) : (
                <StatusBadge tone="warn">K úhradě</StatusBadge>
              )}
            </td>
            <td>
              <div className="flex justify-end gap-1">
                <button
                  className="rounded-lg p-2 hover:bg-muted"
                  aria-label="Stáhnout PDF"
                  onClick={() => toast("Stahuji ISDOC.pdf…")}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg p-2 hover:bg-muted"
                  aria-label="Stáhnout ISDOC XML"
                  onClick={() => toast("Stahuji .isdoc…")}
                >
                  <FileCode2 className="h-4 w-4" />
                </button>
                {i.status === "unpaid" ? (
                  <button
                    className={btn.primary}
                    onClick={() => toast("Přesměrování na platební bránu GoPay…")}
                  >
                    Zaplatit
                  </button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
