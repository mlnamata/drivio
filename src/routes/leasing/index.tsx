import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  ShieldCheck,
  Truck,
  User,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { CarImage } from "@/components/car-image";
import { Container, Page, SectionTitle } from "@/components/site-shell";
import { bodyTypes, brandBySlug, fuels, labelOf } from "@/lib/catalog";
import { leaseIncluded, leaseMonthly, leasingOffers } from "@/lib/leasing";
import { czk } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  brand: z.string().optional().catch(undefined),
  body: z.string().optional().catch(undefined),
  fuel: z.string().optional().catch(undefined),
  maxMonthly: z.coerce.number().optional().catch(undefined),
  stock: z.coerce.boolean().optional().catch(undefined),
  used: z.coerce.boolean().optional().catch(undefined),
  business: z.coerce.boolean().optional().catch(undefined),
});
type LeaseSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/leasing/")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Operativní leasing – nové auto bez starostí | Drivio" },
      {
        name: "description",
        content:
          "Operativní leasing pro soukromé osoby i firmy. Jedna měsíční splátka zahrnuje pojištění, servis, pneu i dálniční známku. Bez akontace, doručení do 14 dní.",
      },
    ],
  }),
  component: Leasing,
});

const monthlyCaps = [8000, 10000, 12000, 15000, 20000];

function Leasing() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/leasing/" });
  const set = (patch: Partial<LeaseSearch>) =>
    void navigate({
      search: (prev) => {
        const next: Record<string, unknown> = { ...prev, ...patch };
        for (const k of Object.keys(next))
          if (next[k] === undefined || next[k] === false) delete next[k];
        return next as LeaseSearch;
      },
      replace: true,
      resetScroll: false,
    });

  const list = useMemo(
    () =>
      leasingOffers
        .filter(
          (o) =>
            (!s.brand || o.brand === s.brand) &&
            (!s.body || o.body === s.body) &&
            (!s.fuel || o.fuel === s.fuel) &&
            (!s.stock || o.inStock) &&
            (s.used ? o.condition === "ojete" : true) &&
            (!s.maxMonthly || leaseMonthly(o, 48, 20000, s.business) <= s.maxMonthly),
        )
        .sort((a, b) => a.baseMonthly - b.baseMonthly),
    [s],
  );
  const brandsInOffer = [...new Set(leasingOffers.map((o) => o.brand))];

  return (
    <Page>
      {/* HERO */}
      <Container className="pt-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-sidebar px-6 py-10 text-white md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-primary/35 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Operativní leasing
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] md:text-5xl">
                Nové auto bez starostí. <span className="text-primary">Jedna splátka.</span>
              </h1>
              <p className="mt-4 max-w-xl text-white/70">
                Pojištění, servis, pneumatiky i dálniční známka jsou v ceně. Bez akontace, bez
                rizika ztráty hodnoty. Po skončení auto jednoduše vrátíte nebo vyměníte za nové.
              </p>
              <Link
                to="/leasing/firmy"
                className="mt-6 mr-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Building2 className="h-4 w-4" /> Seznam pro firmy (bez DPH)
              </Link>
              <div className="mt-6 inline-flex rounded-full bg-white/10 p-1">
                {(
                  [
                    [false, User, "Soukromá osoba"],
                    [true, Building2, "Firma / IČO"],
                  ] as const
                ).map(([b, Icon, l]) => (
                  <button
                    key={l}
                    onClick={() => set({ business: b || undefined })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      !!s.business === b ? "bg-white text-foreground" : "text-white/80",
                    )}
                  >
                    <Icon className="h-4 w-4" /> {l}
                  </button>
                ))}
              </div>
            </div>
            <ul className="glass-dark grid gap-3 rounded-3xl p-6 text-sm">
              {leaseIncluded.map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 shrink-0 text-primary" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Container>

      {/* FILTRY */}
      <Container className="py-8">
        <div className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <select
            className="field"
            aria-label="Značka"
            value={s.brand ?? ""}
            onChange={(e) => set({ brand: e.target.value || undefined })}
          >
            <option value="">Všechny značky</option>
            {brandsInOffer.map((b) => (
              <option key={b} value={b}>
                {brandBySlug(b)?.name ?? b}
              </option>
            ))}
          </select>
          <select
            className="field"
            aria-label="Karoserie"
            value={s.body ?? ""}
            onChange={(e) => set({ body: e.target.value || undefined })}
          >
            <option value="">Karoserie</option>
            {bodyTypes.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <select
            className="field"
            aria-label="Palivo"
            value={s.fuel ?? ""}
            onChange={(e) => set({ fuel: e.target.value || undefined })}
          >
            <option value="">Palivo</option>
            {fuels.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            className="field"
            aria-label="Splátka do"
            value={s.maxMonthly ?? ""}
            onChange={(e) =>
              set({ maxMonthly: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Splátka do</option>
            {monthlyCaps.map((c) => (
              <option key={c} value={c}>
                do {czk(c)}/měs.
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={!!s.stock}
              onChange={(e) => set({ stock: e.target.checked || undefined })}
            />
            Jen skladem
          </label>
          <label className="flex items-center gap-2 px-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={!!s.used}
              onChange={(e) => set({ used: e.target.checked || undefined })}
            />
            Ojeté vozy
          </label>
        </div>

        <p className="mb-4 mt-6 text-sm text-muted-foreground">
          {list.length} nabídek · ceny {s.business ? "bez DPH" : "vč. DPH"} při 48 měsících a 20 000
          km/rok
        </p>

        {list.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <p className="font-semibold">Žádná nabídka neodpovídá filtru.</p>
            <button
              onClick={() => void navigate({ search: {}, replace: true })}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Zrušit filtry
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((o) => {
              const brand = brandBySlug(o.brand);
              return (
                <Link
                  key={o.id}
                  to="/leasing/$id"
                  params={{ id: o.id }}
                  search={s.business ? { business: true } : {}}
                  className="surface-card lift group overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <CarImage
                      src={o.photo}
                      alt={`${brand?.name} ${o.model}`}
                      className="transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      {o.inStock ? (
                        <span className="rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-success-foreground">
                          Skladem
                        </span>
                      ) : null}
                      {o.condition === "ojete" ? (
                        <span className="glass rounded-full px-2.5 py-1 text-[11px] font-bold">
                          Ojeté
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      {brand ? (
                        <BrandLogo slug={brand.slug} name={brand.name} className="h-6 w-6" />
                      ) : null}
                      <h3 className="truncate font-semibold">
                        {brand?.name} {o.model}
                      </h3>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{o.trim}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {labelOf(fuels, o.fuel)} · {o.powerKw} kW · {o.partner}
                    </p>
                    <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">měsíčně od</p>
                        <p className="font-display text-2xl font-extrabold text-primary">
                          {czk(leaseMonthly(o, 48, 20000, s.business))}
                        </p>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" /> do {o.deliveryDays} dní
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>

      {/* JAK TO FUNGUJE */}
      <Container className="py-12">
        <SectionTitle eyebrow="Jak to funguje" title="Auto na operativní leasing ve 4 krocích" />
        <div className="grid gap-5 md:grid-cols-4">
          {[
            [Clock, "Vyberte auto", "Nastavte délku pronájmu a roční nájezd, cenu vidíte hned."],
            [
              ShieldCheck,
              "Nezávazně poptejte",
              "Do pár hodin vám zavolá specialista a pomůže s výběrem.",
            ],
            [
              Wrench,
              "Podepište online",
              "Smlouvu uzavřete s leasingovou společností, bez akontace.",
            ],
            [Truck, "Převezměte vůz", "Skladová auta doručíme do 14 dní až k vám domů."],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof Clock;
            return (
              <div key={t as string} className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <I className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 font-semibold">{t as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* FAQ + PARTNEŘI */}
      <Container className="grid gap-6 py-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-card divide-y divide-border">
          {[
            [
              "Komu auto patří?",
              "Vlastníkem je leasingová společnost. Vy auto užíváte za pevnou měsíční splátku a po skončení smlouvy ho vrátíte.",
            ],
            [
              "Co když najedu víc kilometrů?",
              "Nájezd lze během smlouvy upravit. Kilometry navíc se doúčtují podle sazby ve smlouvě, nevyužité se často vrací.",
            ],
            [
              "Potřebuji akontaci?",
              "Ne. Většina nabídek je bez akontace, u některých lze splátku snížit mimořádnou první splátkou.",
            ],
            [
              "Mohu si leasing vzít jako soukromá osoba?",
              "Ano. Operativní leasing nabízíme soukromým osobám, živnostníkům i firmám (ceny bez DPH).",
            ],
          ].map(([q, a]) => (
            <details key={q} className="p-5">
              <summary className="cursor-pointer list-none font-semibold">{q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
        <div className="surface-card flex flex-col justify-between gap-5 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Pro leasingové společnosti
            </p>
            <p className="mt-2 text-lg font-bold">Zveřejněte své nabídky na Drivio</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nabídky nahrajete přes API, poptávky vám posíláme v reálném čase i se souhlasem
              zákazníka.
            </p>
          </div>
          <Link
            to="/pro-leasingove-spolecnosti"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
          >
            Partnerský program <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Page>
  );
}
