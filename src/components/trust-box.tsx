import { BadgeCheck, Flag, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { submitContact } from "@/lib/forms";
import type { Seller, Vehicle } from "@/lib/mock-data";

const reasons = [
  "Podezření na podvod / vůz neexistuje",
  "Nesprávné údaje (km, rok, výbava)",
  "Vůz je už prodaný",
  "Duplicitní inzerát",
  "Jiný důvod",
];

/** Bezpečný nákup – přehled ověření a možnost nahlásit inzerát. */
export function SafeBuyBox({ vehicle: v, seller }: { vehicle: Vehicle; seller: Seller }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = [
    [
      seller.isDealer,
      seller.isDealer ? "Ověřený prodejce s IČO" : "Soukromý prodejce (ověřený e-mail a telefon)",
    ],
    [
      v.cebiaVerified,
      v.cebiaVerified
        ? "Historie ověřena Cebia"
        : "Historie zatím neověřena – doporučujeme report Cebia",
    ],
    [true, `VIN uveden v inzerátu (${v.vin.slice(0, 3)}…${v.vin.slice(-4)})`],
    [v.serviceBook, v.serviceBook ? "Servisní knížka doložena" : "Servisní knížka neuvedena"],
  ] as const;

  return (
    <section className="surface-card p-5">
      <p className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-5 w-5 text-success" /> Bezpečný nákup
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {items.map(([ok, t]) => (
          <li key={t} className="flex items-start gap-2">
            <BadgeCheck
              className={
                ok
                  ? "mt-0.5 h-4 w-4 shrink-0 text-success"
                  : "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              }
            />
            <span className={ok ? "" : "text-muted-foreground"}>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        Nikdy neposílejte zálohu před prohlídkou vozu a porovnejte VIN v technickém průkazu s vozem.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
      >
        <Flag className="h-3.5 w-3.5" /> Nahlásit inzerát
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Nahlásit inzerát</DialogTitle>
          <DialogDescription>Inzerát zkontrolujeme do 24 hodin.</DialogDescription>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setBusy(true);
              try {
                await submitContact({
                  data: {
                    kind: "report",
                    vehicleId: v.id,
                    topic: String(f.get("reason")),
                    name: String(f.get("name") || "Anonym"),
                    email: String(f.get("email")),
                    message: String(f.get("message") ?? ""),
                  },
                });
                setOpen(false);
                toast.success("Děkujeme, inzerát prověříme");
              } catch {
                toast.error("Nahlášení se nepodařilo odeslat, zkontrolujte e-mail.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <select name="reason" className="field" aria-label="Důvod">
              {reasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <textarea
              name="message"
              rows={3}
              className="field"
              placeholder="Popište problém (nepovinné)"
            />
            <div className="grid grid-cols-2 gap-2">
              <input name="name" className="field" placeholder="Jméno (nepovinné)" />
              <input name="email" type="email" required className="field" placeholder="E-mail" />
            </div>
            <button
              disabled={busy}
              className="w-full rounded-full bg-foreground py-2.5 text-sm font-semibold text-background disabled:opacity-60"
            >
              {busy ? "Odesílám…" : "Odeslat nahlášení"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
