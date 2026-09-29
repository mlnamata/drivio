import { z } from "zod";
import { vehicles, type Vehicle } from "./mock-data";

const csv = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) =>
    v === undefined ? undefined : Array.isArray(v) ? v : v.split(",").filter(Boolean),
  );

export const listingSearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["osobni", "uzitkove"]).optional().catch(undefined),
  brand: z.string().optional(),
  model: z.string().optional(),
  priceFrom: z.coerce.number().optional().catch(undefined),
  priceTo: z.coerce.number().optional().catch(undefined),
  yearFrom: z.coerce.number().optional().catch(undefined),
  yearTo: z.coerce.number().optional().catch(undefined),
  kmTo: z.coerce.number().optional().catch(undefined),
  powerFrom: z.coerce.number().optional().catch(undefined),
  fuel: csv,
  body: csv,
  color: csv,
  equipment: csv,
  gearbox: z.string().optional(),
  drive: z.string().optional(),
  region: z.string().optional(),
  vat: z.coerce.boolean().optional().catch(undefined),
  accidentFree: z.coerce.boolean().optional().catch(undefined),
  serviceBook: z.coerce.boolean().optional().catch(undefined),
  sort: z
    .enum(["newest", "price-asc", "price-desc", "km-asc", "year-desc"])
    .optional()
    .catch(undefined),
  view: z.enum(["grid", "list"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type ListingSearch = z.infer<typeof listingSearchSchema>;

export const PAGE_SIZE = 12;

export function filterVehicles(s: ListingSearch, dealerRegion: (v: Vehicle) => string): Vehicle[] {
  const q = s.q?.trim().toLowerCase();
  const list = vehicles.filter((v) => {
    if (s.category && v.category !== s.category) return false;
    if (s.brand && v.brand !== s.brand) return false;
    if (s.model && v.model !== s.model) return false;
    if (s.priceFrom && v.price < s.priceFrom) return false;
    if (s.priceTo && v.price > s.priceTo) return false;
    if (s.yearFrom && v.year < s.yearFrom) return false;
    if (s.yearTo && v.year > s.yearTo) return false;
    if (s.kmTo && v.km > s.kmTo) return false;
    if (s.powerFrom && v.powerKw < s.powerFrom) return false;
    if (s.fuel?.length && !s.fuel.includes(v.fuel)) return false;
    if (s.body?.length && !s.body.includes(v.body)) return false;
    if (s.color?.length && !s.color.includes(v.color)) return false;
    if (s.equipment?.length && !s.equipment.every((e) => v.equipment.includes(e))) return false;
    if (s.gearbox && v.gearbox !== s.gearbox) return false;
    if (s.drive && v.drive !== s.drive) return false;
    if (s.region && dealerRegion(v) !== s.region) return false;
    if (s.vat && !v.vatDeductible) return false;
    if (s.accidentFree && !v.accidentFree) return false;
    if (s.serviceBook && !v.serviceBook) return false;
    if (q && !`${v.brand} ${v.model} ${v.trim}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorters: Record<NonNullable<ListingSearch["sort"]>, (a: Vehicle, b: Vehicle) => number> = {
    newest: (a, b) => a.listedDays - b.listedDays,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "km-asc": (a, b) => a.km - b.km,
    "year-desc": (a, b) => b.year - a.year,
  };
  return list.sort(sorters[s.sort ?? "newest"]);
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
