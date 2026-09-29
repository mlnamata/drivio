import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuth, type Role } from "@/lib/auth";

/**
 * Ochrana administrace. S nastaveným Supabase vyžaduje přihlášení a roli
 * (autobazar / správce). Bez Supabase běží ukázkový režim s upozorněním.
 */
export function AuthGate({
  require,
  children,
}: {
  require: Exclude<Role, "customer">;
  children: ReactNode;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Cesta se zachytí při prvním vykreslení – po přesměrování se už nemění.
  const target = useRef(path);
  const redirected = useRef(false);
  useEffect(() => {
    if (auth.status !== "anonymous" || redirected.current) return;
    redirected.current = true;
    void navigate({ to: "/prihlaseni", search: { next: target.current } });
  }, [auth.status, navigate]);

  if (auth.status === "demo") {
    return (
      <>
        <div className="sticky top-0 z-[70] bg-warning px-4 py-1.5 text-center text-xs font-semibold text-warning-foreground">
          Ukázkový režim – data jsou jen ve vašem prohlížeči a administrace není chráněná. Pro ostrý
          provoz nastavte Supabase (README).
        </div>
        {children}
      </>
    );
  }
  if (auth.status === "loading" || auth.status === "anonymous") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  const allowed = auth.role === "admin" || (require === "dealer" && auth.role === "dealer");
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface-card max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Sem nemáte přístup</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {require === "admin"
              ? "Správa portálu je jen pro administrátory Drivio."
              : "Administrace je určená pro registrované autobazary a firmy."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Zpět na web
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
