import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Fuel,
  Gauge,
  MapPin,
  Palette,
  Phone,
  Settings2,
  Share2,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { CarImage } from "@/components/car-image";
import { FinanceCalculator } from "@/components/finance-calculator";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { FavoriteButton, VehicleCard } from "@/components/vehicle-card";
import {
  bodyTypes,
  brandBySlug,
  colors,
  drives,
  equipment,
  fuels,
  gearboxes,
  labelOf,
} from "@/lib/catalog";
import { submitLead } from "@/lib/leads";
import {
  czk,
  dealerById,
  monthlyPayment,
  num,
  vehicleById,
  vehicles,
  vehicleTitle,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inzerat/$id")({
  loader: ({ params }) => {
    const vehicle = vehicleById(params.id);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  head: ({ loaderData }) => {
    const v = loaderData?.vehicle;
    if (!v) return { meta: [{ title: "Inzerát nenalezen | Drivio" }] };
    const t = `${vehicleTitle(v)} ${v.trim}, ${v.year}, ${num(v.km)} km – ${czk(v.price)}`;
    return {
      meta: [
        { title: `${t} | Drivio` },
        { name: "description", content: `${t}. ${v.description}` },
        { property: "og:title", content: t },
        { property: "og:image", content: v.photos[0] },
      ],
    };
  },
  notFoundComponent: () => (
    <Page>
      <Container className="py-24 text-center">
        <h1 className="text-3xl font-bold">Inzerát už není k dispozici</h1>
        <p className="mt-2 text-muted-foreground">Vůz byl pravděpodobně prodán.</p>
        <Link
          to="/inzeraty"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Zobrazit podobné vozy
        </Link>
      </Container>
    </Page>
  ),
  component: Detail,
});

function Detail() {
  const { vehicle: v } = Route.useLoaderData();
  const dealer = dealerById(v.dealerId);
  const brand = brandBySlug(v.brand);
  const title = vehicleTitle(v);
  const [photo, setPhoto] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const similar = vehicles
    .filter((x) => x.id !== v.id && (x.body === v.body || x.brand === v.brand))
    .slice(0, 4);

  const params: [typeof Gauge, string, string][] = [
    [CalendarDays, "Rok výroby", String(v.year)],
    [Gauge, "Najeto", `${num(v.km)} km`],
    [Fuel, "Palivo", labelOf(fuels, v.fuel)],
    [Settings2, "Převodovka", labelOf(gearboxes, v.gearbox)],
    [Zap, "Výkon", `${v.powerKw} kW (${Math.round(v.powerKw * 1.36)} k)`],
    [Palette, "Barva", labelOf(colors, v.color)],
  ];

  const specs: [string, string][] = [
    ["Karoserie", labelOf(bodyTypes, v.body)],
    ["Pohon", labelOf(drives, v.drive)],
    ["Objem motoru", v.engineCcm ? `${num(v.engineCcm)} cm³` : "—"],
    ["Stav", "Ojeté"],
    ["Servisní knížka", v.serviceBook ? "Ano" : "Ne"],
    ["První majitel", v.firstOwner ? "Ano" : "Ne"],
    ["Nehavarované", v.accidentFree ? "Ano" : "Neuvedeno"],
    ["Odpočet DPH", v.vatDeductible ? "Ano" : "Ne"],
    ["VIN", v.vin],
  ];

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs
          items={[
            { to: "/", label: "Drivio" },
            { to: "/inzeraty", label: "Inzeráty" },
            { label: `${title} ${v.trim}` },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            {/* Galerie */}
            <div className="surface-card overflow-hidden p-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <CarImage src={v.photos[photo]!} alt={`${title} – foto ${photo + 1}`} eager />
                <div className="absolute right-3 top-3 flex gap-2">
                  <button
                    onClick={() => {
                      void navigator.clipboard?.writeText(window.location.href);
                      toast.success("Odkaz zkopírován");
                    }}
                    className="glass inline-flex h-9 w-9 items-center justify-center rounded-full"
                    aria-label="Sdílet"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <FavoriteButton id={v.id} />
                </div>
                <span className="glass absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold">
                  {photo + 1} / {v.photos.length}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {v.photos.map((p, i) => (
                  <button
                    key={p + i}
                    onClick={() => setPhoto(i)}
                    className={cn(
                      "aspect-[16/10] overflow-hidden rounded-lg ring-2 transition",
                      i === photo
                        ? "ring-primary"
                        : "ring-transparent opacity-70 hover:opacity-100",
                    )}
                    aria-label={`Foto ${i + 1}`}
                  >
                    <CarImage src={p} alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Titulek (mobil) */}
            <div className="mt-6 lg:hidden">
              <TitleBlock />
            </div>

            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Základní parametry</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {params.map(([Icon, l, val]) => (
                  <div key={l} className="surface-card flex items-center gap-3 p-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{l}</p>
                      <p className="text-sm font-semibold">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 surface-card p-6">
              <h2 className="mb-4 text-xl font-bold">Technické údaje</h2>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {specs.map(([k, val]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-border py-2.5 text-sm"
                  >
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className={cn("font-medium", k === "VIN" && "font-mono text-xs")}>{val}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {v.equipment.length ? (
              <section className="mt-8 surface-card p-6">
                <h2 className="mb-4 text-xl font-bold">Výbava</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {v.equipment.map((e) => (
                    <li key={e} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" /> {labelOf(equipment, e)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-8 surface-card p-6">
              <h2 className="mb-3 text-xl font-bold">Popis od prodejce</h2>
              <p className="leading-relaxed text-foreground/85">{v.description}</p>
            </section>

            <section className="mt-8 surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">VIN prověřen</p>
                <p className="text-sm text-muted-foreground">
                  Vůz není evidován v databázi odcizených vozidel. Parametry odpovídají dekódovanému
                  VIN.
                </p>
              </div>
              <button
                onClick={() =>
                  toast("Kompletní historie vozu", {
                    description: "Report Cebia / carVertical bude dostupný po napojení API.",
                  })
                }
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary/40"
              >
                Historie vozu
              </button>
            </section>
          </div>

          {/* Pravý sloupec */}
          <aside className="space-y-5">
            <div className="hidden lg:block">
              <TitleBlock />
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent font-display text-lg font-bold text-accent-foreground">
                  {dealer.name.slice(0, 1)}
                </span>
                <div>
                  <p className="flex items-center gap-1 font-semibold">
                    {dealer.name} <BadgeCheck className="h-4 w-4 text-primary" />
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />{" "}
                    {dealer.rating.toLocaleString("cs-CZ")} ({dealer.reviews} hodnocení) · od{" "}
                    {dealer.since}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {dealer.city},{" "}
                {dealer.region === "Praha" ? "Praha" : `${dealer.region} kraj`}
              </p>
              <button
                onClick={() => setShowPhone(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/90"
              >
                <Phone className="h-4 w-4" /> {showPhone ? dealer.phone : "Zobrazit telefon"}
              </button>
              <DealerContactForm vehicleId={v.id} title={title} />
            </div>

            <FinanceCalculator price={v.price} vehicleId={v.id} />
          </aside>
        </div>

        {similar.length ? (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Podobné vozy</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => (
                <VehicleCard key={s.id} vehicle={s} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </Page>
  );

  function TitleBlock() {
    return (
      <div className="surface-card p-5">
        <div className="flex items-center gap-3">
          {brand ? <BrandLogo slug={brand.slug} name={brand.name} className="h-9 w-9" /> : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">{title}</h1>
            <p className="truncate text-sm text-muted-foreground">{v.trim}</p>
          </div>
        </div>
        <p className="mt-4 font-display text-3xl font-extrabold">{czk(v.price)}</p>
        <p className="text-sm text-muted-foreground">
          {v.vatDeductible ? `${czk(Math.round(v.price / 1.21))} bez DPH · ` : ""}
          nebo{" "}
          <span className="font-semibold text-primary">
            od {czk(monthlyPayment(v.price))} měsíčně
          </span>
        </p>
      </div>
    );
  }
}

function DealerContactForm({ vehicleId, title }: { vehicleId: string; title: string }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  if (sent)
    return (
      <p className="mt-4 rounded-xl bg-success/10 p-3 text-sm text-success">
        Zpráva odeslána. Prodejce se vám ozve.
      </p>
    );
  return (
    <form
      className="mt-4 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        try {
          await submitLead({
            data: {
              kind: "dealer_contact",
              vehicleId,
              name: String(f.get("name")),
              email: String(f.get("email")),
              phone: String(f.get("phone")),
              message: String(f.get("message")),
              consent: true,
            },
          });
          setSent(true);
        } catch {
          toast.error("Zkontrolujte prosím vyplněné údaje.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <textarea
        name="message"
        rows={3}
        className="field"
        defaultValue={`Dobrý den, mám zájem o vůz ${title}. Je stále k dispozici?`}
      />
      <input name="name" required placeholder="Jméno" className="field" autoComplete="name" />
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
      <p className="text-[11px] text-muted-foreground">
        Odesláním předáte kontakt prodejci za účelem vyřízení dotazu (čl. 6 odst. 1 písm. b GDPR).
      </p>
      <button
        disabled={busy}
        className="w-full rounded-full border border-border py-2.5 text-sm font-semibold hover:border-primary/40 disabled:opacity-60"
      >
        {busy ? "Odesílám…" : "Napsat prodejci"}
      </button>
    </form>
  );
}
