import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Clock, Percent } from "lucide-react";
import { FinanceCalculator } from "@/components/finance-calculator";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { financePartners } from "@/lib/mock-data";

export const Route = createFileRoute("/financovani")({
  head: () => ({
    meta: [
      { title: "Auto na splátky a leasing | Drivio" },
      {
        name: "description",
        content:
          "Spočítejte si splátku a získejte nezávaznou nabídku financování ojetého auta od Essox, Home Credit a Cofidis.",
      },
    ],
  }),
  component: Financing,
});

function Financing() {
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Financování" }]} />
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <h1 className="text-4xl font-extrabold md:text-5xl">Auto na splátky, jednoduše</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Vyplníte jednu žádost, my ji předáme partnerům a vy si vyberete nejvýhodnější nabídku.
              Financování až 100 % ceny vozu, bez akontace.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                [Clock, "Odpověď do 30 min", "Předschválení online v pracovní době."],
                [Percent, "Úrok od 7,9 % p.a.", "Podle bonity a stáří vozu."],
                [BadgeCheck, "Bez poplatku", "Za zprostředkování nic neplatíte."],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Clock;
                return (
                  <div key={t as string} className="surface-card p-5">
                    <I className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-semibold">{t as string}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="mt-12 text-2xl font-bold">Naši finanční partneři</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {financePartners.map((p) => (
                <div key={p.id} className="surface-card p-5">
                  <p className="font-display text-xl font-extrabold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.product}</p>
                  <p className="mt-3 text-sm">
                    od{" "}
                    <span className="font-semibold">
                      {(p.rate * 100).toFixed(1).replace(".", ",")} % p.a.
                    </span>{" "}
                    · až {p.maxMonths} měsíců
                  </p>
                </div>
              ))}
            </div>

            <h2 className="mt-12 text-2xl font-bold">Jak to funguje</h2>
            <ol className="mt-4 space-y-3">
              {[
                "Spočítejte si splátku a vyplňte krátký formulář.",
                "Žádost zabezpečeně předáme vybraným partnerům (jen s vaším souhlasem).",
                "Partner vás kontaktuje s nabídkou, smlouvu podepíšete online nebo u prodejce.",
              ].map((t, i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-1">{t}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xs text-muted-foreground">
              Reprezentativní příklad: úvěr 200 000 Kč na 72 měsíců, úroková sazba 9,9 % p.a.,
              měsíční splátka 3 697 Kč, RPSN 10,4 %, celková splatná částka 266 184 Kč. Drivio
              s.r.o. je vázaným zástupcem zprostředkovatele spotřebitelského úvěru (údaj doplnit
              před spuštěním).
            </p>
          </div>
          <FinanceCalculator price={200000} editablePrice className="h-fit lg:sticky lg:top-20" />
        </div>
      </Container>
    </Page>
  );
}
