/**
 * Napojení na Supabase. Když jsou nastavené VITE_SUPABASE_URL a VITE_SUPABASE_PUBLISHABLE_KEY,
 * web načte skutečné autobazary, vozy, aukce a nabídky leasingu (nahradí ukázková data)
 * a akce z administrace zapisuje do databáze. Oprávnění hlídá RLS v databázi.
 */
import { leasingOffers, type LeasingOffer } from "./leasing";
import {
  auctions,
  dealers,
  PHOTO_FALLBACK,
  PRIVATE_SELLER,
  vehicles,
  type Auction,
  type Dealer,
  type PlanId,
  type Vehicle,
} from "./mock-data";
import { markRemoteReady, patchStore, setRemote } from "./store";
import { supabase } from "./supabase";

type Row = Record<string, unknown>;
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const numb = (v: unknown, d = 0) => (typeof v === "number" ? v : v == null ? d : Number(v) || d);
const bool = (v: unknown) => v === true;
const minutesUntil = (iso: unknown) =>
  Math.round((new Date(str(iso)).getTime() - Date.now()) / 60_000);
const daysSince = (iso: unknown) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(str(iso)).getTime()) / 86_400_000)) : 0;

function toDealer(t: Row, plan: PlanId): Dealer {
  return {
    id: str(t["id"]),
    name: str(t["name"]),
    city: str(t["city"]),
    region: str(t["region"]),
    phone: str(t["phone"]),
    email: str(t["email"]),
    rating: numb(t["rating"]),
    reviews: 0,
    since: new Date(str(t["created_at"], new Date().toISOString())).getFullYear(),
    plan,
  };
}

function toVehicle(r: Row): Vehicle {
  const status = str(r["status"]);
  const photos = Array.isArray(r["photos"]) ? (r["photos"] as string[]) : [];
  const tenant = r["tenant_id"] ? str(r["tenant_id"]) : PRIVATE_SELLER;
  return {
    id: str(r["id"]),
    brand: str(r["brand"]),
    model: str(r["model"]),
    trim: str(r["trim"]),
    category: str(r["category"]) === "uzitkove" ? "uzitkove" : "osobni",
    body: str(r["body"]),
    year: numb(r["year"]),
    km: numb(r["km"]),
    fuel: str(r["fuel"]),
    gearbox: str(r["gearbox"]),
    drive: str(r["drive"], "predni"),
    powerKw: numb(r["power_kw"]),
    engineCcm: numb(r["engine_ccm"]),
    color: str(r["color"]),
    condition: "ojete",
    price: numb(r["price"]),
    vatDeductible: bool(r["vat_deductible"]),
    equipment: Array.isArray(r["equipment"]) ? (r["equipment"] as string[]) : [],
    photos: photos.length ? photos : [PHOTO_FALLBACK],
    dealerId: tenant,
    listedDays: daysSince(r["listed_at"] ?? r["created_at"]),
    vin: str(r["vin"]),
    serviceBook: bool(r["service_book"]),
    firstOwner: bool(r["first_owner"]),
    accidentFree: bool(r["accident_free"]),
    description: str(r["description"]),
    doors: numb(r["doors"], 5),
    seats: numb(r["seats"], 5),
    origin: str(r["origin"]) === "import" ? "import" : "cz",
    cebiaVerified: bool(r["cebia_verified"]),
    top: bool(r["is_top"]),
    status: status === "sold" ? "sold" : status === "in_auction" ? "in_auction" : "active",
    ...(tenant === PRIVATE_SELLER
      ? {
          privateSeller: {
            name: str(r["seller_name"], "Soukromý prodejce"),
            city: str(r["seller_city"]),
            region: str(r["seller_region"]),
            phone: str(r["seller_phone"]),
          },
        }
      : {}),
  };
}

function toAuction(a: Row): Auction {
  const startsIn = minutesUntil(a["starts_at"]);
  const status = str(a["status"]);
  const reserve = a["reserve_price"];
  return {
    id: str(a["id"]),
    vehicleId: str(a["vehicle_id"]),
    startPrice: numb(a["start_price"], 1),
    currentBid: numb(a["current_price"]),
    bids: numb(a["bid_count"]),
    endsInMinutes: status === "ended" || status === "cancelled" ? -1 : minutesUntil(a["ends_at"]),
    minIncrement: numb(a["min_increment"], 500),
    buyerFeeRate: numb(a["buyer_fee_rate"], 0.04),
    ...(reserve != null ? { reservePrice: numb(reserve) } : {}),
    ...(startsIn > 0 ? { startsInMinutes: startsIn } : {}),
  };
}

function toLeasingOffer(o: Row, partners: Map<string, string>): LeasingOffer {
  const photos = Array.isArray(o["photos"]) ? (o["photos"] as string[]) : [];
  return {
    id: str(o["id"]),
    brand: str(o["brand"]),
    model: str(o["model"]),
    trim: str(o["trim"]),
    body: str(o["body"]),
    fuel: str(o["fuel"]),
    gearbox: str(o["gearbox"]),
    powerKw: numb(o["power_kw"]),
    condition: str(o["condition"]) === "ojete" ? "ojete" : "nove",
    baseMonthly: numb(o["base_monthly"]),
    partner: partners.get(str(o["partner_id"])) ?? "",
    inStock: bool(o["in_stock"]),
    deliveryDays: numb(o["delivery_days"], 30),
    photo: photos[0] ?? PHOTO_FALLBACK,
  };
}

function replace<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

/** Načte data z databáze a nahradí jimi ukázková data. */
export async function syncFromSupabase() {
  if (!supabase) return;
  const [t, subs, v, a, lp, lo] = await Promise.all([
    supabase.from("tenants").select("*"),
    supabase.from("tenant_subscriptions").select("tenant_id, plan_id").is("ends_at", null),
    supabase
      .from("vehicles")
      .select("*")
      .in("status", ["active", "in_auction", "sold", "archived"])
      .order("listed_at", { ascending: false })
      .limit(1000),
    supabase.from("auctions").select("*").order("ends_at").limit(500),
    supabase.from("leasing_partners").select("id, name"),
    supabase.from("leasing_offers").select("*").eq("active", true).limit(500),
  ]);
  const err = [t, subs, v, a, lp, lo].find((r) => r.error)?.error;
  if (err) throw err;

  const planOf = new Map(
    (subs.data ?? []).map((s: Row) => [str(s["tenant_id"]), str(s["plan_id"]) as PlanId]),
  );
  replace(
    dealers,
    (t.data ?? []).map((row: Row) => toDealer(row, planOf.get(str(row["id"])) ?? "payg")),
  );
  const rows = (v.data ?? []) as Row[];
  replace(vehicles, rows.map(toVehicle));
  replace(auctions, ((a.data ?? []) as Row[]).map(toAuction));
  const partners = new Map(((lp.data ?? []) as Row[]).map((p) => [str(p["id"]), str(p["name"])]));
  replace(
    leasingOffers,
    ((lo.data ?? []) as Row[]).map((o) => toLeasingOffer(o, partners)),
  );

  // Databáze je zdroj pravdy – lokální překryvy z ukázkového režimu se zahodí.
  const archived = rows.filter((r) => r["status"] === "archived").map((r) => str(r["id"]));
  patchStore((s) => ({
    ...s,
    added: s.added.filter((x) => !vehicles.some((b) => b.id === x.id)),
    sold: [],
    prices: {},
    auctioned: [],
    hidden: archived,
    dealerPlans: {},
  }));
  markRemoteReady();
}

/* ---------------------------------------------------------------- fotky */

const BUCKET = "vehicle-photos";
const SYNC_TIMEOUT_MS = 10_000;

async function uploadPhotos(vehicleId: string, photos: string[]) {
  if (!supabase) return photos;
  const out: string[] = [];
  for (const [i, p] of photos.entries()) {
    if (!p.startsWith("data:image/")) {
      out.push(p);
      continue;
    }
    const blob = await (await fetch(p)).blob();
    const path = `${vehicleId}/${i}-${Date.now().toString(36)}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    out.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }
  return out;
}

/* ---------------------------------------------------------------- zápisy */

async function uid() {
  const { data } = await supabase!.auth.getUser();
  if (!data.user) throw new Error("Pro tuto akci se přihlaste");
  return data.user.id;
}

async function check<T extends { error: unknown }>(p: PromiseLike<T>) {
  const r = await p;
  if (r.error) throw r.error instanceof Error ? r.error : new Error(JSON.stringify(r.error));
  return r;
}

export function initRemote() {
  if (!supabase) return () => {};
  const db = supabase;
  const timeout = () =>
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Databáze neodpovídá")), SYNC_TIMEOUT_MS),
    );
  const resync = () =>
    Promise.race([syncFromSupabase(), timeout()]).catch((e: unknown) => {
      console.error("Supabase sync", e);
      markRemoteReady();
      window.dispatchEvent(
        new CustomEvent("drivio:remote-error", { detail: "Data se nepodařilo načíst z databáze." }),
      );
    });

  setRemote({
    async addVehicle(v) {
      const userId = await uid();
      const isPrivate = v.dealerId === PRIVATE_SELLER;
      const photos = await uploadPhotos(
        v.id,
        v.photos.filter((p) => p !== PHOTO_FALLBACK),
      );
      await check(
        db.from("vehicles").insert({
          id: v.id,
          tenant_id: isPrivate ? null : v.dealerId,
          owner_user_id: isPrivate ? userId : null,
          seller_name: v.privateSeller?.name ?? null,
          seller_phone: v.privateSeller?.phone ?? null,
          seller_city: v.privateSeller?.city ?? null,
          seller_region: v.privateSeller?.region ?? null,
          status: "active",
          vin: v.vin,
          brand: v.brand,
          model: v.model,
          trim: v.trim || null,
          category: v.category,
          body: v.body,
          year: v.year,
          km: v.km,
          fuel: v.fuel,
          gearbox: v.gearbox,
          drive: v.drive,
          power_kw: v.powerKw || null,
          engine_ccm: v.engineCcm || null,
          color: v.color,
          price: v.price,
          vat_deductible: v.vatDeductible,
          equipment: v.equipment,
          photos,
          description: v.description || null,
          service_book: v.serviceBook,
          first_owner: v.firstOwner,
          accident_free: v.accidentFree,
          doors: v.doors,
          seats: v.seats,
          origin: v.origin,
        }),
      );
      await resync();
    },
    async setPrice(id, price) {
      await check(db.from("vehicles").update({ price }).eq("id", id));
      await resync();
    },
    async removeVehicle(id) {
      await check(db.from("vehicles").delete().eq("id", id));
      await resync();
    },
    async markSold(id) {
      await check(
        db
          .from("vehicles")
          .update({ status: "sold", sold_at: new Date().toISOString() })
          .eq("id", id),
      );
      await resync();
    },
    async sendToAuction(id) {
      const { data } = await check(db.from("vehicles").select("tenant_id").eq("id", id).single());
      const start = new Date(Date.now() + 24 * 3600_000);
      const end = new Date(start.getTime() + 7 * 24 * 3600_000);
      await check(
        db.from("auctions").insert({
          vehicle_id: id,
          tenant_id: (data as Row)["tenant_id"],
          status: "scheduled",
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
        }),
      );
      await check(db.from("vehicles").update({ status: "in_auction" }).eq("id", id));
      await resync();
    },
    async setHidden(id, hidden) {
      await check(
        db
          .from("vehicles")
          .update({ status: hidden ? "archived" : "active" })
          .eq("id", id),
      );
      await resync();
    },
    async setDealerPlan(dealerId, plan) {
      await check(db.rpc("change_plan", { p_tenant_id: dealerId, p_plan_id: plan }));
      await resync();
    },
  });

  void resync();
  // Po přihlášení/odhlášení se mění, co uživatel smí vidět (RLS) – načíst znovu.
  const { data: authSub } = db.auth.onAuthStateChange(() => void resync());
  // Změny od ostatních (nové vozy, aukce) se promítnou bez obnovení stránky.
  const channel = db
    .channel("drivio-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vehicles" },
      () => void resync(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "auctions" },
      () => void resync(),
    )
    .subscribe();
  return () => {
    authSub.subscription.unsubscribe();
    void db.removeChannel(channel);
  };
}
