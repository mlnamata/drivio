# Drivio

Portál s ojetými auty od prověřených autobazarů (drivio.cz) – TanStack Start + React 19 + Tailwind v4, backend Supabase.
Projekt je napojený na [Lovable](https://lovable.dev/projects/8a75518a-56e0-427d-81c0-d9ff92c09b71).

## Struktura webu

| Pro zákazníky (hlavička) | Pro klienty (patička) | Administrace |
| --- | --- | --- |
| `/` úvod s rychlým hledáním, značkami a karoseriemi | `/pro-autobazary`, `/cenik` | `/dashboard` – autobazar (vozy, přidání přes VIN, aukce, poptávky, faktury, předplatné, nastavení) |
| `/inzeraty` – výpis s kompletními filtry v URL | `/pro-leasingove-spolecnosti` | `/admin` – správa portálu (autobazary, moderace, aukce, leady, fakturace, pg_cron, nastavení) |
| `/inzerat/:id` – detail, kalkulačka splátek, kontakt | `/pravni/*` – VOP, GDPR, cookies | `/api/webhooks/fakturoid` – webhook úhrad (HMAC + idempotence) |
| `/aukce`, `/aukce/:id` – živé aukce od 1 Kč | `/kontakt` | |
| `/financovani`, `/oblibene`, `/prihlaseni` | | |

Bez nastaveného Supabase běží web nad ukázkovými daty (`src/lib/mock-data.ts`).

## Spuštění do produkce

1. Supabase projekt v regionu **eu-central-1 (Frankfurt)**, spustit `supabase/migrations/*.sql`.
2. Do Vaultu uložit `project_url` a `service_role_key` (používá pg_cron → `invoke_edge_function`).
3. Nasadit Edge Function `supabase functions deploy billing-processor`.
4. Proměnné prostředí:
   - web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
   - server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FAKTUROID_WEBHOOK_SECRET`
   - Edge Function: `RESEND_API_KEY`, `FAKTUROID_ACCESS_TOKEN`, `FAKTUROID_SLUG`
5. Resend: nastavit SPF, DKIM a DMARC pro doménu drivio.cz.
6. Doplnit IČO a údaje provozovatele v `src/routes/pravni/*` a nechat texty zkontrolovat advokátem.

Loga značek v `public/brands` pochází z [filippofilip95/car-logos-dataset](https://github.com/filippofilip95/car-logos-dataset) a slouží pouze k označení značky vozu.

## Vývoj

```sh
bun install
bun run dev
```
