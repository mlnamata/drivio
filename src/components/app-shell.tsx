import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon; badge?: string | number };

/** Layout administrace (autobazar i správa portálu) – tmavé boční menu, světlý obsah. */
export function AppShell({
  title,
  subtitle,
  nav,
  footer,
}: {
  title: string;
  subtitle: string;
  nav: { section?: string; items: NavItem[] }[];
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
        <LogoMark className="text-sidebar-primary" />
        <div className="leading-tight">
          <p className="font-display text-base font-extrabold text-white">drivio</p>
          <p className="text-[11px] text-sidebar-foreground/60">{subtitle}</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.section ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
                {g.section}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const active =
                  path === i.to || (i.to.split("/").length > 2 && path.startsWith(i.to));
                return (
                  <li key={i.to}>
                    <Link
                      to={i.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-semibold text-white"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-white",
                      )}
                    >
                      <i.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
                      <span className="flex-1">{i.label}</span>
                      {i.badge !== undefined ? (
                        <span className="rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-[11px] font-semibold text-sidebar-primary">
                          {i.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        {footer}
        <Link
          to="/"
          className="mt-3 flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Zpět na web
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-sidebar text-sidebar-foreground lg:block">
        {sidebar}
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground">
            {sidebar}
          </aside>
        </div>
      ) : null}
      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 border-x-0 border-t-0 px-4 md:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="font-semibold">{title}</p>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  tone?: "warn" | "ok" | undefined;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
      {hint ? (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "warn"
              ? "text-warning"
              : tone === "ok"
                ? "text-success"
                : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "info" | "muted";
  children: ReactNode;
}) {
  const cls = {
    ok: "bg-success/12 text-success",
    warn: "bg-warning/15 text-[oklch(0.5_0.13_60)]",
    bad: "bg-destructive/12 text-destructive",
    info: "bg-accent text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", cls)}>
      {children}
    </span>
  );
}

export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-4 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border [&_tr:last-child]:border-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90",
  ghost:
    "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/40",
};
