import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Role = "customer" | "dealer" | "admin";

export type AuthState =
  | { status: "demo" } // Supabase není nastavený – ukázkový režim bez přihlášení
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "signed-in"; session: Session; role: Role; tenantId: string | null };

async function resolveRole(session: Session): Promise<{ role: Role; tenantId: string | null }> {
  if (!supabase) return { role: "customer", tenantId: null };
  const uid = session.user.id;
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("users").select("is_platform_admin").eq("id", uid).maybeSingle(),
    supabase.from("tenant_members").select("tenant_id").eq("user_id", uid).limit(1).maybeSingle(),
  ]);
  if (profile?.is_platform_admin) return { role: "admin", tenantId: membership?.tenant_id ?? null };
  if (membership?.tenant_id) return { role: "dealer", tenantId: membership.tenant_id as string };
  return { role: "customer", tenantId: null };
}

/** Stav přihlášení. Na serveru a v ukázkovém režimu vrací „demo“/„loading“. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(
    supabase ? { status: "loading" } : { status: "demo" },
  );

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const apply = async (session: Session | null) => {
      if (!session) return alive && setState({ status: "anonymous" });
      const r = await resolveRole(session);
      if (alive) setState({ status: "signed-in", session, ...r });
    };
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => void apply(session));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut() {
  await supabase?.auth.signOut();
}
