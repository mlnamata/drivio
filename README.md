# Drivio

Portál s ojetými auty od prověřených autobazarů (drivio.cz) – TanStack Start + React 19 + Tailwind v4, backend Supabase.
Projekt je napojený na [Lovable](https://lovable.dev/projects/8a75518a-56e0-427d-81c0-d9ff92c09b71).

## Struktura webu

Logo: `public/brand/drivio-logo-original.png` (originál), `drivio-logo.webp` (průhledné, pro světlá pozadí),
plochá verze pro tmavé plochy je komponenta `LogoFlat`. Barvy: grafitová `#1f1e1d` + oranžová `#ea7930`.

| Zákazníci (hlavička) | Klienti a partneři (patička) | Administrace |
| --- | --- | --- |
| `/` – vyhledávání ve stylu sauto.cz, značky, karoserie, TOP nabídky | `/pro-autobazary`, `/cenik` | `/dashboard` – autobazar: vozy, přidání přes VIN, aukce, poptávky, faktury, předplatné |
| `/inzeraty` – filtry v URL (vč. Cebia, hodnocení ceny, prodejce, původ, dveře/místa), hlídací pes, reklama ve výpisu | `/pro-leasingove-spolecnosti` | `/admin` – správa portálu: autobazary, moderace, aukce, leady, fakturace, pg_cron |
| `/inzerat/:id` – detail, Cebia, hodnocení ceny, kontakt, kalkulačka splátek | `/reklama` – formáty a ceník pro inzerenty | `/api/webhooks/fakturoid` – webhook úhrad (HMAC + idempotence) |
| `/leasing`, `/leasing/:id` – operativní leasing (styl Driveto), konfigurátor, poptávka | `/pravni/*`, `/kontakt` | |
| `/aukce`, `/aukce/:id` – dražby od 1 Kč, registrace dražitele, auto-příhoz, anti-sniping | | |
| `/prodat-auto` – soukromá osoba: 1 inzerát zdarma na účet | | |
| `/financovani`, `/hlidaci-pes`, `/oblibene`, `/prihlaseni` | | |

**Ukázkový režim:** bez nastaveného Supabase běží web nad daty v `src/lib/mock-data.ts` a akce
(přidání vozu, prodej, aukce, příhozy, hlídací pes, změna ceny) se ukládají do `localStorage`
(`src/lib/store.ts`), takže je vše proklikatelné a navzájem propojené.

## Spuštění do produkce

1. Supabase projekt v regionu **eu-central-1 (Frankfurt)**, spustit `supabase/migrations/*.sql`.
2. Do Vaultu uložit `project_url` a `service_role_key` (používá pg_cron → `invoke_edge_function`).
3. Nasadit Edge Function `supabase functions deploy billing-processor`.
4. Proměnné prostředí:
   - web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
   - reklama (volitelné): `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_LEADERBOARD`, `VITE_ADSENSE_SLOT_RECTANGLE`,
     `VITE_ADSENSE_SLOT_INFEED` – bez nich se na plochách zobrazuje nabídka „Zde může být vaše reklama“
   - server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FAKTUROID_WEBHOOK_SECRET`
   - Edge Function: `RESEND_API_KEY`, `FAKTUROID_ACCESS_TOKEN`, `FAKTUROID_SLUG`
5. Resend: nastavit SPF, DKIM a DMARC pro doménu drivio.cz.
   Migrace je otestovaná na PostgreSQL 16: kapacita slotů, limit 1 soukromého inzerátu, RLS izolace
   autobazarů a 40 souběžných příhozů (přijat právě jeden, stav aukce konzistentní).
6. Doplnit IČO a údaje provozovatele v `src/routes/pravni/*` a nechat texty zkontrolovat advokátem.

Loga značek v `public/brands` pochází z [filippofilip95/car-logos-dataset](https://github.com/filippofilip95/car-logos-dataset) a slouží pouze k označení značky vozu.

## Vývoj

```sh
bun install
bun run dev
```
