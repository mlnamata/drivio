import { BadgeCheck, Gavel, ShieldCheck, Truck, Wallet } from "lucide-react";

/** Pruh s hlavními výhodami (ve stylu driveto.cz) – pod hlavičkou veřejného webu. */
export function UspBar() {
  const items = [
    [ShieldCheck, "Prověřené vozy s historií"],
    [Wallet, "Splátky bez akontace"],
    [Truck, "Leasing s doručením domů"],
    [Gavel, "Aukce od 1 Kč"],
    [BadgeCheck, "Jen ověření prodejci"],
  ] as const;
  return (
    <div className="border-b border-border bg-muted/70">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-xs font-medium text-foreground/75 [scrollbar-width:none]">
        {items.map(([Icon, t]) => (
          <span key={t} className="flex shrink-0 items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * UKÁZKOVÉ recenze – před spuštěním nahraďte skutečnými (např. z Google recenzí).
 * Zveřejňovat vymyšlené recenze je podle zákona o ochraně spotřebitele zakázané,
 * proto jsou na webu označené štítkem „Ukázka“.
 */
const reviews: { name: string; city: string; text: string; car: string; sample?: boolean }[] = [
  {
    name: "Petra K.",
    city: "Brno",
    text: "Octavii jsem našla za dva večery. Splátku jsem viděla hned u inzerátu a úvěr byl schválený druhý den.",
    car: "Škoda Octavia Combi",
    sample: true,
  },
  {
    name: "Martin D.",
    city: "Praha",
    text: "Vydražil jsem Astru za 41 tisíc. Aukce byla férová, všechny příhozy jsem viděl živě.",
    car: "Opel Astra (aukce)",
    sample: true,
  },
  {
    name: "Jana a Tomáš",
    city: "Plzeň",
    text: "Operativní leasing pro naši firmu vyřízený za týden, auto přivezli až před kancelář.",
    car: "Toyota Corolla Touring",
    sample: true,
  },
];

export function Reviews() {
  if (reviews.length === 0) return null;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Zkušenosti zákazníků
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">Co o nás říkají</h2>
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="surface-card relative flex flex-col justify-between p-6">
            {r.sample ? (
              <span className="absolute right-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ukázka
              </span>
            ) : null}
            <blockquote className="text-foreground/85">„{r.text}“</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                {r.name.slice(0, 1)}
              </span>
              <span>
                <span className="flex items-center gap-1 text-sm font-semibold">
                  {r.name} <BadgeCheck className="h-4 w-4 text-success" />
                </span>
                <span className="text-xs text-muted-foreground">
                  {r.city} · {r.car}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function Partners() {
  const names = [
    "Essox",
    "Home Credit",
    "Cofidis",
    "Cebia",
    "Škofin",
    "ČSOB Leasing",
    "Ayvens",
    "Arval",
  ];
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Spolupracujeme
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {names.map((n) => (
          <span key={n} className="font-display text-lg font-extrabold text-foreground/35">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

const faq = [
  [
    "Kdo na Drivio prodává?",
    "Ověřené autobazary s IČO a soukromé osoby (každá může mít 1 inzerát zdarma). Autobazary mají u inzerátu hodnocení.",
  ],
  [
    "Můžu si auto koupit na splátky?",
    "Ano. U každého vozu vidíte orientační splátku a varianty podle akontace a doby splácení. Žádost vyřídí naši partneři Essox, Home Credit nebo Cofidis.",
  ],
  [
    "Jak fungují aukce od 1 Kč?",
    "Vozy nejdřív čekají v galerii připravovaných aukcí, pak se živě draží. Můžete přihazovat ručně nebo nastavit automatické přihazování do svého maxima.",
  ],
  [
    "Co je operativní leasing?",
    "Pronájem nového nebo mladého vozu za pevnou měsíční splátku, ve které je pojištění, servis, pneumatiky i dálniční známka. Nabízíme ho soukromým osobám i firmám.",
  ],
  [
    "Jak porovnám více aut?",
    "U inzerátu klikněte na ikonu porovnání. Vybrat můžete až 4 vozy a uvidíte je vedle sebe včetně výbavy a historie.",
  ],
];

export function Faq() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Nápověda
        </p>
        <h2 className="text-2xl font-bold md:text-3xl">Časté dotazy</h2>
        <p className="mt-3 text-muted-foreground">
          Nenašli jste odpověď? Napište nám, odpovídáme obvykle do hodiny.
        </p>
        <a
          href="/kontakt"
          className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
        >
          Kontaktovat podporu
        </a>
      </div>
      <div className="surface-card divide-y divide-border">
        {faq.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {q}
              <span className="ml-4 text-xl leading-none text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
