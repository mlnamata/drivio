import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, Container, Page, SectionTitle } from "@/components/site-shell";
import { PlanCards, SlotCalculator } from "@/components/pricing";
import { commissionTiers, num } from "@/lib/mock-data";

export const Route = createFileRoute("/cenik")({
  head: () => ({
    meta: [
      { title: "Ceník inzerce pro autobazary | Drivio" },
      {
        name: "description",
        content:
          "Měsíční balíčky slotů pro autobazary od 990 Kč. Férový doplatek jen za dražší vůz, provize z prodeje od 0,2 %.",
      },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs
          items={[
            { to: "/", label: "Drivio" },
            { to: "/pro-autobazary", label: "Pro autobazary" },
            { label: "Ceník" },
          ]}
        />
        <SectionTitle
          eyebrow="Ceník pro autobazary"
          title="Platíte za místo v garáži, ne za každý inzerát"
          desc="Vyberte si balíček slotů podle cenové hladiny vozů. Vozy ve slotech můžete libovolně měnit."
        />
        <PlanCards />
        <div className="mt-12">
          <SlotCalculator />
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="surface-card p-6">
            <h3 className="text-lg font-bold">Časová progrese</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Motivuje k realistické ceně a rychlé obrátce.
            </p>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {[
                  ["1. měsíc inzerce", "základní sazba slotu"],
                  ["2. měsíc", "+50 %"],
                  ["3. měsíc a dál", "+100 % · nabídka aukce od 1 Kč"],
                ].map(([a, b]) => (
                  <tr key={a} className="border-b border-border last:border-0">
                    <td className="py-2.5">{a}</td>
                    <td className="py-2.5 text-right font-semibold">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="surface-card p-6">
            <h3 className="text-lg font-bold">Provize z úspěšného prodeje</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Klesající procento – u levných aut malá částka, u drahých nízké %.
            </p>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {commissionTiers.map((t, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2.5">
                      {t.upTo === Infinity
                        ? `nad ${num(commissionTiers[i - 1]!.upTo)} Kč`
                        : `do ${num(t.upTo)} Kč`}
                    </td>
                    <td className="py-2.5 text-right font-semibold">
                      {(t.rate * 100).toLocaleString("cs-CZ")} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Všechny ceny jsou uvedeny bez DPH 21 %. Fakturace měsíčně, splatnost 14 dní, platba
          převodem nebo kartou (GoPay/Comgate).
        </p>
      </Container>
    </Page>
  );
}
