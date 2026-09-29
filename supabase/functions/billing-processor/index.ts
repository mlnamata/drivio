// Supabase Edge Function (Deno) – volá ji pg_cron přes pg_net.
//  mode "daily": přepočítá náklady slotů (progrese + doplatky) a uloží koncept faktury,
//               ležákům (90+ dní) pošle nabídku aukce přes Resend.
//  mode "issue": vystaví koncepty ve Fakturoidu (API v3, PDF s ISDOC).
import { createClient } from "npm:@supabase/supabase-js@2";

type Plan = {
  id: string;
  name: string;
  monthly_price: number;
  slots: number;
  max_vehicle_price: number | null;
  top_tier_listing_price: number;
};
type Vehicle = {
  id: string;
  tenant_id: string;
  brand: string;
  model: string;
  price: number;
  listed_at: string;
  status: string;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

/** Měsíc inzerce: 1 = prvních 30 dní. */
const listingMonth = (listedAt: string, now: Date) =>
  Math.floor((now.getTime() - new Date(listedAt).getTime()) / 86_400_000 / 30) + 1;

const progressionFactor = (month: number) => (month <= 1 ? 1 : month === 2 ? 1.5 : 2);

/**
 * „Lamborghini" doplatek – jen pro slot, kde cena vozu překračuje limit balíčku:
 *   doplatek = tabulková cena inzerátu nejvyšší kategorie − podíl slotu v balíčku
 *   (např. 499 Kč − 990/10 = 400 Kč). Balíček ani ostatní sloty se nemění.
 */
/** Tarif „platba za vůz“ – cena za 30 dní podle ceny vozu (stejně jako na webu). */
const perVehicleBase = (price: number) => (price <= 200000 ? 149 : price <= 700000 ? 249 : 499);

function slotCost(plan: Plan, v: Vehicle, now: Date, inAuction: boolean) {
  if (plan.id === "payg") {
    const month = listingMonth(v.listed_at, now);
    const base = perVehicleBase(v.price);
    const progression = inAuction ? 0 : Math.round(base * (progressionFactor(month) - 1));
    // u platby za vůz se celý poplatek účtuje jako položka vozu (surcharge = základ)
    return {
      vehicle_id: v.id,
      label: `${v.brand} ${v.model}`,
      month,
      progression,
      surcharge: base,
    };
  }
  const perSlot = Math.round(plan.monthly_price / plan.slots);
  const month = listingMonth(v.listed_at, now);
  const progression = inAuction ? 0 : Math.round(perSlot * (progressionFactor(month) - 1)); // aukce = odpuštění
  const overLimit = plan.max_vehicle_price !== null && v.price > plan.max_vehicle_price;
  const surcharge = overLimit ? Math.max(0, plan.top_tier_listing_price - perSlot) : 0;
  return { vehicle_id: v.id, label: `${v.brand} ${v.model}`, month, progression, surcharge };
}

async function daily(now: Date) {
  const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  const { data: subs, error } = await supabase
    .from("tenant_subscriptions")
    .select("tenant_id, plan:subscription_plans(*), tenant:tenants(id, name, email)")
    .is("ends_at", null);
  if (error) throw error;

  let tenants = 0;
  for (const s of subs ?? []) {
    const plan = s.plan as unknown as Plan;
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, tenant_id, brand, model, price, listed_at, status")
      .eq("tenant_id", s.tenant_id)
      .in("status", ["active", "in_auction"]);

    const lines = (vehicles ?? []).map((v) =>
      slotCost(plan, v as Vehicle, now, v.status === "in_auction"),
    );
    // Koncept faktury za běžný měsíc se každý den přepočítá z aktuálního stavu slotů.
    const extras = lines.reduce((sum, l) => sum + l.progression + l.surcharge, 0);
    await supabase.from("invoices").upsert(
      {
        tenant_id: s.tenant_id,
        period,
        status: "draft",
        base_amount: plan.monthly_price,
        extras_amount: extras,
        lines,
      },
      { onConflict: "tenant_id,period" },
    );

    const stale = lines.filter((l) => l.month >= 4);
    const tenant = s.tenant as unknown as { name: string; email: string };
    if (stale.length && Deno.env.get("RESEND_API_KEY")) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Drivio <upozorneni@drivio.cz>",
          to: tenant.email,
          subject: `${stale.length} ${stale.length === 1 ? "vůz je" : "vozy jsou"} na Drivio déle než 3 měsíce`,
          html: `<p>Dobrý den,</p><p>tyto vozy mají sazbu slotu +100 %: ${stale.map((l) => l.label).join(", ")}.</p>
                 <p>Přesuňte je do <a href="https://drivio.cz/dashboard/vozy">aukce od 1 Kč</a> – navýšení za tento měsíc odpustíme.</p>`,
        }),
      });
    }
    tenants++;
  }
  return { tenants, period };
}

async function issue(now: Date) {
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    .toISOString()
    .slice(0, 10);
  const { data: drafts } = await supabase
    .from("invoices")
    .select("id, base_amount, extras_amount, lines, tenant:tenants(fakturoid_subject_id)")
    .eq("period", prev)
    .eq("status", "draft");

  const token = Deno.env.get("FAKTUROID_ACCESS_TOKEN");
  const slug = Deno.env.get("FAKTUROID_SLUG");
  let issued = 0;
  for (const inv of drafts ?? []) {
    const subject = (inv.tenant as unknown as { fakturoid_subject_id: number | null })
      .fakturoid_subject_id;
    if (!token || !slug || !subject) continue;
    const res = await fetch(`https://app.fakturoid.cz/api/v3/accounts/${slug}/invoices.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Drivio (fakturace@drivio.cz)",
      },
      body: JSON.stringify({
        subject_id: subject,
        custom_id: inv.id,
        lines: [
          {
            name: "Předplatné – sloty digitální garáže",
            quantity: 1,
            unit_price: inv.base_amount,
            vat_rate: 21,
          },
          ...(inv.lines as { label: string; progression: number; surcharge: number }[])
            .filter((l) => l.progression + l.surcharge > 0)
            .map((l) => ({
              name: `Slot: ${l.label} (progrese/doplatek)`,
              quantity: 1,
              unit_price: l.progression + l.surcharge,
              vat_rate: 21,
            })),
        ],
      }),
    });
    if (!res.ok) continue;
    const f = await res.json();
    await supabase
      .from("invoices")
      .update({ status: "issued", fakturoid_id: f.id, fakturoid_number: f.number })
      .eq("id", inv.id);
    issued++;
  }
  return { issued, period: prev };
}

Deno.serve(async (req) => {
  // Jen server-to-server volání se service role klíčem.
  if (req.headers.get("Authorization") !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { mode = "daily" } = await req.json().catch(() => ({}));
  const now = new Date();
  try {
    const result = mode === "issue" ? await issue(now) : await daily(now);
    return Response.json({ ok: true, mode, ...result });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
});
