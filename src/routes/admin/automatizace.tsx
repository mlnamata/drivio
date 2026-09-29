import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";

export const Route = createFileRoute("/admin/automatizace")({ component: Jobs });

const jobs = [
  [
    "drivio-billing-daily",
    "5 0 * * *",
    "billing-processor",
    "Věk inzerátů, progrese, doplatky, podklad k faktuře",
    "dnes 00:05 UTC",
    "ok",
  ],
  [
    "drivio-stale-offer",
    "15 6 * * *",
    "stale-notifier",
    "Ležáky 90+ dní → notifikace a nabídka aukce (Resend)",
    "dnes 06:15 UTC",
    "ok",
  ],
  [
    "drivio-auction-close",
    "* * * * *",
    "SQL: close_expired_auctions()",
    "Uzavření skončených aukcí, určení vítěze",
    "před 32 s",
    "ok",
  ],
  [
    "drivio-invoice-monthly",
    "0 3 1 * *",
    "invoice-issuer",
    "Vystavení faktur ve Fakturoidu (ISDOC)",
    "1. 9. 03:00 UTC",
    "ok",
  ],
  [
    "drivio-gdpr-anonymize",
    "30 2 * * 0",
    "SQL: anonymize_expired_leads()",
    "Anonymizace leadů starších 12 měsíců",
    "28. 9. 02:30 UTC",
    "warn",
  ],
] as const;

function Jobs() {
  return (
    <>
      <PageHeader
        title="Automatizace"
        desc="Úlohy pg_cron. Těžká logika běží v Edge Functions, volaných přes pg_net s klíčem z Vaultu."
      />
      <DataTable head={["Úloha", "Plán (UTC)", "Cíl", "Popis", "Poslední běh", ""]}>
        {jobs.map(([name, cron, target, desc, last, st]) => (
          <tr key={name}>
            <td className="font-mono text-xs font-semibold">{name}</td>
            <td className="font-mono text-xs">{cron}</td>
            <td className="text-xs">{target}</td>
            <td className="text-sm text-muted-foreground">{desc}</td>
            <td>
              {st === "ok" ? (
                <StatusBadge tone="ok">{last}</StatusBadge>
              ) : (
                <StatusBadge tone="warn">{last} · pomalé</StatusBadge>
              )}
            </td>
            <td>
              <button
                className="rounded-lg p-2 hover:bg-muted"
                aria-label="Spustit"
                onClick={() => toast.success(`${name} spuštěno ručně`)}
              >
                <Play className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
