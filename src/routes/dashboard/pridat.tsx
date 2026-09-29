import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ImagePlus, ScanLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { btn, PageHeader } from "@/components/app-shell";
import {
  bodyTypes,
  brandBySlug,
  brands,
  colors,
  drives,
  equipment,
  fuels,
  gearboxes,
} from "@/lib/catalog";
import { CURRENT_DEALER, dealerBilling } from "@/lib/billing";
import { czk, monthlyPayment, slotSurcharge } from "@/lib/mock-data";
import { decodeVin, VIN_RE } from "@/lib/vin";

export const Route = createFileRoute("/dashboard/pridat")({ component: AddCar });

function AddCar() {
  const b = dealerBilling(CURRENT_DEALER);
  const navigate = useNavigate();
  const [vin, setVin] = useState("");
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState(0);
  const [decoding, setDecoding] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const surcharge = price ? slotSurcharge(b.plan, price) : 0;
  const full = b.used >= b.plan.slots;

  async function decode() {
    if (!VIN_RE.test(vin)) return void toast.error("VIN musí mít 17 znaků (bez I, O, Q)");
    setDecoding(true);
    try {
      const r = await decodeVin({ data: { vin } });
      if (r.brand) setBrand(r.brand);
      if (r.year) setYear(String(r.year));
      toast.success("VIN dekódován", {
        description: `${r.brand ? brandBySlug(r.brand)?.name : "Výrobce neznámý"}${r.year ? `, modelový rok ${r.year}` : ""} · není evidován jako odcizený`,
      });
    } catch {
      toast.error("VIN se nepodařilo dekódovat");
    } finally {
      setDecoding(false);
    }
  }

  return (
    <>
      <PageHeader title="Přidat vůz" desc="Začněte VIN kódem – parametry doplníme automaticky." />
      {full ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 text-warning" /> Všechny sloty jsou obsazené. Označte
          vůz jako prodaný nebo navyšte balíček.
        </div>
      ) : null}
      <form
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Inzerát zveřejněn", { description: "Vůz je na webu a zabírá 1 slot." });
          void navigate({ to: "/dashboard/vozy" });
        }}
      >
        <div className="space-y-6">
          <section className="surface-card p-5">
            <p className="mb-3 font-semibold">1. Identifikace vozu</p>
            <div className="flex gap-2">
              <input
                value={vin}
                onChange={(e) =>
                  setVin(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 17),
                  )
                }
                placeholder="VIN (17 znaků)"
                className="field font-mono tracking-wider"
                required
              />
              <button type="button" onClick={decode} disabled={decoding} className={btn.ghost}>
                <ScanLine className="h-4 w-4" /> {decoding ? "Dekóduji…" : "Dekódovat"}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Vyzkoušejte např. TMBJJ7NE8L0123456
            </p>
          </section>

          <section className="surface-card grid gap-3 p-5 sm:grid-cols-2">
            <p className="font-semibold sm:col-span-2">2. Parametry</p>
            <select
              className="field"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              aria-label="Značka"
            >
              <option value="">Značka</option>
              {brands.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name}
                </option>
              ))}
            </select>
            <select className="field" required aria-label="Model" disabled={!brand}>
              <option value="">Model</option>
              {(brandBySlug(brand)?.models ?? []).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <input className="field" placeholder="Verze / motorizace (např. 2.0 TDI Style)" />
            <input
              className="field"
              type="number"
              placeholder="Rok výroby"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
            <input className="field" type="number" placeholder="Najeto (km)" required />
            <input className="field" type="number" placeholder="Výkon (kW)" />
            {(
              [
                ["Palivo", fuels],
                ["Převodovka", gearboxes],
                ["Karoserie", bodyTypes],
                ["Pohon", drives],
                ["Barva", colors],
              ] as const
            ).map(([l, list]) => (
              <select key={l} className="field" aria-label={l} required={l !== "Pohon"}>
                <option value="">{l}</option>
                {list.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ))}
          </section>

          <section className="surface-card p-5">
            <p className="mb-3 font-semibold">3. Výbava</p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((e) => (
                <label key={e.value} className="flex items-center gap-2 py-1 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /> {e.label}
                </label>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <p className="mb-3 font-semibold">4. Fotografie</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-sm text-muted-foreground hover:border-primary/40">
              <ImagePlus className="h-8 w-8" />
              Přetáhněte fotky nebo klikněte (max. 30, JPG/WEBP)
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  setPhotos(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))
                }
              />
            </label>
            {photos.length ? (
              <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-6">
                {photos.map((p) => (
                  <img key={p} src={p} alt="" className="aspect-[4/3] rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
          </section>

          <section className="surface-card p-5">
            <p className="mb-3 font-semibold">5. Popis</p>
            <textarea
              rows={5}
              className="field"
              placeholder="Stav vozu, servisní historie, počet majitelů…"
            />
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface-card sticky top-20 space-y-4 p-5">
            <p className="font-semibold">Cena a poplatek</p>
            <input
              type="number"
              className="field text-lg font-semibold"
              placeholder="Cena vč. DPH (Kč)"
              required
              min={1000}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /> Možnost odpočtu
              DPH
            </label>
            {price ? (
              <p className="text-sm text-muted-foreground">
                Splátka pro zákazníky od {czk(monthlyPayment(price))}/měs.
              </p>
            ) : null}
            <div className="rounded-xl bg-muted p-4 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Slot v balíčku</span>{" "}
                <span className="font-semibold">{czk(b.plan.perSlot)}</span>
              </p>
              <p className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Doplatek nad limit</span>
                <span className="font-semibold">{surcharge ? `+ ${czk(surcharge)}` : "0 Kč"}</span>
              </p>
              {surcharge ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Cena přesahuje limit balíčku {czk(b.plan.maxPrice ?? 0)}. Doplatek platí jen pro
                  tento slot, balíček se nemění.
                </p>
              ) : null}
            </div>
            <button
              disabled={full}
              className={`${btn.primary} w-full justify-center disabled:opacity-50`}
            >
              Zveřejnit inzerát
            </button>
          </div>
        </aside>
      </form>
    </>
  );
}
