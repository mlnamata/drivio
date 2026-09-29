import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";

const legalNav = [
  { to: "/pravni/obchodni-podminky", label: "Obchodní podmínky" },
  { to: "/pravni/ochrana-osobnich-udaju", label: "Ochrana osobních údajů" },
  { to: "/pravni/cookies", label: "Cookies" },
] as const;

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs
          items={[{ to: "/", label: "Drivio" }, { label: "Právní informace" }, { label: title }]}
        />
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <nav className="surface-card h-fit p-3">
            {legalNav.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                activeProps={{ className: "bg-accent font-semibold text-accent-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <article className="surface-card p-6 md:p-10 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-foreground/85 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_ul]:text-foreground/85">
            <h1 className="text-3xl font-extrabold">{title}</h1>
            <p className="!mt-1 text-sm !text-muted-foreground">Účinné od {updated}</p>
            {children}
          </article>
        </div>
      </Container>
    </Page>
  );
}
