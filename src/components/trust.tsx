import { BadgeCheck, Gavel, Plus, ShieldCheck, Truck, Wallet } from "lucide-react";

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
 * Recenze zákazníků. Na webu se ukazují jen skutečné recenze (např. převzaté z Google),
 * vymyšlené recenze zakazuje zákon o ochraně spotřebitele. Dokud pole je prázdné,
 * sekce se nevykreslí vůbec.
 */
const reviews: { name: string; city: string; text: string; car: string }[] = [];

export function Reviews() {
  if (reviews.length === 0) return null;
  return (
    <div>
      <h2 className="text-2xl font-bold md:text-[1.75rem]">Zkušenosti zákazníků</h2>
      <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="border-t border-border pt-5">
            <blockquote className="text-foreground/85">„{r.text}“</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold">{r.name}</span>
              <span className="text-muted-foreground">
                , {r.city}, {r.car}
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
    <div className="flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:gap-10">
      <p className="shrink-0 text-sm text-muted-foreground">
        Partneři pro financování, leasing a prověrky
      </p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {names.map((n) => (
          <span key={n} className="font-display text-lg font-bold text-foreground/40">
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
        <h2 className="text-2xl font-bold md:text-[1.75rem]">Časté dotazy</h2>
        <p className="mt-3 text-muted-foreground">
          Nenašli jste odpověď? Napište nám, odpovídáme obvykle do hodiny.
        </p>
        <a
          href="/kontakt"
          className="mt-5 inline-flex rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
        >
          Kontaktovat podporu
        </a>
      </div>
      <div className="divide-y divide-border border-y border-border">
        {faq.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {q}
              <Plus
                aria-hidden
                className="ml-4 h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-45"
              />
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
