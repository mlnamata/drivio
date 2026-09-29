import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Webhook Fakturoidu (invoice_paid). Bezpečnostní pořadí:
 * 1) request.text() – surové tělo PŘED jakýmkoli parsováním (jinak nesedí HMAC),
 * 2) HMAC SHA-256 + porovnání v konstantním čase,
 * 3) idempotence přes unikátní ID události v tabulce webhook_events,
 * 4) rychlá odpověď 200; těžká práce běží asynchronně (DB trigger / Edge Function).
 */

const MAX_BODY = 256 * 1024;

function verify(raw: string, header: string | null, secret: string) {
  if (!header) return false;
  const received = header.replace(/^sha256=/, "").trim();
  const expected = createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const a = Buffer.from(received, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

type FakturoidEvent = {
  event_name: string;
  webhook_id?: string | number;
  body?: { invoice?: { id: number; number: string; total: string; custom_id?: string } };
};

export const Route = createFileRoute("/api/webhooks/fakturoid")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["FAKTUROID_WEBHOOK_SECRET"];
        const supabaseUrl = process.env["SUPABASE_URL"];
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!secret || !supabaseUrl || !serviceKey) {
          return new Response("Webhook not configured", { status: 503 });
        }

        const raw = await request.text();
        if (raw.length > MAX_BODY) return new Response("Payload too large", { status: 413 });

        const signature =
          request.headers.get("x-fakturoid-signature") ?? request.headers.get("x-signature");
        if (!verify(raw, signature, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: FakturoidEvent;
        try {
          event = JSON.parse(raw) as FakturoidEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const eventId =
          request.headers.get("x-webhook-id") ??
          String(event.webhook_id ?? `${event.event_name}:${event.body?.invoice?.id ?? "?"}`);

        const headers = {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        };

        // Idempotence: INSERT s unikátním klíčem; duplicita (409) = již zpracováno → 200.
        const ins = await fetch(`${supabaseUrl}/rest/v1/webhook_events`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({
            provider: "fakturoid",
            event_id: eventId,
            event_name: event.event_name,
            payload: event,
          }),
        });
        if (ins.status === 409) return Response.json({ ok: true, duplicate: true });
        if (!ins.ok) return new Response("Storage error", { status: 500 });

        if (event.event_name === "invoice_paid" && event.body?.invoice) {
          // RPC je rychlé (jeden UPDATE); vše ostatní (e-maily, aktivace) obstarají triggery asynchronně.
          await fetch(`${supabaseUrl}/rest/v1/rpc/mark_invoice_paid`, {
            method: "POST",
            headers,
            body: JSON.stringify({ p_fakturoid_id: event.body.invoice.id }),
          });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
