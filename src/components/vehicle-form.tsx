import { ImagePlus, ScanLine, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  bodyTypes,
  brandBySlug,
  brands,
  colors,
  drives,
  equipment,
  fuels,
  gearboxes,
  regions,
} from "@/lib/catalog";
import { PHOTO_FALLBACK } from "@/lib/mock-data";
import type { NewVehicle } from "@/lib/store";
import { decodeVin, VIN_RE } from "@/lib/vin";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 8;

/** Zmenší fotku v prohlížeči (max 1200 px, JPEG) – šetří místo i přenos. */
function resizeImage(file: File, max = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export type VehicleFormResult = Omit<NewVehicle, "dealerId" | "listedAt" | "privateSeller"> & {
  contact?: { name: string; phone: string; email: string; city: string; region: string };
};

export function VehicleForm({
  withContact,
  aside,
  submitLabel,
  disabled,
  onSubmit,
}: {
  withContact?: boolean;
  aside?: (price: number) => ReactNode;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (v: VehicleFormResult) => void;
}) {
  const [vin, setVin] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [eq, setEq] = useState<string[]>([]);
  const [decoding, setDecoding] = useState(false);

  async function decode() {
    if (!VIN_RE.test(vin)) return void toast.error("VIN musí mít 17 znaků (bez I, O, Q)");
    setDecoding(true);
    try {
      const r = await decodeVin({ data: { vin } });
      if (r.brand) {
        setBrand(r.brand);
        setModel("");
      }
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

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    try {
      const data = await Promise.all(list.map((f) => resizeImage(f)));
      setPhotos((p) => [...p, ...data].slice(0, MAX_PHOTOS));
    } catch {
      toast.error("Některou fotku se nepodařilo načíst");
    }
  }

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_340px]"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const str = (k: string) => String(f.get(k) ?? "").trim();
        const n = (k: string) => Number(f.get(k) ?? 0) || 0;
        const body = str("body");
        onSubmit({
          vin,
          brand,
          model,
          trim: str("trim"),
          category: body === "dodavka" ? "uzitkove" : "osobni",
          body,
          year: Number(year),
          km: n("km"),
          fuel: str("fuel"),
          gearbox: str("gearbox"),
          drive: str("drive") || "predni",
          powerKw: n("powerKw"),
          engineCcm: n("engineCcm"),
          color: str("color"),
          condition: "ojete",
          price,
          vatDeductible: f.get("vat") === "on",
          equipment: eq,
          photos: photos.length ? photos : [PHOTO_FALLBACK],
          serviceBook: f.get("serviceBook") === "on",
          firstOwner: f.get("firstOwner") === "on",
          accidentFree: f.get("accidentFree") === "on",
          description: str("description"),
          doors: n("doors") || 5,
          seats: n("seats") || 5,
          origin: str("origin") === "import" ? "import" : "cz",
          cebiaVerified: false,
          ...(withContact
            ? {
                contact: {
                  name: str("c_name"),
                  phone: str("c_phone"),
                  email: str("c_email"),
                  city: str("c_city"),
                  region: str("c_region"),
                },
              }
            : {}),
        });
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
              pattern="[A-HJ-NPR-Z0-9]{17}"
              title="17 znaků bez I, O a Q"
            />
            <button
              type="button"
              onClick={decode}
              disabled={decoding}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/40"
            >
              <ScanLine className="h-4 w-4" /> {decoding ? "Dekóduji…" : "Dekódovat"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            VIN najdete v technickém průkazu. Vyzkoušejte např. TMBJJ7NE8L0123456.
          </p>
        </section>

        <section className="surface-card grid gap-3 p-5 sm:grid-cols-2">
          <p className="font-semibold sm:col-span-2">2. Parametry</p>
          <select
            className="field"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setModel("");
            }}
            required
            aria-label="Značka"
          >
            <option value="">Značka *</option>
            {brands.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.name}
              </option>
            ))}
          </select>
          <select
            className="field"
            required
            aria-label="Model"
            disabled={!brand}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="">Model *</option>
            {(brandBySlug(brand)?.models ?? []).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input
            name="trim"
            className="field"
            placeholder="Verze / motorizace (např. 2.0 TDI Style)"
          />
          <input
            className="field"
            type="number"
            min={1950}
            max={2027}
            placeholder="Rok výroby *"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <input
            name="km"
            className="field"
            type="number"
            min={0}
            placeholder="Najeto (km) *"
            required
          />
          <input name="powerKw" className="field" type="number" min={0} placeholder="Výkon (kW)" />
          <input
            name="engineCcm"
            className="field"
            type="number"
            min={0}
            placeholder="Objem motoru (cm³)"
          />
          {(
            [
              ["fuel", "Palivo *", fuels, true],
              ["gearbox", "Převodovka *", gearboxes, true],
              ["body", "Karoserie *", bodyTypes, true],
              ["drive", "Pohon", drives, false],
              ["color", "Barva *", colors, true],
            ] as const
          ).map(([name, l, list, req]) => (
            <select key={name} name={name} className="field" aria-label={l} required={req}>
              <option value="">{l}</option>
              {list.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          <select name="doors" className="field" aria-label="Počet dveří" defaultValue="5">
            {[2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {d} dveře
              </option>
            ))}
          </select>
          <select name="seats" className="field" aria-label="Počet míst" defaultValue="5">
            {[2, 4, 5, 7, 9].map((d) => (
              <option key={d} value={d}>
                {d} míst
              </option>
            ))}
          </select>
          <select name="origin" className="field" aria-label="Původ vozu">
            <option value="cz">Původem z ČR</option>
            <option value="import">Dovoz</option>
          </select>
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:col-span-2">
            {(
              [
                ["serviceBook", "Servisní knížka"],
                ["firstOwner", "První majitel"],
                ["accidentFree", "Nehavarované"],
              ] as const
            ).map(([n, l]) => (
              <label key={n} className="flex items-center gap-2 text-sm">
                <input name={n} type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /> {l}
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <p className="mb-3 font-semibold">3. Výbava</p>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((e) => (
              <label key={e.value} className="flex items-center gap-2 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={eq.includes(e.value)}
                  onChange={() =>
                    setEq((cur) =>
                      cur.includes(e.value) ? cur.filter((x) => x !== e.value) : [...cur, e.value],
                    )
                  }
                  className="h-4 w-4 accent-[var(--primary)]"
                />{" "}
                {e.label}
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <p className="mb-3 font-semibold">
            4. Fotografie ({photos.length}/{MAX_PHOTOS})
          </p>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-sm text-muted-foreground hover:border-primary/50",
              photos.length >= MAX_PHOTOS && "pointer-events-none opacity-50",
            )}
          >
            <ImagePlus className="h-8 w-8" />
            Klikněte a vyberte fotky (JPG, PNG, WEBP)
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void addPhotos(e.target.files)}
            />
          </label>
          {photos.length ? (
            <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-6">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                  {i === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded bg-foreground/80 px-1.5 text-[10px] font-semibold text-background">
                      Hlavní
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPhotos((cur) => cur.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 rounded-full bg-foreground/80 p-0.5 text-background"
                    aria-label="Odebrat fotku"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="surface-card p-5">
          <p className="mb-3 font-semibold">5. Popis</p>
          <textarea
            name="description"
            rows={5}
            className="field"
            placeholder="Stav vozu, servisní historie, počet majitelů, důvod prodeje…"
          />
        </section>

        {withContact ? (
          <section className="surface-card grid gap-3 p-5 sm:grid-cols-2">
            <p className="font-semibold sm:col-span-2">6. Kontakt pro zájemce</p>
            <input
              name="c_name"
              required
              className="field"
              placeholder="Jméno *"
              autoComplete="name"
            />
            <input
              name="c_phone"
              required
              type="tel"
              pattern="\+?[0-9 ]{9,16}"
              className="field"
              placeholder="Telefon *"
              autoComplete="tel"
            />
            <input
              name="c_email"
              required
              type="email"
              className="field"
              placeholder="E-mail *"
              autoComplete="email"
            />
            <input
              name="c_city"
              required
              className="field"
              placeholder="Obec *"
              autoComplete="address-level2"
            />
            <select name="c_region" required className="field sm:col-span-2" aria-label="Kraj">
              <option value="">Kraj *</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === "Praha" ? "Hlavní město Praha" : `${r} kraj`}
                </option>
              ))}
            </select>
            <label className="flex gap-2 text-xs text-muted-foreground sm:col-span-2">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                Souhlasím s obchodními podmínkami a se zveřejněním kontaktu u inzerátu po dobu jeho
                zveřejnění.
              </span>
            </label>
            <label className="flex gap-2 text-xs text-muted-foreground sm:col-span-2">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                Prodávám vlastní vůz jako fyzická osoba, ne v rámci podnikání (inzerát zdarma je jen
                pro fyzické osoby, 1 na účet).
              </span>
            </label>
          </section>
        ) : null}
      </div>

      <aside>
        <div className="surface-card sticky top-20 space-y-4 p-5">
          <p className="font-semibold">Cena</p>
          <input
            type="number"
            className="field text-lg font-semibold"
            placeholder="Cena vč. DPH (Kč) *"
            required
            min={1000}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="vat" type="checkbox" className="h-4 w-4 accent-[var(--primary)]" /> Možnost
            odpočtu DPH
          </label>
          {aside?.(price)}
          <button
            disabled={disabled}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </aside>
    </form>
  );
}
