-- =====================================================================
-- Drivio – základní schéma (PostgreSQL 15+, Supabase, region eu-central-1)
-- =====================================================================
create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create type public.member_role as enum ('owner', 'admin', 'seller');
create type public.vehicle_status as enum ('draft', 'active', 'in_auction', 'sold', 'archived');
create type public.auction_status as enum ('scheduled', 'live', 'ended', 'cancelled');
create type public.lead_kind as enum ('financing', 'dealer_contact', 'leasing');
create type public.lead_status as enum ('new', 'sent', 'replied', 'approved', 'rejected', 'funded', 'anonymized');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'overdue', 'cancelled');

-- ---------------------------------------------------------------- users
-- auth.users spravuje Supabase Auth; profil je 1:1.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  is_platform_admin boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- tenants (autobazary)
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ico char(8) not null unique check (ico ~ '^[0-9]{8}$'),
  dic text,
  street text,
  city text not null,
  region text not null,
  phone text,
  email text not null,
  fakturoid_subject_id bigint,
  rating numeric(2, 1),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tenant_members (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.member_role not null default 'seller',
  primary key (tenant_id, user_id)
);
create index on public.tenant_members (user_id);

-- Pomocné funkce pro RLS (security definer + stabilní => plánovač je volá jednou).
create or replace function public.my_tenant_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select tenant_id from public.tenant_members where user_id = (select auth.uid())
$$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_platform_admin from public.users where id = (select auth.uid())), false)
$$;

-- ---------------------------------------------------------------- předplatné
create table public.subscription_plans (
  id text primary key,                        -- 'economy' | 'standard' | 'premium'
  name text not null,
  monthly_price integer not null check (monthly_price >= 0),     -- Kč bez DPH
  slots integer not null check (slots > 0),
  max_vehicle_price integer,                  -- null = bez limitu
  top_tier_listing_price integer not null default 499,
  active boolean not null default true
);

insert into public.subscription_plans (id, name, monthly_price, slots, max_vehicle_price) values
  ('economy', 'Garáž ECONOMY 10', 990, 10, 200000),
  ('standard', 'Garáž STANDARD 15', 2490, 15, 700000),
  ('premium', 'Garáž PREMIUM 5', 1990, 5, null),
  -- bez předplatného: platba za každý vůz (149/249/499 Kč za 30 dní dle ceny vozu)
  ('payg', 'Platba za vůz', 0, 999, null);

create table public.tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  plan_id text not null references public.subscription_plans (id),
  starts_at date not null default current_date,
  ends_at date,
  created_at timestamptz not null default now()
);
create unique index tenant_subscriptions_one_active
  on public.tenant_subscriptions (tenant_id) where ends_at is null;

-- ---------------------------------------------------------------- vozy
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  -- autobazar (tenant) NEBO soukromá osoba (owner_user_id)
  tenant_id uuid references public.tenants (id) on delete cascade,
  owner_user_id uuid references public.users (id) on delete cascade,
  seller_name text,
  seller_phone text,
  seller_city text,
  seller_region text,
  paid_until timestamptz,                     -- placený další soukromý inzerát
  subscription_id uuid references public.tenant_subscriptions (id),
  status public.vehicle_status not null default 'draft',
  vin char(17) not null check (vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  brand text not null,
  model text not null,
  trim text,
  category text not null default 'osobni',
  body text not null,
  year smallint not null check (year between 1950 and 2100),
  km integer not null check (km >= 0),
  fuel text not null,
  gearbox text not null,
  drive text,
  power_kw smallint,
  engine_ccm smallint,
  color text,
  price integer not null check (price > 0),
  vat_deductible boolean not null default false,
  equipment text[] not null default '{}',
  photos text[] not null default '{}',
  description text,
  service_book boolean,
  first_owner boolean,
  accident_free boolean,
  vin_report jsonb,                           -- výstup Cebia / carVertical
  listed_at timestamptz,                      -- začátek počítání progrese
  sold_at timestamptz,
  sold_price integer,
  cebia_verified boolean not null default false,
  is_top boolean not null default false,
  doors smallint,
  seats smallint,
  origin text check (origin in ('cz', 'import')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((tenant_id is not null) <> (owner_user_id is not null))
);
create index vehicles_owner on public.vehicles (owner_user_id) where owner_user_id is not null;
create index vehicles_search on public.vehicles (status, brand, model, price);
create index vehicles_tenant on public.vehicles (tenant_id, status);
create index vehicles_listed on public.vehicles (listed_at) where status = 'active';

-- Kapacita slotů: nelze aktivovat víc vozů, než má balíček slotů.
create or replace function public.enforce_slot_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_slots int; v_used int;
begin
  if new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from 'active')
     and new.tenant_id is null then
    -- Soukromá osoba: 1 aktivní inzerát zdarma na účet, další jen placený.
    select count(*) into v_used from public.vehicles
     where owner_user_id = new.owner_user_id and tenant_id is null
       and status in ('active', 'in_auction') and id <> new.id
       and (paid_until is null or paid_until < now());
    if v_used >= 1 and (new.paid_until is null or new.paid_until < now()) then
      raise exception 'Soukromá osoba může mít zdarma 1 aktivní inzerát';
    end if;
    new.listed_at := coalesce(new.listed_at, now());
  elsif new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from 'active') then
    select p.slots into v_slots
      from public.tenant_subscriptions s join public.subscription_plans p on p.id = s.plan_id
     where s.tenant_id = new.tenant_id and s.ends_at is null;
    if v_slots is null then raise exception 'Autobazar nemá aktivní předplatné'; end if;
    select count(*) into v_used from public.vehicles
     where tenant_id = new.tenant_id and status = 'active' and id <> new.id;
    if v_used >= v_slots then raise exception 'Všechny sloty jsou obsazené (%/%)', v_used, v_slots; end if;
    new.listed_at := coalesce(new.listed_at, now());
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger vehicles_slot_capacity before insert or update on public.vehicles
  for each row execute function public.enforce_slot_capacity();

-- ---------------------------------------------------------------- aukce
create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null unique references public.vehicles (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  status public.auction_status not null default 'scheduled',
  start_price integer not null default 1,
  reserve_price integer,
  min_increment integer not null default 500 check (min_increment > 0),
  current_price integer not null default 0,
  bid_count integer not null default 0,
  leader_id uuid references public.users (id),
  buyer_fee_rate numeric(4, 3) not null default 0.04,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index auctions_live on public.auctions (status, ends_at);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  bidder_id uuid not null references public.users (id),
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index bids_auction on public.bids (auction_id, created_at desc);

-- Příhoz: řádek aukce se exkluzivně zamkne (FOR UPDATE), souběžné příhozy čekají ve frontě.
create or replace function public.place_bid(p_auction_id uuid, p_amount integer)
returns table (bid_id uuid, current_price integer, ends_at timestamptz)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  a public.auctions%rowtype;
  v_uid uuid := auth.uid();
  v_min integer;
  v_bid uuid;
begin
  if v_uid is null then raise exception 'Pro příhoz se přihlaste' using errcode = '28000'; end if;

  select * into a from public.auctions where id = p_auction_id for update;
  if not found then raise exception 'Aukce neexistuje'; end if;
  if a.status <> 'live' or now() < a.starts_at or now() >= a.ends_at then
    raise exception 'Aukce neprobíhá';
  end if;
  if exists (select 1 from public.tenant_members m where m.tenant_id = a.tenant_id and m.user_id = v_uid) then
    raise exception 'Prodejce nemůže přihazovat na vlastní vůz';
  end if;

  v_min := case when a.bid_count = 0 then a.start_price else a.current_price + a.min_increment end;
  if p_amount < v_min then
    raise exception 'Minimální příhoz je % Kč', v_min using errcode = '22023';
  end if;

  insert into public.bids (auction_id, bidder_id, amount) values (a.id, v_uid, p_amount)
    returning id into v_bid;

  update public.auctions
     set current_price = p_amount,
         bid_count = bid_count + 1,
         leader_id = v_uid,
         -- anti-sniping: příhoz v posledních 2 min prodlouží aukci o 2 min
         ends_at = case when auctions.ends_at - now() < interval '2 minutes'
                        then now() + interval '2 minutes' else auctions.ends_at end
   where id = a.id
   returning auctions.current_price, auctions.ends_at into current_price, ends_at;

  bid_id := v_bid;
  return next;
end $$;
revoke all on function public.place_bid(uuid, integer) from public, anon;
grant execute on function public.place_bid(uuid, integer) to authenticated;

create or replace function public.close_expired_auctions()
returns integer language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with ended as (
    update public.auctions set status = 'ended'
     where status = 'live' and ends_at <= now()
     returning vehicle_id, leader_id, current_price, reserve_price
  )
  update public.vehicles v
     set status = case when e.leader_id is not null and e.current_price >= coalesce(e.reserve_price, 0)
                       then 'sold'::public.vehicle_status else 'archived'::public.vehicle_status end,
         sold_at = now(), sold_price = e.current_price
    from ended e where v.id = e.vehicle_id;
  get diagnostics n = row_count;
  update public.auctions set status = 'live' where status = 'scheduled' and starts_at <= now();
  return n;
end $$;

-- ---------------------------------------------------------------- leady
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  kind public.lead_kind not null,
  status public.lead_status not null default 'new',
  vehicle_id uuid references public.vehicles (id) on delete set null,
  tenant_id uuid references public.tenants (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  message text,
  requested_amount integer,
  requested_months smallint,
  requested_km_year integer,                  -- operativní leasing: roční nájezd
  offer_ref text,                             -- id nabídky leasingu
  is_business boolean not null default false,
  partner text,                               -- 'essox' | 'homecredit' | 'cofidis'
  partner_reference text,
  partner_response jsonb,
  dispatched_at timestamptz,
  -- doložitelnost souhlasu (GDPR čl. 7)
  consent_text text,
  consent_version text not null,
  consent_at timestamptz not null,
  consent_ip inet,
  user_agent text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  check (kind = 'dealer_contact' or consent_text is not null)
);
create index leads_tenant on public.leads (tenant_id, created_at desc);

-- Doplnění tenanta z vozu, aby autobazar viděl své poptávky.
create or replace function public.leads_fill_tenant()
returns trigger language plpgsql as $$
begin
  if new.tenant_id is null and new.vehicle_id is not null then
    select tenant_id into new.tenant_id from public.vehicles where id = new.vehicle_id;
  end if;
  return new;
end $$;
create trigger leads_fill_tenant before insert on public.leads
  for each row execute function public.leads_fill_tenant();

create or replace function public.anonymize_expired_leads()
returns integer language sql security definer set search_path = public as $$
  with u as (
    update public.leads
       set full_name = 'anonymizováno', email = 'anon+' || id || '@drivio.invalid', phone = '000000000',
           message = null, consent_ip = null, user_agent = null, partner_response = null, status = 'anonymized'
     where status <> 'anonymized' and created_at < now() - interval '12 months'
     returning 1)
  select count(*)::int from u
$$;

-- ---------------------------------------------------------------- fakturace
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  period date not null,                       -- první den zúčtovacího měsíce
  status public.invoice_status not null default 'draft',
  base_amount integer not null,
  extras_amount integer not null default 0,
  lines jsonb not null default '[]',
  fakturoid_id bigint unique,
  fakturoid_number text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, period)
);

create or replace function public.mark_invoice_paid(p_fakturoid_id bigint)
returns void language sql security definer set search_path = public as $$
  update public.invoices set status = 'paid', paid_at = coalesce(paid_at, now())
   where fakturoid_id = p_fakturoid_id
$$;
revoke all on function public.mark_invoice_paid(bigint) from public, anon, authenticated;

create table public.webhook_events (
  provider text not null,
  event_id text not null,
  event_name text,
  payload jsonb,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)            -- idempotence: duplicita => 409
);

create table public.favorites (
  user_id uuid not null references public.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

-- ---------------------------------------------------------------- operativní leasing
create table public.leasing_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ico char(8) unique,
  leads_endpoint text,                        -- kam posíláme poptávky (HMAC podepsané)
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leasing_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.leasing_partners (id) on delete cascade,
  external_id text,                           -- ID nabídky v systému partnera (API import)
  brand text not null,
  model text not null,
  trim text,
  body text,
  fuel text,
  gearbox text,
  power_kw smallint,
  condition text not null default 'nove' check (condition in ('nove', 'ojete')),
  base_monthly integer not null check (base_monthly > 0),   -- vč. DPH, 48 měs., 20 000 km/rok
  price_matrix jsonb,                         -- volitelně přesné ceny {"36":{"15000":9990,...}}
  in_stock boolean not null default false,
  delivery_days smallint,
  photos text[] not null default '{}',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (partner_id, external_id)
);
create index leasing_offers_active on public.leasing_offers (active, brand, base_monthly);

-- ---------------------------------------------------------------- hlídací pes
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  email text not null,
  name text not null,
  criteria jsonb not null,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- zprávy z formulářů
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'advertising', 'report')),
  vehicle_id uuid references public.vehicles (id) on delete set null,
  topic text,
  company text,
  name text not null,
  email text not null,
  budget text,
  message text,
  ip inet,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- registrace
-- Nový účet → profil; registrace autobazaru (account_type = dealer + IČO) → tenant,
-- vlastník a výchozí tarif „platba za vůz“.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_tenant uuid;
begin
  insert into public.users (id, full_name) values (new.id, meta ->> 'full_name')
  on conflict (id) do nothing;
  if meta ->> 'account_type' = 'dealer' and (meta ->> 'ico') ~ '^[0-9]{8}$' then
    insert into public.tenants (name, ico, city, region, email)
    values (coalesce(nullif(meta ->> 'company_name', ''), 'Autobazar'), meta ->> 'ico', '', '', new.email)
    on conflict (ico) do nothing
    returning id into v_tenant;
    if v_tenant is not null then
      insert into public.tenant_members (tenant_id, user_id, role) values (v_tenant, new.id, 'owner');
      insert into public.tenant_subscriptions (tenant_id, plan_id) values (v_tenant, 'payg');
    end if;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Změna tarifu autobazaru (vlastník / správce). Nový tarif platí hned.
create or replace function public.change_plan(p_tenant_id uuid, p_plan_id text)
returns void language plpgsql security definer set search_path = public as $$
declare v_slots int; v_used int;
begin
  if not (public.is_platform_admin() or exists (
    select 1 from public.tenant_members
     where tenant_id = p_tenant_id and user_id = auth.uid() and role in ('owner', 'admin'))) then
    raise exception 'Tarif může změnit jen vlastník autobazaru';
  end if;
  select slots into v_slots from public.subscription_plans where id = p_plan_id and active;
  if v_slots is null then raise exception 'Neznámý tarif'; end if;
  select count(*) into v_used from public.vehicles
   where tenant_id = p_tenant_id and status in ('active', 'in_auction');
  if v_used > v_slots then
    raise exception 'Tarif má jen % slotů, aktivních vozů je %', v_slots, v_used;
  end if;
  update public.tenant_subscriptions set ends_at = current_date
   where tenant_id = p_tenant_id and ends_at is null;
  insert into public.tenant_subscriptions (tenant_id, plan_id) values (p_tenant_id, p_plan_id);
end $$;
revoke all on function public.change_plan(uuid, text) from public, anon;
grant execute on function public.change_plan(uuid, text) to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.users enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.tenant_subscriptions enable row level security;
alter table public.vehicles enable row level security;
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
alter table public.leads enable row level security;
alter table public.invoices enable row level security;
alter table public.webhook_events enable row level security;  -- bez politik = jen service role
alter table public.favorites enable row level security;
alter table public.leasing_partners enable row level security;
alter table public.leasing_offers enable row level security;
alter table public.saved_searches enable row level security;
alter table public.contact_messages enable row level security;  -- jen service role

create policy users_self on public.users for all
  using (id = (select auth.uid()) or (select public.is_platform_admin()))
  with check (id = (select auth.uid()) or (select public.is_platform_admin()));

create policy tenants_public_read on public.tenants for select using (true);
create policy tenants_member_update on public.tenants for update
  using (id in (select public.my_tenant_ids()) or (select public.is_platform_admin()));

create policy members_read on public.tenant_members for select
  using (tenant_id in (select public.my_tenant_ids()) or (select public.is_platform_admin()));

create policy plans_public_read on public.subscription_plans for select using (active);

create policy subs_member_read on public.tenant_subscriptions for select
  using (tenant_id in (select public.my_tenant_ids()) or (select public.is_platform_admin()));

-- Inzeráty: veřejně jen aktivní/aukce; autobazar spravuje jen své.
create policy vehicles_public_read on public.vehicles for select
  using (status in ('active', 'in_auction') or tenant_id in (select public.my_tenant_ids())
         or owner_user_id = (select auth.uid()) or (select public.is_platform_admin()));
create policy vehicles_member_write on public.vehicles for insert
  with check (tenant_id in (select public.my_tenant_ids())
              or (tenant_id is null and owner_user_id = (select auth.uid())));
create policy vehicles_member_update on public.vehicles for update
  using (tenant_id in (select public.my_tenant_ids()) or owner_user_id = (select auth.uid())
         or (select public.is_platform_admin()))
  with check (tenant_id in (select public.my_tenant_ids()) or owner_user_id = (select auth.uid())
              or (select public.is_platform_admin()));
create policy vehicles_member_delete on public.vehicles for delete
  using (tenant_id in (select public.my_tenant_ids()) or owner_user_id = (select auth.uid()));

create policy auctions_public_read on public.auctions for select using (true);
create policy auctions_member_insert on public.auctions for insert
  with check (tenant_id in (select public.my_tenant_ids()));

-- Příhozy jsou veřejné pro čtení (historie); zápis výhradně přes RPC place_bid.
create policy bids_public_read on public.bids for select using (true);

create policy leads_member_read on public.leads for select
  using (tenant_id in (select public.my_tenant_ids()) or user_id = (select auth.uid()) or (select public.is_platform_admin()));
create policy leads_member_update on public.leads for update
  using (tenant_id in (select public.my_tenant_ids()));

create policy invoices_member_read on public.invoices for select
  using (tenant_id in (select public.my_tenant_ids()) or (select public.is_platform_admin()));

create policy favorites_own on public.favorites for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Nabídky leasingu jsou veřejné; zápis jen service role (API import partnerů).
create policy leasing_partners_public_read on public.leasing_partners for select using (active);
create policy leasing_offers_public_read on public.leasing_offers for select using (active);

create policy saved_searches_own on public.saved_searches for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Realtime pro živé aukce a nové inzeráty
alter publication supabase_realtime add table public.bids, public.auctions, public.vehicles;

-- =====================================================================
-- pg_cron – plánovač; těžká logika v Edge Functions (volání přes pg_net)
-- Klíč se čte z Vaultu:  select vault.create_secret('<service_role_key>', 'service_role_key');
--                        select vault.create_secret('https://<ref>.supabase.co', 'project_url');
-- =====================================================================
create or replace function public.invoke_edge_function(p_name text, p_body jsonb default '{}')
returns bigint language sql security definer set search_path = public as $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/' || p_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := p_body,
    timeout_milliseconds := 120000
  )
$$;
revoke all on function public.invoke_edge_function(text, jsonb) from public, anon, authenticated;

-- Časy v UTC (00:05 UTC = 01:05/02:05 v ČR).
select cron.schedule('drivio-billing-daily', '5 0 * * *', $$ select public.invoke_edge_function('billing-processor', '{"mode":"daily"}') $$);
select cron.schedule('drivio-invoice-monthly', '0 3 1 * *', $$ select public.invoke_edge_function('billing-processor', '{"mode":"issue"}') $$);
select cron.schedule('drivio-auction-close', '* * * * *', $$ select public.close_expired_auctions() $$);
select cron.schedule('drivio-gdpr-anonymize', '30 2 * * 0', $$ select public.anonymize_expired_leads() $$);
