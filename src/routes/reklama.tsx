import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Car, Megaphone, MousePointerClick, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "@/lib/forms";
import { Breadcrumbs, Container, Page, SectionTitle } from "@/components/site-shell";
import { czk } from "@/lib/mock-data";

export const Route = createFileRoute("/reklama")({
  head: () => ({
    meta: [
      { title: "Reklama na Drivio – formáty a ceník | Drivio" },
      {
        name: "description",
        content:
          "Oslovte lidi, kteří právě kupují auto. Bannery, nativní reklama ve výpisu vozů a partnerství pro pojišťovny, servisy a finanční společnosti.",
      },
    ],
  }),
  component: Advertising,
});

const formats = [
  {
    name: "Leaderboard",
    size: "970 × 90 / 320 × 100",
    where: "Úvodní stránka, výpis vozů",
    cpm: 180,
  },
  { name: "Medium rectangle", size: "300 × 250", where: "Detail vozu, filtry ve výpisu", cpm: 220 },
  {
    name: "Nativní reklama",
    size: "Karta ve výpisu",
    where: "Každá 6. pozice ve výpisu",
    cpm: 260,
  },
  { name: "Partner rubriky", size: "Logo + text", where: "Financování, leasing, aukce", cpm: null },
];

const audiences = [
  "Pojišťovny (povinné ručení, havarijní)",
  "Autoservisy a pneuservisy",
  "Leasing a úvěry na auto",
  "Prodejci autopříslušenství",
  "Autoškoly a dovozci",
  "Výkup a prověření vozidel",
];

function Advertising() {
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Reklama" }]} />
        <SectionTitle
          eyebrow="Pro inzerenty"
          title="Oslovte lidi, kteří právě kupují auto"
          desc="Drivio navštěvují zákazníci v nákupní fázi – hledají konkrétní vůz, financování, pojištění i servis."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Kupci v nákupní fázi", "Návštěvníci aktivně vybírají vůz a řeší financování."],
            [Target, "Cílení", "Podle značky, ceny vozu, kraje, typu karoserie i paliva."],
            [Car, "Kontext vozu", "Reklama u konkrétního modelu, např. pojištění u detailu vozu."],
            [BarChart3, "Transparentní reporting", "Zobrazení, prokliky a konverze měsíčně."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Users;
            return (
              <div key={t as string} className="surface-card p-5">
                <I className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold">{t as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>

        <h2 className="mt-12 text-2xl font-bold">Formáty a orientační ceník</h2>
        <div className="surface-card mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Formát</th>
                <th className="px-4 py-3">Rozměr</th>
                <th className="px-4 py-3">Umístění</th>
                <th className="px-4 py-3 text-right">Cena</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((f) => (
                <tr key={f.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">{f.name}</td>
                  <td className="px-4 py-3">{f.size}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.where}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {f.cpm ? `${czk(f.cpm)} CPM` : "individuálně"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Ceny bez DPH za 1 000 zobrazení. Volné plochy se doplňují programatickou reklamou (Google
          AdSense / Sklik), vždy až po souhlasu návštěvníka s cookies.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Pro koho je reklama vhodná</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {audiences.map((a) => (
                <li key={a} className="surface-card flex items-center gap-2 p-3 text-sm">
                  <MousePointerClick className="h-4 w-4 text-primary" /> {a}
                </li>
              ))}
            </ul>
          </div>
          <form
            className="surface-card space-y-3 p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              try {
                await submitContact({
                  data: {
                    kind: "advertising",
                    company: String(f.get("company") ?? ""),
                    name: String(f.get("name") ?? ""),
                    email: String(f.get("email") ?? ""),
                    budget: String(f.get("budget") ?? ""),
                    message: String(f.get("message") ?? ""),
                    website: String(f.get("website") ?? ""),
                  },
                });
                form.reset();
                toast.success("Poptávka odeslána", {
                  description: "Mediakit a nabídku vám pošleme do 1 pracovního dne.",
                });
              } catch {
                toast.error("Poptávku se nepodařilo odeslat, zkontrolujte údaje.");
              }
            }}
          >
            <p className="flex items-center gap-2 font-display text-lg font-bold">
              <Megaphone className="h-5 w-5 text-primary" /> Chci inzerovat
            </p>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <input required name="company" className="field" placeholder="Firma" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input required name="name" className="field" placeholder="Kontaktní osoba" />
              <input required type="email" name="email" className="field" placeholder="E-mail" />
            </div>
            <select name="budget" className="field" aria-label="Měsíční rozpočet">
              <option>Rozpočet do 10 000 Kč / měsíc</option>
              <option>10 000 – 50 000 Kč / měsíc</option>
              <option>Nad 50 000 Kč / měsíc</option>
            </select>
            <textarea
              name="message"
              rows={4}
              className="field"
              placeholder="Co chcete propagovat?"
            />
            <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">
              Poslat poptávku
            </button>
          </form>
        </div>
      </Container>
    </Page>
  );
}
