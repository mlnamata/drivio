import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt a nápověda | Drivio" },
      {
        name: "description",
        content:
          "Kontaktujte tým Drivio – zákaznická podpora, obchod pro autobazary a partnerství.",
      },
    ],
  }),
  component: Contact,
});

const faq = [
  [
    "Kdo prodává vozy na Drivio?",
    "Pouze ověřené autobazary s platným IČO. Soukromé inzeráty nepřijímáme.",
  ],
  [
    "Jak funguje aukce od 1 Kč?",
    "Autobazar nabídne vůz s vyvolávací cenou 1 Kč. Nejvyšší příhoz na konci aukce vyhrává, vydražitel platí aukční poplatek 3–5 %.",
  ],
  [
    "Je výpočet splátky závazný?",
    "Ne, jde o orientační výpočet. Konečnou nabídku připraví finanční partner po posouzení žádosti.",
  ],
  [
    "Jak smazat svůj účet a údaje?",
    "Napište na gdpr@drivio.cz. Žádost vyřídíme do 30 dnů, údaje anonymizujeme.",
  ],
];

function Contact() {
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Kontakt" }]} />
        <h1 className="text-4xl font-extrabold">Kontakt a nápověda</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {[
              [Mail, "Zákaznická podpora", "podpora@drivio.cz"],
              [Phone, "Obchod pro autobazary", "+420 800 123 456 (Po–Pá 8–18)"],
              [MapPin, "Drivio s.r.o.", "Na Poříčí 1, 110 00 Praha 1 · IČO doplnit"],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Mail;
              return (
                <div key={t as string} className="surface-card flex gap-4 p-5">
                  <I className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{t as string}</p>
                    <p className="text-sm text-muted-foreground">{d as string}</p>
                  </div>
                </div>
              );
            })}
            <div className="surface-card divide-y divide-border">
              {faq.map(([q, a]) => (
                <details key={q} className="group p-5">
                  <summary className="cursor-pointer list-none font-semibold">{q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
          <form
            className="surface-card h-fit space-y-3 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.currentTarget.reset();
              toast.success("Zpráva odeslána", { description: "Ozveme se do 1 pracovního dne." });
            }}
          >
            <p className="font-display text-lg font-bold">Napište nám</p>
            <select className="field" name="topic" aria-label="Téma">
              <option>Dotaz k inzerátu</option>
              <option>Jsem autobazar</option>
              <option>Leasingová / finanční spolupráce</option>
              <option>Ochrana osobních údajů</option>
            </select>
            <input required name="name" placeholder="Jméno" className="field" />
            <input required type="email" name="email" placeholder="E-mail" className="field" />
            <textarea required name="message" rows={5} placeholder="Zpráva" className="field" />
            <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">
              Odeslat
            </button>
          </form>
        </div>
      </Container>
    </Page>
  );
}
