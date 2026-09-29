import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

async function insert(table: string, row: Record<string, unknown>) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) return; // ukázkový režim – nic se neukládá
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error("Uložení se nezdařilo");
}

/** Upozornění provozovateli e-mailem (Resend), pokud je nastaven. */
async function notify(subject: string, text: string, replyTo?: string) {
  const key = process.env["RESEND_API_KEY"];
  const to = process.env["CONTACT_EMAIL"];
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Drivio <web@drivio.cz>",
      to,
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  }).catch(() => undefined);
}

const contactSchema = z.object({
  kind: z.enum(["contact", "advertising", "report"]),
  vehicleId: z.string().max(80).optional(),
  topic: z.string().max(120).optional(),
  company: z.string().max(200).optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  budget: z.string().max(120).optional(),
  message: z.string().trim().max(5000).optional(),
  // honeypot proti spamu – skryté pole musí zůstat prázdné
  website: z.string().max(0).optional(),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof contactSchema>) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { website: _hp, ...row } = data;
    const { vehicleId, ...rest } = row;
    await insert("contact_messages", {
      ...rest,
      vehicle_id: vehicleId ?? null,
      ip: getRequestIP({ xForwardedFor: true }) ?? null,
    });
    await notify(
      data.kind === "advertising"
        ? `Poptávka reklamy: ${data.company ?? data.name}`
        : `Kontakt: ${data.topic ?? ""}`,
      `${data.name} <${data.email}>\n${data.company ?? ""} ${data.budget ?? ""}\n\n${data.message ?? ""}`,
      data.email,
    );
    return { ok: true as const };
  });

const watchdogSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  criteria: z.record(z.unknown()),
});

export const submitWatchdog = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof watchdogSchema>) => watchdogSchema.parse(d))
  .handler(async ({ data }) => {
    await insert("saved_searches", { name: data.name, email: data.email, criteria: data.criteria });
    return { ok: true as const };
  });
