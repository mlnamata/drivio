import { Link } from "@tanstack/react-router";
import {
  BellRing,
  Car,
  Gavel,
  Heart,
  KeyRound,
  Menu,
  PlusCircle,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo, LogoFlat } from "@/components/logo";
import { CookieBanner } from "@/components/cookie-banner";
import { CompareBar } from "@/components/compare";
import { UspBar } from "@/components/trust";
import { ThemeSwitch, ThemeToggle } from "@/components/theme-toggle";
import { useFavorites } from "@/hooks/use-favorites";
import { useStore } from "@/lib/store";
import { signOut, useAuth } from "@/lib/auth";
import { brands } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/* Hlavička je čistě pro zákazníky. Autobazary a leasingovky mají sekci v patičce. */
const nav = [
  { to: "/inzeraty", label: "Osobní auta", icon: Car, search: { category: "osobni" } },
  { to: "/inzeraty", label: "Užitková", icon: Truck, search: { category: "uzitkove" } },
  { to: "/leasing", label: "Operativní leasing", icon: KeyRound },
  { to: "/aukce", label: "Aukce od 1 Kč", icon: Gavel },
  { to: "/financovani", label: "Financování", icon: Wallet },
] as const;

function IconLink({
  to,
  label,
  count,
  children,
}: {
  to: "/oblibene" | "/hlidaci-pes";
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="relative inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground"
      aria-label={label}
      activeProps={{ className: "text-primary-ink" }}
    >
      {children}
      <span className="hidden 2xl:inline">{label}</span>
      {count > 0 ? (
        <span className="absolute left-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { ids } = useFavorites();
  const { searches } = useStore();
  const auth = useAuth();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-card transition-shadow",
        scrolled && "shadow-[0_6px_20px_-14px_oklch(0.2_0.01_260/0.35)]",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" aria-label="Drivio – úvod" className="shrink-0">
          <Logo className="h-8 md:h-9" />
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex">
          {nav.map((i) => (
            <Link
              key={i.label}
              to={i.to}
              {...("search" in i ? { search: i.search } : {})}
              className="relative rounded-lg px-3 py-2 text-sm font-semibold text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground"
              activeOptions={{ includeSearch: "search" in i }}
              activeProps={{
                className:
                  "text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-primary",
              }}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <IconLink to="/hlidaci-pes" label="Hlídací pes" count={searches.length}>
            <BellRing className="h-5 w-5" />
          </IconLink>
          <IconLink to="/oblibene" label="Oblíbené" count={ids.length}>
            <Heart className="h-5 w-5" />
          </IconLink>
          <ThemeToggle />
          <Link
            to="/prodat-auto"
            className="ml-1 hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
          >
            <PlusCircle className="h-4 w-4" /> Prodat auto
          </Link>
          {auth.status === "signed-in" ? (
            <div className="ml-1 hidden items-center gap-1 sm:flex">
              {auth.role !== "customer" ? (
                <Link
                  to={auth.role === "admin" ? "/admin" : "/dashboard"}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
                >
                  {auth.role === "admin" ? "Správa" : "Můj autobazar"}
                </Link>
              ) : null}
              <button
                onClick={() => void signOut()}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground/70 hover:bg-foreground/5"
              >
                Odhlásit
              </button>
            </div>
          ) : (
            <Link
              to="/prihlaseni"
              className="ml-1 hidden items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-foreground/30 hover:bg-foreground/5 sm:inline-flex"
            >
              <User className="h-4 w-4" /> Přihlásit
            </Link>
          )}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-foreground/5 xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border bg-card px-4 py-2 xl:hidden">
          {nav.map((i) => (
            <Link
              key={i.label}
              to={i.to}
              {...("search" in i ? { search: i.search } : {})}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-foreground/5"
            >
              <i.icon className="h-4 w-4 text-primary" /> {i.label}
            </Link>
          ))}
          <Link
            to="/prodat-auto"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-foreground/5"
          >
            <PlusCircle className="h-4 w-4 text-primary" /> Prodat auto zdarma
          </Link>
          <Link
            to="/prihlaseni"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-foreground/5"
          >
            <User className="h-4 w-4 text-primary" /> Přihlásit
          </Link>
        </div>
      ) : null}
    </header>
  );
}

const footerCols: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Nakupující",
    links: [
      { to: "/inzeraty", label: "Hledat auta" },
      { to: "/aukce", label: "Aukce od 1 Kč" },
      { to: "/leasing", label: "Operativní leasing" },
      { to: "/financovani", label: "Auto na úvěr" },
      { to: "/prodat-auto", label: "Prodat auto zdarma" },
      { to: "/hlidaci-pes", label: "Hlídací pes" },
      { to: "/oblibene", label: "Oblíbené vozy" },
      { to: "/kontakt", label: "Nápověda a kontakt" },
    ],
  },
  {
    title: "Pro autobazary",
    links: [
      { to: "/pro-autobazary", label: "Proč inzerovat na Drivio" },
      { to: "/cenik", label: "Ceník slotů" },
      { to: "/dashboard", label: "Administrace autobazaru" },
      { to: "/prihlaseni", label: "Registrace autobazaru" },
    ],
  },
  {
    title: "Pro leasingové společnosti",
    links: [
      { to: "/pro-leasingove-spolecnosti", label: "Partnerský program" },
      { to: "/pro-leasingove-spolecnosti", label: "API pro předávání leadů" },
      { to: "/kontakt", label: "Obchodní spolupráce" },
    ],
  },
  {
    title: "Pro inzerenty",
    links: [
      { to: "/reklama", label: "Reklama na Drivio" },
      { to: "/reklama", label: "Formáty a ceník" },
    ],
  },
];

const businessIntro: Record<string, string> = {
  "Pro autobazary": "Sloty nebo platba za vůz, import z vašeho systému a statistiky zájmu.",
  "Pro leasingové společnosti": "Žádosti o financování s ověřeným vozem a souhlasem zákazníka.",
  "Pro inzerenty": "Reklama pro lidi, kteří právě vybírají auto.",
};

export function SiteFooter() {
  const [buyers, ...business] = footerCols;
  return (
    <footer className="mt-24 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14">
        {/* Firemní sekce – v hlavičce je jen to, co potřebují zákazníci */}
        <div className="grid gap-10 border-b border-sidebar-border pb-12 md:grid-cols-3">
          {business.map((c) => (
            <div key={c.title}>
              <h2 className="text-lg font-bold text-white">{c.title}</h2>
              <p className="mt-2 max-w-xs text-sm text-sidebar-foreground/65">
                {businessIntro[c.title]}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sidebar-foreground/85 underline-offset-4 hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <LogoFlat className="text-[1.7rem]" />
            <p className="mt-4 max-w-xs text-sm text-sidebar-foreground/65">
              Ojetá auta od prověřených autobazarů. Splátka na první pohled, operativní leasing a
              {"\u00a0"}aukce od 1{"\u00a0"}Kč.
            </p>
            <p className="mb-2 mt-6 text-sm font-semibold text-white">Vzhled webu</p>
            <ThemeSwitch tone="dark" />
          </div>
          {buyers ? (
            <div>
              <p className="mb-4 text-sm font-semibold text-white">{buyers.title}</p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
                {buyers.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sidebar-foreground/75 underline-offset-4 hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t border-sidebar-border pt-8">
          <p className="mb-3 text-sm font-semibold text-white">Oblíbené značky</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {brands.map((b) => (
              <Link
                key={b.slug}
                to="/inzeraty"
                search={{ brand: b.slug }}
                className="text-sidebar-foreground/65 hover:text-white"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Drivio s.r.o., provozovatel portálu drivio.cz</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/pravni/obchodni-podminky" className="hover:text-white">
              Obchodní podmínky
            </Link>
            <Link to="/pravni/ochrana-osobnich-udaju" className="hover:text-white">
              Ochrana osobních údajů
            </Link>
            <Link to="/pravni/cookies" className="hover:text-white">
              Cookies
            </Link>
            <Link to="/pravni/zdroje-fotografii" className="hover:text-white">
              Zdroje fotografií
            </Link>
            <Link to="/admin" className="hover:text-white">
              Správa portálu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <SiteHeader />
      <UspBar />
      <main>{children}</main>
      <SiteFooter />
      <CompareBar />
      <CookieBanner />
    </div>
  );
}

/** Nadpis sekce. Bez nadtitulků („eyebrow“) – nadpis má nést sdělení sám. */
export function SectionTitle({
  title,
  desc,
  action,
  className,
}: {
  title: string;
  desc?: string;
  /** Odkaz zarovnaný vpravo od nadpisu, např. „Všech 120 vozů“ */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2", className)}>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold md:text-[1.75rem]">{title}</h2>
        {desc ? <p className="mt-1.5 text-muted-foreground">{desc}</p> : null}
      </div>
      {action ? <div className="shrink-0 text-sm font-semibold">{action}</div> : null}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4", className)}>{children}</div>;
}

export function Breadcrumbs({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav aria-label="Drobečková navigace" className="mb-6 text-sm text-muted-foreground">
      {items.map((it, i) => (
        <span key={it.label}>
          {i > 0 ? <span className="mx-2 text-border">/</span> : null}
          {it.to ? (
            <Link to={it.to} className="hover:text-foreground">
              {it.label}
            </Link>
          ) : (
            <span className="text-foreground">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageLoading() {
  return (
    <Page>
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    </Page>
  );
}
