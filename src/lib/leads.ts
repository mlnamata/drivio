import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

/** Verze textu souhlasu – ukládá se k leadu kvůli prokazatelnosti (GDPR čl. 7). */
export const CONSENT_VERSION = "2026-09-v1";
export const CONSENT_TEXT =
  "Souhlasím se zpracováním osobních údajů a jejich předáním vybraným finančním partnerům (Essox, Home Credit, Cofidis) za účelem zpracování nabídky financování.";

export const leadSchema = z.object({
  kind: z.enum(["financing", "dealer_contact"]),
  vehicleId: z.string().optional(),
  name: z.string().trim().min(2, "Vyplňte jméno").max(120),
  email: z.string().trim().email("Neplatný e-mail"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{9,16}$/, "Neplatné telefonní číslo"),
  message: z.string().max(2000).optional(),
  amount: z.number().int().min(0).max(20_000_000).optional(),
  months: z.number().int().min(12).max(120).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Bez souhlasu nelze pokračovat" }) }),
  marketing: z.boolean().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Uloží lead. Po napojení Supabase: insert do `public.leads` přes service role
 * a DB trigger / Edge Function `lead-dispatch` jej předá partnerovi (viz supabase/).
 */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: LeadInput) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    const record = {
      ...data,
      consent_text: data.kind === "financing" ? CONSENT_TEXT : null,
      consent_version: CONSENT_VERSION,
      consent_at: new Date().toISOString(),
      consent_ip: getRequestIP({ xForwardedFor: true }) ?? null,
      user_agent: getRequestHeader("user-agent") ?? null,
    };

    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/leads`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          kind: record.kind,
          vehicle_id: record.vehicleId ?? null,
          full_name: record.name,
          email: record.email,
          phone: record.phone,
          message: record.message ?? null,
          requested_amount: record.amount ?? null,
          requested_months: record.months ?? null,
          consent_text: record.consent_text,
          consent_version: record.consent_version,
          consent_at: record.consent_at,
          consent_ip: record.consent_ip,
          marketing_consent: record.marketing ?? false,
          user_agent: record.user_agent,
        }),
      });
      if (!res.ok) throw new Error("Lead se nepodařilo uložit");
    }
    return { ok: true as const };
  });
