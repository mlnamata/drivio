import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/inzeraty", label: "Inzeráty" },
  { to: "/aukce", label: "Aukce od 1 Kč" },
  { to: "/cenik", label: "Ceník" },
  { to: "/dashboard", label: "Pro autobazary" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-heat h-7 w-7 rounded-md" aria-hidden />
          <span className="font-display text-xl font-bold tracking-tight">Drivio</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/dashboard"
          className="bg-heat rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Přidat vůz
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Drivio — inzerce, která tlačí na rychlý prodej.</p>
        <div className="flex flex-wrap gap-5">
          {nav.map((i) => (
            <Link key={i.to} to={i.to} className="transition-colors hover:text-foreground">
              {i.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
      {desc ? <p className="mt-3 text-muted-foreground">{desc}</p> : null}
    </div>
  );
}
