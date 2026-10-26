import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Gauge, Gavel, LayoutDashboard, ScanLine, TrendingUp, Users } from "lucide-react";
import { Container, Page, SectionTitle } from "@/components/site-shell";
import { PayPerVehicleCard, PlanCards } from "@/components/pricing";

export const Route = createFileRoute("/pro-autobazary")({
  head: () => ({
    meta: [
      { title: "Inzerce pro autobazary | Drivio" },
      {
        name: "description",
        content:
          "SaaS inzerce pro autobazary: sloty v digitální garáži, VIN dekodér, aukce od 1 Kč, leady na financování a ISDOC faktury.",
      },
    ],
  }),
  component: ForDealers,
});

const features = [
  [
    LayoutDashboard,
    "Digitální garáž",
    "Měsíční balíček slotů. Vozy měníte, kdy chcete – žádné platby za jednotlivé inzeráty.",
  ],
  [
    ScanLine,
    "Inzerát z VIN za 30 s",
    "Zadáte VIN a parametry, výbavu i motorizaci doplníme automaticky.",
  ],
  [
    Gauge,
    "Tlak na obrátku",
    "Rostoucí sazba za ležáky vás drží u realistické ceny. Průměrná doba prodeje 27 dní.",
  ],
  [
    TrendingUp,
    "Topování inzerátů",
    "Vaše vozy posouváme nahoru ve výpisu i do TOP nabídek na úvodní stránce – víc zobrazení, rychlejší prodej.",
  ],
  [
    Gavel,
    "Záchranná brzda",
    "Po 3 měsících přesunete vůz do aukce od 1 Kč, poplatek za progresi odpustíme.",
  ],
  [
    Users,
    "Zákazníci s financováním",
    "U každého vozu splátka a formulář na úvěr. Schválený zákazník přijde připravený.",
  ],
  [
    FileText,
    "ISDOC faktury",
    "Faktury z Fakturoidu s ISDOC vrstvou – import do Pohody, Money S3 i ABRA Flexi.",
  ],
] as const;

function ForDealers() {
  return (
    <Page>
      <section className="bg-sidebar text-white">
        <Container className="py-20">
          <h1 className="max-w-3xl text-4xl font-extrabold md:text-6xl">
            Inzerce pro autobazary, která prodává rychleji
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Předvídatelný měsíční paušál, férový doplatek jen za výjimečně drahé vozy a aukce jako
            záchranná brzda pro ležáky.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/prihlaseni"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-sidebar transition-colors hover:bg-white/90"
            >
              Registrovat autobazar
            </Link>
            <Link
              to="/dashboard"
              className="panel-dark rounded-lg px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              Prohlédnout administraci
            </Link>
          </div>
        </Container>
      </section>
      <Container className="py-16">
        <h2 className="text-2xl font-bold md:text-[1.75rem]">Co dostanete</h2>
        <dl className="mt-6 grid gap-x-10 md:grid-cols-2">
          {features.map(([Icon, t, d]) => (
            <div key={t} className="flex gap-4 border-t border-border py-5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <dt className="font-semibold">{t}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
      <Container className="pb-8">
        <SectionTitle title="Balíčky slotů" />
        <p className="mb-3 text-sm font-semibold">
          Varianta 1 – předplatné balíčku slotů (výhodnější při více vozech)
        </p>
        <PlanCards />
        <p className="mb-3 mt-10 text-sm font-semibold">Varianta 2 – platba za jednotlivý vůz</p>
        <PayPerVehicleCard />
        <p className="mt-4 text-sm text-muted-foreground">
          Prodáváte jen jedno vlastní auto jako fyzická osoba? Máte{" "}
          <a href="/prodat-auto" className="font-semibold text-primary-ink hover:underline">
            1 inzerát zdarma
          </a>
          .
        </p>
        <Link
          to="/cenik"
          className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4"
        >
          Podrobný ceník a kalkulačka poplatků
        </Link>
      </Container>
    </Page>
  );
}
