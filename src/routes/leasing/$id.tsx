import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Building2, Check, Truck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { brandBySlug, fuels, gearboxes, labelOf } from "@/lib/catalog";
import { LEASING_CONSENT_TEXT, submitLead } from "@/lib/leads";
import { leaseIncluded, leaseKm, leaseMonthly, leaseMonths, leasingOfferById } from "@/lib/leasing";
import { czk, num } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leasing/$id")({
  validateSearch: (s) =>
    z.object({ business: z.coerce.boolean().optional().catch(undefined) }).parse(s),
  loader: ({ params }) => {
    const offer = leasingOfferById(params.id);
    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${brandBySlug(loaderData.offer.brand)?.name} ${loaderData.offer.model} na operativní leasing | Drivio`,
          },
          {
            name: "description",
            content: `Operativní leasing ${loaderData.offer.model} od ${czk(loaderData.offer.baseMonthly)} měsíčně, vše v ceně.`,
          },
        ]
      : [{ title: "Nabídka nenalezena | Drivio" }],
  }),
  notFoundComponent: () => (
    <Page>
      <Container className="py-24 text-center">
        <h1 className="text-3xl font-bold">Nabídka už není dostupná</h1>
        <Link
          to="/leasing"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Zobrazit nabídky leasingu
        </Link>
      </Container>
    </Page>
  ),
  component: LeaseDetail,
});

function LeaseDetail() {
  const { offer: o } = Route.useLoaderData();
  const search = Route.useSearch();
  const brand = brandBySlug(o.brand);
  const [months, setMonths] = useState(48);
  const [km, setKm] = useState(20000);
  const [business, setBusiness] = useState(!!search.business);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const price = leaseMonthly(o, months, km, business);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submitLead({
        data: {
          kind: "leasing",
          offerId: o.id,
          name: String(f.get("name")),
          email: String(f.get("email")),
          phone: String(f.get("phone")),
          months,
          kmPerYear: km,
          business,
          message: `${brand?.name} ${o.model} ${o.trim} · ${months} měs. · ${num(km)} km/rok · ${czk(price)}/měs. · ${o.partner}${f.get("ico") ? ` · IČO ${String(f.get("ico"))}` : ""}`,
          consent: true,
        },
      });
      setSent(true);
    } catch {
      toast.error("Zkontrolujte prosím jméno, e-mail a telefon.");
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
            { label: `${brand?.name} ${o.model}` },
          ]}
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-6">
            <div className="surface-card overflow-hidden p-2">
              <div className="aspect-[16/10] overflow-hidden rounded-xl">
                <CarImage src={o.photo} alt={`${brand?.name} ${o.model}`} eager />
              </div>
            </div>
            <div className="surface-card p-6">
              <div className="flex items-center gap-3">
                {brand ? (
                  <BrandLogo slug={brand.slug} name={brand.name} className="h-10 w-10" />
                ) : null}
                <div>
                  <h1 className="text-3xl font-extrabold">
                    {brand?.name} {o.model}
                  </h1>
                  <p className="text-muted-foreground">{o.trim}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Stav", o.condition === "nove" ? "Nový vůz" : "Ojetý vůz"],
                  ["Palivo", labelOf(fuels, o.fuel)],
                  ["Převodovka", labelOf(gearboxes, o.gearbox)],
                  ["Výkon", `${o.powerKw} kW`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="surface-card p-6">
              <h2 className="text-xl font-bold">V měsíční splátce je</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {leaseIncluded.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {i}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                {o.inStock
                  ? `Skladem – doručení do ${o.deliveryDays} dní až k vám domů.`
                  : `Vůz do výroby – předpokládané dodání do ${o.deliveryDays} dní.`}{" "}
                Poskytovatel: {o.partner}.
              </p>
            </div>
          </div>

          <aside>
            <div className="surface-card sticky top-20 p-6">
              <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                {(
                  [
                    [false, User, "Soukromě"],
                    [true, Building2, "Na firmu"],
                  ] as const
                ).map(([b, Icon, l]) => (
                  <button
                    key={l}
                    onClick={() => setBusiness(b)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold",
                      business === b ? "bg-card shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" /> {l}
                  </button>
                ))}
              </div>

              <p className="mt-5 text-sm font-semibold">Délka pronájmu</p>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {leaseMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-semibold",
                      months === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {m} m.
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm font-semibold">Roční nájezd</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {leaseKm.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKm(k)}
                    className={cn(
                      "rounded-xl border py-2 text-xs font-semibold",
                      km === k
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {num(k)} km
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-accent p-4">
                <p className="text-sm text-accent-foreground/80">Měsíční splátka</p>
                <p className="font-display text-4xl font-extrabold text-accent-foreground">
                  {czk(price)}
                </p>
                <p className="text-xs text-accent-foreground/70">
                  {business ? "bez DPH" : "vč. DPH"} · bez akontace · vše v ceně
                </p>
              </div>

              {sent ? (
                <p className="mt-5 rounded-xl bg-success/10 p-4 text-sm text-success">
                  Děkujeme! Specialista vám zavolá do několika hodin (v pracovní dny).
                </p>
              ) : (
                <form onSubmit={onSubmit} className="mt-5 space-y-2.5">
                  <input
                    name="name"
                    required
                    placeholder="Jméno a příjmení"
                    className="field"
                    autoComplete="name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="E-mail"
                      className="field"
                      autoComplete="email"
                    />
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Telefon"
                      className="field"
                      autoComplete="tel"
                    />
                  </div>
                  {business ? (
                    <input name="ico" pattern="[0-9]{8}" placeholder="IČO" className="field" />
                  ) : null}
                  <label className="flex gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                    />
                    <span>{LEASING_CONSENT_TEXT}</span>
                  </label>
                  <button
                    disabled={busy}
                    className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {busy ? "Odesílám…" : "Nezávazně poptat"}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </Page>
  );
}
