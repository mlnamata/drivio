import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Lock, Send, Webhook } from "lucide-react";
import { Container, Page, SectionTitle } from "@/components/site-shell";

export const Route = createFileRoute("/pro-leasingove-spolecnosti")({
  head: () => ({
    meta: [
      { title: "Partnerský program pro leasingové společnosti | Drivio" },
      {
        name: "description",
        content:
          "Kvalifikované leady na financování ojetých vozů v reálném čase přes zabezpečené API. Model CPL / CPS.",
      },
    ],
  }),
  component: ForLeasing,
});

const payload = `POST https://api.partner.cz/leads
X-Drivio-Signature: sha256=9f2c…
Idempotency-Key: 0b8e1c1a-…

{
  "lead_id": "0b8e1c1a-…",
  "created_at": "2026-09-29T08:15:02Z",
  "applicant": { "name": "Jan Novák", "email": "…", "phone": "+420…" },
  "vehicle": { "vin": "TMB…", "brand": "Škoda", "model": "Octavia",
               "year": 2017, "price": 279000 },
  "request": { "amount": 279000, "months": 72, "down_payment": 0 },
  "consent": { "version": "2026-09-v1", "at": "…", "ip": "…" }
}`;

function ForLeasing() {
  return (
    <Page>
      <Container className="py-16">
        <SectionTitle
          eyebrow="Pro leasingové a úvěrové společnosti"
          title="Kvalifikované leady na financování aut v reálném čase"
          desc="Každá žádost obsahuje ověřený vůz (VIN, cena, prodejce) a doložitelný souhlas zákazníka. Spolupracujeme v modelu CPL nebo CPS."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              [
                Send,
                "Okamžité předání",
                "Lead odchází do vašeho CRM nebo skóringu do několika sekund od odeslání formuláře.",
              ],
              [
                Lock,
                "Podpis HMAC SHA-256",
                "Každý požadavek je podepsaný sdíleným tajemstvím, přenos pouze přes TLS 1.2+.",
              ],
              [
                KeyRound,
                "Idempotence",
                "Unikátní lead_id a hlavička Idempotency-Key – opakované doručení nevytvoří duplicitu.",
              ],
              [
                Webhook,
                "Zpětná vazba",
                "Webhook se stavem (schváleno / zamítnuto / profinancováno) pro výpočet CPS provize.",
              ],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Send;
              return (
                <div key={t as string} className="surface-card flex gap-4 p-5">
                  <I className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{t as string}</p>
                    <p className="text-sm text-muted-foreground">{d as string}</p>
                  </div>
                </div>
              );
            })}
            <Link
              to="/kontakt"
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Domluvit spolupráci
            </Link>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-sidebar p-6 text-xs leading-relaxed text-sidebar-foreground">
            {payload}
          </pre>
        </div>
      </Container>
    </Page>
  );
}
