import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WMI: Record<string, string> = {
  TMB: "skoda",
  WVW: "volkswagen",
  WV1: "volkswagen",
  WV2: "volkswagen",
  WAU: "audi",
  WBA: "bmw",
  WBS: "bmw",
  WDD: "mercedes-benz",
  WDB: "mercedes-benz",
  VF1: "renault",
  VF3: "peugeot",
  VF7: "citroen",
  W0L: "opel",
  UU1: "dacia",
  VSS: "seat",
  WF0: "ford",
  KMH: "hyundai",
  TMA: "hyundai",
  U5Y: "kia",
  KNA: "kia",
  SB1: "toyota",
  JTD: "toyota",
  JMZ: "mazda",
  YV1: "volvo",
  ZFA: "fiat",
  TSM: "suzuki",
  "5YJ": "tesla",
  LRW: "tesla",
  WP0: "porsche",
  SAL: "land-rover",
  JN1: "nissan",
  SJN: "nissan",
};

const YEAR = "ABCDEFGHJKLMNPRSTVWXY123456789";

export const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

/**
 * Dekódování VIN. Produkčně volá Edge Function `vin-decode` (Cebia / carVertical / Auto.dev);
 * zde základní offline dekódování výrobce (WMI) a modelového roku (10. znak).
 */
export const decodeVin = createServerFn({ method: "POST" })
  .inputValidator((d: { vin: string }) =>
    z.object({ vin: z.string().toUpperCase().regex(VIN_RE, "Neplatný VIN") }).parse(d),
  )
  .handler(async ({ data }) => {
    const brand = WMI[data.vin.slice(0, 3)] ?? null;
    const idx = YEAR.indexOf(data.vin[9]!);
    let year: number | null = null;
    if (idx >= 0) {
      year = 2010 + idx;
      if (year > new Date().getFullYear() + 1) year -= 30;
    }
    return { vin: data.vin, brand, year, stolen: false, source: "offline-wmi" as const };
  });
