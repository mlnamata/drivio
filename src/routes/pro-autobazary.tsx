import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Gauge, Gavel, LayoutDashboard, ScanLine, Users } from "lucide-react";
import { Container, Page, SectionTitle } from "@/components/site-shell";
import { PlanCards } from "@/components/pricing";

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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-primary">
            Pro autobazary
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold md:text-6xl">
            Inzerce, která prodává rychleji
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Předvídatelný měsíční paušál, férový doplatek jen za výjimečně drahé vozy a aukce jako
            záchranná brzda pro ležáky.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/prihlaseni"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground"
            >
              Registrovat autobazar <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="glass-dark rounded-full px-6 py-3 text-sm font-semibold"
            >
              Prohlédnout administraci
            </Link>
          </div>
        </Container>
      </section>
      <Container className="py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(([Icon, t, d]) => (
            <div key={t} className="surface-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Container>
      <Container className="pb-8">
        <SectionTitle eyebrow="Ceník" title="Balíčky slotů" />
        <PlanCards />
        <Link to="/cenik" className="mt-6 inline-flex text-sm font-semibold text-primary">
          Podrobný ceník a kalkulačka poplatků →
        </Link>
      </Container>
    </Page>
  );
}
