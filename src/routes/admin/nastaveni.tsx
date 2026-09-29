import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { btn, PageHeader, StatusBadge } from "@/components/app-shell";
import { commissionTiers, num, plans, TOP_TIER_LISTING_PRICE } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/nastaveni")({ component: AdminSettings });

function AdminSettings() {
  return (
    <>
      <PageHeader title="Nastavení platformy" desc="Ceník, provize a integrace." />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-card space-y-3 p-5">
          <p className="font-semibold">Balíčky</p>
          {plans.map((p) => (
            <div key={p.id} className="grid grid-cols-3 gap-2">
              <input className="field" defaultValue={p.name} aria-label="Název" />
              <input className="field" type="number" defaultValue={p.price} aria-label="Cena" />
              <input className="field" type="number" defaultValue={p.slots} aria-label="Sloty" />
            </div>
          ))}
          <label className="block text-sm">
            <span className="text-muted-foreground">
              Tabulková cena inzerátu nejvyšší kategorie (pro doplatek)
            </span>
            <input className="field mt-1" type="number" defaultValue={TOP_TIER_LISTING_PRICE} />
          </label>
        </section>
        <section className="surface-card space-y-2 p-5">
          <p className="font-semibold">Provize z prodeje</p>
          {commissionTiers.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span>{t.upTo === Infinity ? "nad 700 000 Kč" : `do ${num(t.upTo)} Kč`}</span>
              <input
                className="field w-24"
                type="number"
                step={0.1}
                defaultValue={t.rate * 100}
                aria-label="%"
              />
            </div>
          ))}
        </section>
        <section className="surface-card space-y-3 p-5 xl:col-span-2">
          <p className="font-semibold">Integrace</p>
          {[
            ["Supabase (EU – Frankfurt)", "VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"],
            ["Fakturoid API v3", "FAKTUROID_CLIENT_ID / FAKTUROID_WEBHOOK_SECRET"],
            ["Resend (e-maily, SPF/DKIM/DMARC)", "RESEND_API_KEY"],
            ["Cebia / carVertical (VIN)", "VIN_API_KEY"],
            ["Essox / Home Credit / Cofidis", "PARTNER_*_ENDPOINT + HMAC secret"],
            ["GoPay / Comgate", "GOPAY_CLIENT_ID"],
          ].map(([n, env]) => (
            <div
              key={n}
              className="flex flex-col justify-between gap-1 border-b border-border pb-3 last:border-0 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-medium">{n}</p>
                <p className="font-mono text-xs text-muted-foreground">{env}</p>
              </div>
              <StatusBadge tone="muted">Nastavit v secrets</StatusBadge>
            </div>
          ))}
        </section>
      </div>
      <button className={`${btn.primary} mt-6`} onClick={() => toast.success("Nastavení uloženo")}>
        Uložit
      </button>
    </>
  );
}
