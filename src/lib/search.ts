import { z } from "zod";
import { climateLevels, emissionClasses, rankIn, TAG, tagValue } from "./catalog";
import {
  conditionOf,
  monthlyPayment,
  ownersOf,
  priceRating,
  sellerOf,
  type Vehicle,
} from "./mock-data";

const csv = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) =>
    v === undefined ? undefined : Array.isArray(v) ? v : v.split(",").filter(Boolean),
  );
const num = z.coerce.number().optional().catch(undefined);
const flag = z.coerce.boolean().optional().catch(undefined);

export const listingSearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["osobni", "uzitkove"]).optional().catch(undefined),
  brand: z.string().optional(),
  model: z.string().optional(),
  priceFrom: num,
  priceTo: num,
  monthlyTo: num,
  yearFrom: num,
  yearTo: num,
  kmFrom: num,
  kmTo: num,
  powerFrom: num,
  powerTo: num,
  ccmFrom: num,
  ccmTo: num,
  fuel: csv,
  body: csv,
  color: csv,
  equipment: csv,
  condition: csv,
  interior: csv,
  interiorColor: csv,
  gearbox: z.string().optional(),
  drive: z.string().optional(),
  emission: z.string().optional(),
  climate: z.string().optional(),
  region: z.string().optional(),
  vat: flag,
  accidentFree: flag,
  serviceBook: flag,
  cebia: flag,
  origin: z.enum(["cz", "import"]).optional().catch(undefined),
  doors: num,
  seatsFrom: num,
  owners: num,
  stk: num,
  rangeFrom: num,
  listed: num,
  dealerRating: num,
  priceRating: flag,
  seller: z.enum(["dealer", "private"]).optional().catch(undefined),
  sort: z
    .enum(["newest", "price-asc", "price-desc", "km-asc", "year-desc", "power-desc"])
    .optional()
    .catch(undefined),
  view: z.enum(["grid", "list"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type ListingSearch = z.infer<typeof listingSearchSchema>;

/** Parametry, které nejsou filtrem (řazení, zobrazení, stránka). */
export const NON_FILTER_KEYS = ["category", "sort", "view", "page"] as const;

export const PAGE_SIZE = 12;

const ZERO_EMISSION = ["elektro", "vodik"];

function monthsUntil(ym: string | undefined) {
  if (!ym) return -Infinity;
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return -Infinity;
  const now = new Date();
  return (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth());
}

export type SellerInfo = { region: string; rating?: number; isDealer: boolean };

export function filterVehicles(
  source: Vehicle[],
  s: ListingSearch,
  seller: (v: Vehicle) => SellerInfo = sellerOf,
): Vehicle[] {
  const q = s.q?.trim().toLowerCase();
  const emissionMin = s.emission ? emissionClasses.findIndex((e) => e.value === s.emission) : -1;
  const climateMin = s.climate ? climateLevels.findIndex((c) => c.value === s.climate) : -1;

  const list = source.filter((v) => {
    const eq = v.equipment;
    if (s.category && v.category !== s.category) return false;
    if (s.brand && v.brand !== s.brand) return false;
    if (s.model && v.model !== s.model) return false;
    if (s.priceFrom && v.price < s.priceFrom) return false;
    if (s.priceTo && v.price > s.priceTo) return false;
    if (s.monthlyTo && monthlyPayment(v.price) > s.monthlyTo) return false;
    if (s.yearFrom && v.year < s.yearFrom) return false;
    if (s.yearTo && v.year > s.yearTo) return false;
    if (s.kmFrom && v.km < s.kmFrom) return false;
    if (s.kmTo && v.km > s.kmTo) return false;
    if (s.powerFrom && v.powerKw < s.powerFrom) return false;
    if (s.powerTo && v.powerKw > s.powerTo) return false;
    if (s.ccmFrom && v.engineCcm < s.ccmFrom) return false;
    if (s.ccmTo && (!v.engineCcm || v.engineCcm > s.ccmTo)) return false;
    if (s.fuel?.length && !s.fuel.includes(v.fuel)) return false;
    if (s.body?.length && !s.body.includes(v.body)) return false;
    if (s.color?.length && !s.color.includes(v.color)) return false;
    if (s.equipment?.length && !s.equipment.every((e) => eq.includes(e))) return false;
    if (s.condition?.length && !s.condition.includes(conditionOf(v))) return false;
    if (s.interior?.length && !s.interior.some((m) => eq.includes(m))) return false;
    if (s.interiorColor?.length && !s.interiorColor.some((c) => eq.includes(c))) return false;
    if (s.gearbox && v.gearbox !== s.gearbox) return false;
    if (s.drive && v.drive !== s.drive) return false;
    if (
      emissionMin >= 0 &&
      !ZERO_EMISSION.includes(v.fuel) &&
      rankIn(emissionClasses, eq) < emissionMin
    )
      return false;
    if (climateMin >= 0 && rankIn(climateLevels, eq) < climateMin) return false;
    if (s.region && seller(v).region !== s.region) return false;
    if (s.vat && !v.vatDeductible) return false;
    if (s.accidentFree && !v.accidentFree) return false;
    if (s.serviceBook && !v.serviceBook) return false;
    if (s.cebia && !v.cebiaVerified) return false;
    if (s.seller === "private" && seller(v).isDealer) return false;
    if (s.seller === "dealer" && !seller(v).isDealer) return false;
    if (s.dealerRating && (seller(v).rating ?? 0) < s.dealerRating) return false;
    if (s.origin && v.origin !== s.origin) return false;
    if (s.doors && (v.doors < s.doors || v.doors > s.doors + 1)) return false;
    if (s.seatsFrom && v.seats < s.seatsFrom) return false;
    if (s.owners) {
      const n = ownersOf(v);
      if (n === undefined || n > s.owners) return false;
    }
    if (s.stk !== undefined && monthsUntil(tagValue(eq, TAG.stk)) < s.stk) return false;
    if (s.rangeFrom && Number(tagValue(eq, TAG.range) ?? 0) < s.rangeFrom) return false;
    if (s.listed && v.listedDays > s.listed) return false;
    if (s.priceRating && !["great", "good"].includes(priceRating(v).tone)) return false;
    if (q && !`${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorters: Record<NonNullable<ListingSearch["sort"]>, (a: Vehicle, b: Vehicle) => number> = {
    newest: (a, b) => a.listedDays - b.listedDays,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "km-asc": (a, b) => a.km - b.km,
    "year-desc": (a, b) => b.year - a.year,
    "power-desc": (a, b) => b.powerKw - a.powerKw,
  };
  const sorted = list.sort(sorters[s.sort ?? "newest"]);
  // Topované inzeráty jsou při výchozím řazení nahoře.
  return s.sort ? sorted : [...sorted.filter((v) => v.top), ...sorted.filter((v) => !v.top)];
}

/** Odstraní prázdné hodnoty, aby URL zůstala čistá. */
export function cleanSearch(s: ListingSearch): ListingSearch {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    if (v === undefined || v === "" || v === false) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as ListingSearch;
}

/** Počet aktivních filtrů (pro odznak na tlačítku). */
export function activeFilterCount(s: ListingSearch) {
  return Object.entries(cleanSearch(s)).reduce((n, [k, v]) => {
    if ((NON_FILTER_KEYS as readonly string[]).includes(k)) return n;
    return n + (Array.isArray(v) ? v.length : 1);
  }, 0);
}
