import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prihlaseni")({
  head: () => ({
    meta: [{ title: "Přihlášení | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"customer" | "dealer">("customer");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    if (!supabase) {
      toast.success("Ukázkový režim", {
        description: "Přihlášení bude aktivní po napojení Supabase Auth.",
      });
      if (mode === "dealer") void navigate({ to: "/dashboard" });
      return;
    }
    setBusy(true);
    const { error } =
      tab === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { account_type: mode, company_id: f.get("ico") ?? null } },
          });
    setBusy(false);
    if (error) return void toast.error(error.message);
    if (tab === "register") toast.success("Potvrďte registraci odkazem v e-mailu.");
    else void navigate({ to: mode === "dealer" ? "/dashboard" : "/" });
  }

  return (
    <div className="bg-ambient flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="glass rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
            {(
              [
                ["customer", User, "Zákazník"],
                ["dealer", Building2, "Autobazar"],
              ] as const
            ).map(([m, Icon, l]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition",
                  mode === m ? "bg-card shadow-sm" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
          <h1 className="mt-6 text-2xl font-extrabold">
            {tab === "login"
              ? "Přihlášení"
              : mode === "dealer"
                ? "Registrace autobazaru"
                : "Vytvořit účet"}
          </h1>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            {tab === "register" && mode === "dealer" ? (
              <>
                <input name="company" required placeholder="Název autobazaru" className="field" />
                <input
                  name="ico"
                  required
                  pattern="[0-9]{8}"
                  placeholder="IČO (8 číslic)"
                  className="field"
                />
              </>
            ) : null}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="E-mail"
              className="field"
            />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              placeholder="Heslo"
              className="field"
            />
            {tab === "register" ? (
              <label className="flex gap-2 text-xs text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 accent-[var(--primary)]" />
                <span>
                  Souhlasím s{" "}
                  <Link to="/pravni/obchodni-podminky" className="text-primary underline">
                    obchodními podmínkami
                  </Link>{" "}
                  a beru na vědomí{" "}
                  <Link to="/pravni/ochrana-osobnich-udaju" className="text-primary underline">
                    zásady zpracování osobních údajů
                  </Link>
                  .
                </span>
              </label>
            ) : null}
            <button
              disabled={busy}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {tab === "login" ? "Přihlásit se" : "Zaregistrovat"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {tab === "login" ? "Nemáte účet? " : "Už účet máte? "}
            <button
              onClick={() => setTab(tab === "login" ? "register" : "login")}
              className="font-semibold text-primary"
            >
              {tab === "login" ? "Zaregistrujte se" : "Přihlaste se"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
