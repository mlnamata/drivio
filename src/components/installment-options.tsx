import { useState } from "react";
import { czk, financePartners, monthlyPayment } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const downs = [0, 0.1, 0.2, 0.3];
const terms = [36, 48, 60, 72, 84];

/** Přehled variant splátek u koupě vozu – akontace × doba splácení podle partnera. */
export function InstallmentOptions({ price, onPick }: { price: number; onPick?: () => void }) {
  const [partnerId, setPartnerId] = useState(financePartners[0]!.id);
  const [sel, setSel] = useState<[number, number]>([0, 72]);
  const partner = financePartners.find((p) => p.id === partnerId)!;
  const [d, m] = sel;
  const principal = Math.round(price * (1 - d));
  const pay = monthlyPayment(principal, m, partner.rate);
  const total = pay * m + Math.round(price * d);

  return (
    <section className="surface-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Možnosti splátek</h2>
          <p className="text-sm text-muted-foreground">
            Vyberte akontaci a dobu splácení. Orientační výpočet, bez vlivu na registr.
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {financePartners.map((p) => (
            <button
              key={p.id}
              onClick={() => setPartnerId(p.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                partnerId === p.id ? "bg-card shadow-sm" : "text-muted-foreground",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="px-2 py-2 text-left font-medium">Akontace</th>
              {terms.map((t) => (
                <th key={t} className="px-2 py-2 text-right font-medium">
                  {t} měs.
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {downs.map((down) => (
              <tr key={down} className="border-t border-border">
                <td className="px-2 py-2 text-muted-foreground">
                  {down ? `${down * 100} % (${czk(Math.round(price * down))})` : "Bez akontace"}
                </td>
                {terms.map((t) => {
                  const active = down === d && t === m;
                  return (
                    <td key={t} className="px-1 py-1 text-right">
                      <button
                        onClick={() => setSel([down, t])}
                        className={cn(
                          "w-full rounded-lg px-2 py-1.5 text-right tabular-nums transition",
                          active
                            ? "bg-primary font-bold text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {czk(monthlyPayment(Math.round(price * (1 - down)), t, partner.rate))}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-accent p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-accent-foreground">
          <p>
            <strong className="font-display text-2xl">{czk(pay)}</strong> měsíčně · {m} splátek ·{" "}
            {partner.name} ({partner.product})
          </p>
          <p className="text-xs opacity-80">
            Úvěr {czk(principal)}, úrok od {(partner.rate * 100).toFixed(1).replace(".", ",")} %
            p.a., celkem zaplatíte cca {czk(total)} vč. akontace.
          </p>
        </div>
        {onPick ? (
          <button
            onClick={onPick}
            className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Chci tuto variantu
          </button>
        ) : null}
      </div>
    </section>
  );
}
