import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check, Minus, Plus, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { brandBySlug, bodyTypes, fuels, labelOf } from "@/lib/catalog";
import { LEASING_CONSENT_TEXT, submitLead } from "@/lib/leads";
import { leaseKm, leaseMonthly, leasingOffers } from "@/lib/leasing";
import { czk, num } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leasing/firmy")({
  head: () => ({
    meta: [
      { title: "Operativní leasing pro firmy – ceník bez DPH | Drivio" },
      {
        name: "description",
        content:
          "Přehled vozů na operativní leasing pro firmy a živnostníky. Ceny bez DPH pro 36, 48 a 60 měsíců, poptávka celé flotily jedním formulářem.",
      },
    ],
  }),
  component: FleetLeasing,
});

const terms = [36, 48, 60] as const;

function FleetLeasing() {
  const [km, setKm] = useState(30000);
  const [body, setBody] = useState("");
  const [fuel, setFuel] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const list = useMemo(
    () =>
      leasingOffers
        .filter((o) => (!body || o.body === body) && (!fuel || o.fuel === fuel))
        .sort((a, b) => a.baseMonthly - b.baseMonthly),
    [body, fuel],
  );
  const selected = Object.entries(qty).filter(([, n]) => n > 0);
  const fleetMonthly = selected.reduce((sum, [id, n]) => {
    const o = leasingOffers.find((x) => x.id === id)!;
    return sum + leaseMonthly(o, 48, km, true) * n;
  }, 0);
  const setQ = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, (q[id] ?? 0) + d)) }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const cars = selected
      .map(([id, n]) => {
        const o = leasingOffers.find((x) => x.id === id)!;
        return `${n}× ${brandBySlug(o.brand)?.name} ${o.model} (${o.partner})`;
      })
      .join(", ");
    setBusy(true);
    try {
      await submitLead({
        data: {
          kind: "leasing",
          business: true,
          offerId: "fleet",
          name: String(f.get("name")),
          email: String(f.get("email")),
          phone: String(f.get("phone")),
          months: 48,
          kmPerYear: km,
          message: `Flotila: ${cars} · ${num(km)} km/rok · IČO ${String(f.get("ico"))} · ${String(f.get("company"))} · odhad ${czk(fleetMonthly)}/měs. bez DPH`,
          consent: true,
        },
      });
      setSent(true);
    } catch {
      toast.error("Zkontrolujte prosím kontaktní údaje.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs
          items={[
            { to: "/", label: "Drivio" },
            { to: "/leasing", label: "Operativní leasing" },
            { label: "Pro firmy" },
          ]}
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <Building2 className="h-4 w-4" /> Pro firmy a živnostníky
            </p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
              Operativní leasing pro firmy
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Ceny bez DPH, vše v ceně (pojištění, servis, pneu, známka). Vyberte vozy a počty kusů
              a poptejte celou flotilu jedním formulářem.
            </p>
          </div>
          <Link to="/leasing" className="text-sm font-semibold text-primary">
            Nabídky pro soukromé osoby →
          </Link>
        </div>

        <div className="surface-card mt-6 grid gap-3 p-4 sm:grid-cols-3">
          <select
            className="field"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            aria-label="Roční nájezd"
          >
            {leaseKm.map((k) => (
              <option key={k} value={k}>
                Nájezd {num(k)} km/rok
              </option>
            ))}
          </select>
          <select
            className="field"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Karoserie"
          >
            <option value="">Všechny karoserie</option>
            {bodyTypes.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            aria-label="Palivo"
          >
            <option value="">Všechna paliva</option>
            {fuels.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="surface-card mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Vůz</th>
                <th className="px-4 py-3">Palivo / výkon</th>
                {terms.map((t) => (
                  <th key={t} className="px-4 py-3 text-right">
                    {t} měs.
                  </th>
                ))}
                <th className="px-4 py-3">Dodání</th>
                <th className="px-4 py-3 text-center">Počet kusů</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const brand = brandBySlug(o.brand);
                const n = qty[o.id] ?? 0;
                return (
                  <tr
                    key={o.id}
                    className={cn("border-b border-border last:border-0", n > 0 && "bg-accent/60")}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/leasing/$id"
                        params={{ id: o.id }}
                        search={{ business: true }}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        {brand ? (
                          <BrandLogo slug={brand.slug} name={brand.name} className="h-6 w-6" />
                        ) : null}
                        <span>
                          <span className="font-semibold">
                            {brand?.name} {o.model}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {o.trim} · {o.partner}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {labelOf(fuels, o.fuel)} · {o.powerKw} kW
                    </td>
                    {terms.map((t) => (
                      <td
                        key={t}
                        className={cn(
                          "px-4 py-3 text-right tabular-nums",
                          t === 48 && "font-bold text-primary",
                        )}
                      >
                        {czk(leaseMonthly(o, t, km, true))}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />{" "}
                        {o.inStock ? `skladem, ${o.deliveryDays} dní` : `${o.deliveryDays} dní`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setQ(o.id, -1)}
                          className="rounded-full border border-border p-1"
                          aria-label="Méně"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center font-semibold tabular-nums">{n}</span>
                        <button
                          onClick={() => setQ(o.id, 1)}
                          className="rounded-full border border-border p-1"
                          aria-label="Více"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Měsíční splátky bez DPH při zvoleném nájezdu. Zvýrazněná délka 48 měsíců se používá pro
          odhad flotily.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="surface-card p-6">
            <p className="text-lg font-bold">Vaše flotila</p>
            {selected.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Zatím jste nevybrali žádné vozy. Počet kusů nastavíte v tabulce.
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {selected.map(([id, n]) => {
                    const o = leasingOffers.find((x) => x.id === id)!;
                    return (
                      <li key={id} className="flex justify-between gap-3">
                        <span>
                          {n}× {brandBySlug(o.brand)?.name} {o.model}
                        </span>
                        <span className="tabular-nums">
                          {czk(leaseMonthly(o, 48, km, true) * n)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 flex justify-between border-t border-border pt-3 font-semibold">
                  <span>Odhad celkem (48 měs., bez DPH)</span>
                  <span className="font-display text-xl">{czk(fleetMonthly)} / měs.</span>
                </p>
              </>
            )}
            <ul className="mt-5 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Jeden kontakt pro celou flotilu",
                "Odpočet DPH ze splátek",
                "Náhradní vůz a asistence",
                "Flotilový reporting",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-6">
            {sent ? (
              <p className="rounded-xl bg-success/10 p-4 text-sm text-success">
                Děkujeme, flotilový specialista vás kontaktuje do 1 pracovního dne.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-2.5">
                <p className="text-lg font-bold">Poptat flotilu</p>
                <div className="grid grid-cols-2 gap-2">
                  <input name="company" required className="field" placeholder="Firma" />
                  <input
                    name="ico"
                    required
                    pattern="[0-9]{8}"
                    className="field"
                    placeholder="IČO"
                  />
                </div>
                <input
                  name="name"
                  required
                  className="field"
                  placeholder="Kontaktní osoba"
                  autoComplete="name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="email"
                    type="email"
                    required
                    className="field"
                    placeholder="E-mail"
                  />
                  <input name="phone" type="tel" required className="field" placeholder="Telefon" />
                </div>
                <label className="flex gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span>{LEASING_CONSENT_TEXT}</span>
                </label>
                <button
                  disabled={busy || selected.length === 0}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
                >
                  {selected.length
                    ? `Poptat ${selected.reduce((s, [, n]) => s + n, 0)} vozů`
                    : "Vyberte vozy v tabulce"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Page>
  );
}
