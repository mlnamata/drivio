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
| `/aukce` – jedna stránka: živé aukce, galerie vozů čekajících na aukci, moje příhozy, výsledky | | |
| `/aukce/:id` – registrace dražitele, auto-příhoz, anti-sniping, upozornění na start | | |
| `/leasing/firmy` – operativní leasing pro firmy (ceny bez DPH, poptávka flotily) | | |
| `/porovnani` – porovnání až 4 vozů (cena, rok, nájezd, historie, výbava); interní vyhodnocení vidí jen admin | | |
| `/prodat-auto` – fyzická osoba: 1 inzerát zdarma; firma: platba za vůz nebo balíček | | |
| `/financovani`, `/hlidaci-pes`, `/oblibene`, `/prihlaseni` | | |

**Ukázkový režim:** bez nastaveného Supabase běží web nad daty v `src/lib/mock-data.ts` a akce
(přidání vozu, prodej, aukce, příhozy, hlídací pes, změna ceny) se ukládají do `localStorage`
(`src/lib/store.ts`), takže je vše proklikatelné a navzájem propojené.

## Obchodní model inzerce

- **Fyzická osoba:** 1 aktivní inzerát zdarma na účet (vynuceno i DB triggerem).
- **Firma / autobazar:** buď **platba za vůz** (149 / 249 / 499 Kč za 30 dní podle ceny vozu),
  nebo **předplatné balíčku slotů** (990 / 2 490 / 1 990 Kč měsíčně). V obou případech platí
  časová progrese (+50 % 2. měsíc, +100 % od 3. měsíce) a možnost přesunu do aukce.

## Před spuštěním zkontrolovat

- Recenze na úvodu (`src/components/trust.tsx`) jsou **ukázkové** a označené štítkem „Ukázka“ –
  nahraďte je skutečnými, zveřejnit vymyšlené recenze je protiprávní.
- Ceny v ceníku reklamy, nabídky leasingu a sazby partnerů jsou ukázkové – doplnit dle smluv.
- Fotky vozů v ukázkových datech se načítají z Unsplash; ostré inzeráty nahrávají prodejci.
- Doplnit IČO a údaje provozovatele do právních stránek, texty nechat zkontrolovat advokátem.

## Spuštění do produkce

Web má dva režimy. **Ukázkový** (bez proměnných Supabase) běží nad daty v `src/lib/mock-data.ts`
a akce ukládá jen do prohlížeče. **Ostrý** se zapne nastavením proměnných Supabase – pak se
ukázková data nepoužijí vůbec, web čte a zapisuje databázi (`src/lib/remote.ts`) a administrace
vyžaduje přihlášení.

1. Založit Supabase projekt v regionu **eu-central-1 (Frankfurt)** a spustit obě migrace
   z `supabase/migrations/` (schéma + RLS + triggery, úložiště fotek).
2. Do Vaultu uložit `project_url` a `service_role_key` (pro pg_cron → Edge Function).
3. Nasadit Edge Function: `supabase functions deploy billing-processor`.
4. Proměnné prostředí:
   - web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
   - server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FAKTUROID_WEBHOOK_SECRET`,
     `RESEND_API_KEY` a `CONTACT_EMAIL` (kam chodí zprávy z kontaktního formuláře a poptávky reklamy)
   - Edge Function: `RESEND_API_KEY`, `FAKTUROID_ACCESS_TOKEN`, `FAKTUROID_SLUG`
   - reklama (volitelné): `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_LEADERBOARD`,
     `VITE_ADSENSE_SLOT_RECTANGLE`, `VITE_ADSENSE_SLOT_INFEED`
5. **Správce portálu:** zaregistrovat se na webu a v tabulce `users` nastavit
   `is_platform_admin = true`. Autobazar se registruje sám (Přihlásit → Autobazar → IČO); databáze
   mu automaticky založí firmu s tarifem „platba za vůz“.
6. Resend: nastavit SPF, DKIM a DMARC pro doménu drivio.cz. V Supabase Auth nastavit
   přesměrování na `https://drivio.cz/prihlaseni`.
7. Nabídky leasingu vložit do `leasing_partners` a `leasing_offers` (ručně nebo API partnera).

Otestováno na PostgreSQL 16: kapacita slotů, limit 1 soukromého inzerátu, RLS izolace
autobazarů, registrace autobazaru, změna tarifu jen vlastníkem, 40 souběžných příhozů.

**Známé omezení:** v ostrém režimu se výpis a detail vozů vykreslují až v prohlížeči (po načtení
z databáze), vyhledávače tak dostanou jen základní obsah. Dalším krokem je načítání dat už na
serveru (SSR loadery).

## Vývoj

```sh
bun install
bun run dev
```
