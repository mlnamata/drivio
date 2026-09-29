import { Link } from "@tanstack/react-router";
import { Gavel, Heart, Menu, Search, User, Wallet, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { CookieBanner } from "@/components/cookie-banner";
import { useFavorites } from "@/hooks/use-favorites";
import { brands } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/* Hlavička je čistě pro zákazníky. Autobazary a leasingovky mají sekci v patičce. */
const nav = [
  { to: "/inzeraty", label: "Osobní auta", icon: Search, search: { category: "osobni" } },
  { to: "/inzeraty", label: "Užitková", icon: Search, search: { category: "uzitkove" } },
  { to: "/aukce", label: "Aukce od 1 Kč", icon: Gavel },
  { to: "/financovani", label: "Financování", icon: Wallet },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean | undefined }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { ids } = useFavorites();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const onDark = overlay && !scrolled && !open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        overlay && "-mb-16",
        scrolled || open ? "glass border-x-0 border-t-0" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" aria-label="Drivio – úvod">
          <Logo light={onDark} />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((i) => (
            <Link
              key={i.label}
              to={i.to}
              {...("search" in i ? { search: i.search } : {})}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                onDark
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/oblibene"
            className={cn(
              "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              onDark
                ? "text-white hover:bg-white/10"
                : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
            )}
            aria-label="Oblíbené vozy"
          >
            <Heart className="h-5 w-5" />
            {ids.length > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {ids.length}
              </span>
            ) : null}
          </Link>
          <Link
            to="/prihlaseni"
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-primary/40 sm:inline-flex"
          >
            <User className="h-4 w-4" /> Přihlásit
          </Link>
          <button
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
              onDark ? "text-white hover:bg-white/10" : "hover:bg-foreground/5",
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="glass mx-4 mb-3 rounded-2xl p-2 lg:hidden">
          {nav.map((i) => (
            <Link
              key={i.label}
              to={i.to}
              {...("search" in i ? { search: i.search } : {})}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-foreground/5"
            >
              <i.icon className="h-4 w-4 text-primary" /> {i.label}
            </Link>
          ))}
          <Link
            to="/prihlaseni"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-foreground/5"
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
      { to: "/financovani", label: "Financování a leasing" },
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
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-sidebar-foreground/70">
              Ojetá auta od prověřených autobazarů. Férové ceny, splátka na první pohled a aukce od
              1 Kč.
            </p>
          </div>
          {footerCols.map((c) => (
            <div key={c.title}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                {c.title}
              </p>
              <ul className="space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sidebar-foreground/80 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-sidebar-border pt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
            Oblíbené značky
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {brands.slice(0, 16).map((b) => (
              <Link
                key={b.slug}
                to="/inzeraty"
                search={{ brand: b.slug }}
                className="text-sidebar-foreground/70 hover:text-white"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Drivio s.r.o. · Provozovatel portálu drivio.cz</p>
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
            <Link to="/admin" className="hover:text-white">
              Správa portálu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Page({
  children,
  className,
  overlayHeader,
}: {
  children: ReactNode;
  className?: string;
  /** Hlavička leží průhledně přes hero fotku (úvodní stránka). */
  overlayHeader?: boolean | undefined;
}) {
  return (
    <div className={cn("bg-ambient min-h-screen", className)}>
      <SiteHeader overlay={overlayHeader} />
      <main>{children}</main>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  className,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 max-w-2xl", className)}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      {desc ? <p className="mt-3 text-muted-foreground">{desc}</p> : null}
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
