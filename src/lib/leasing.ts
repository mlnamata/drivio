/**
 * Operativní leasing (ve stylu Driveto): nabídky leasingových společností, měsíční splátka
 * „vše v ceně", volba délky pronájmu a ročního nájezdu. Po napojení se nabídky načítají
 * z tabulky `leasing_offers`, kterou plní partneři přes API (viz /pro-leasingove-spolecnosti).
 */
import { DEMO_MODE, photoPool } from "./mock-data";

export type LeasingOffer = {
  id: string;
  brand: string;
  model: string;
  trim: string;
  body: string;
  fuel: string;
  gearbox: string;
  powerKw: number;
  condition: "nove" | "ojete";
  /** Měsíční splátka vč. DPH pro 48 měsíců a 20 000 km/rok. */
  baseMonthly: number;
  partner: string;
  inStock: boolean;
  deliveryDays: number;
  photo: string;
};

export const leasingPartners = ["Škofin", "ČSOB Leasing", "Ayvens", "Arval", "UniCredit Leasing"];

type Seed = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  number,
  "nove" | "ojete",
  number,
  number,
  boolean,
  number,
];
const seeds: Seed[] = [
  [
    "l-octavia",
    "skoda",
    "Octavia",
    "Combi 2.0 TDI Style DSG",
    "kombi",
    "nafta",
    "automat",
    110,
    "nove",
    10990,
    0,
    true,
    14,
  ],
  [
    "l-fabia",
    "skoda",
    "Fabia",
    "1.0 TSI Selection",
    "hatchback",
    "benzin",
    "manual",
    70,
    "nove",
    6990,
    0,
    true,
    10,
  ],
  [
    "l-kodiaq",
    "skoda",
    "Kodiaq",
    "2.0 TDI 4x4 Sportline",
    "suv",
    "nafta",
    "automat",
    142,
    "nove",
    15490,
    1,
    false,
    90,
  ],
  [
    "l-golf",
    "volkswagen",
    "Golf",
    "1.5 eTSI Life DSG",
    "hatchback",
    "hybrid",
    "automat",
    110,
    "nove",
    9990,
    1,
    true,
    14,
  ],
  [
    "l-tiguan",
    "volkswagen",
    "Tiguan",
    "2.0 TDI 4MOTION Elegance",
    "suv",
    "nafta",
    "automat",
    142,
    "nove",
    14990,
    2,
    true,
    21,
  ],
  [
    "l-corolla",
    "toyota",
    "Corolla",
    "Touring Sports 1.8 Hybrid",
    "kombi",
    "hybrid",
    "automat",
    103,
    "nove",
    9490,
    3,
    true,
    14,
  ],
  [
    "l-yaris",
    "toyota",
    "Yaris Cross",
    "1.5 Hybrid Style",
    "suv",
    "hybrid",
    "automat",
    85,
    "nove",
    8990,
    3,
    false,
    60,
  ],
  [
    "l-tucson",
    "hyundai",
    "Tucson",
    "1.6 T-GDI HEV Smart",
    "suv",
    "hybrid",
    "automat",
    169,
    "nove",
    11990,
    4,
    true,
    14,
  ],
  [
    "l-sportage",
    "kia",
    "Sportage",
    "1.6 T-GDI MHEV Exclusive",
    "suv",
    "hybrid",
    "automat",
    118,
    "nove",
    11490,
    4,
    true,
    18,
  ],
  [
    "l-model3",
    "tesla",
    "Model 3",
    "RWD Highland",
    "sedan",
    "elektro",
    "automat",
    208,
    "nove",
    13990,
    2,
    true,
    14,
  ],
  [
    "l-bmw3",
    "bmw",
    "Řada 3",
    "320d Touring M Sport",
    "kombi",
    "nafta",
    "automat",
    140,
    "nove",
    17990,
    1,
    false,
    75,
  ],
  [
    "l-duster",
    "dacia",
    "Duster",
    "1.3 TCe Journey",
    "suv",
    "benzin",
    "manual",
    96,
    "nove",
    7490,
    0,
    true,
    10,
  ],
  [
    "l-octavia-o",
    "skoda",
    "Octavia",
    "Combi 2.0 TDI Style (2022, 48 000 km)",
    "kombi",
    "nafta",
    "automat",
    110,
    "ojete",
    7990,
    0,
    true,
    7,
  ],
  [
    "l-passat-o",
    "volkswagen",
    "Passat",
    "Variant 2.0 TDI (2021, 71 000 km)",
    "kombi",
    "nafta",
    "automat",
    110,
    "ojete",
    7490,
    2,
    true,
    7,
  ],
];

export const leasingOffers: LeasingOffer[] = seeds.map((s, i) => ({
  id: s[0],
  brand: s[1],
  model: s[2],
  trim: s[3],
  body: s[4],
  fuel: s[5],
  gearbox: s[6],
  powerKw: s[7],
  condition: s[8],
  baseMonthly: s[9],
  partner: leasingPartners[s[10]]!,
  inStock: s[11],
  deliveryDays: s[12],
  photo: photoPool[(i * 2 + 1) % photoPool.length]!,
}));

export const leasingOfferById = (id: string) => leasingOffers.find((o) => o.id === id);

export const leaseMonths = [24, 36, 48, 60] as const;
export const leaseKm = [10000, 15000, 20000, 25000, 30000, 40000] as const;

const monthsFactor: Record<number, number> = { 24: 1.12, 36: 1.05, 48: 1, 60: 0.97 };
const kmFactor: Record<number, number> = {
  10000: 0.93,
  15000: 0.97,
  20000: 1,
  25000: 1.05,
  30000: 1.1,
  40000: 1.2,
};

/** Měsíční splátka pro zvolenou délku a nájezd; firmy vidí cenu bez DPH. */
export function leaseMonthly(o: LeasingOffer, months: number, kmPerYear: number, business = false) {
  const gross = o.baseMonthly * (monthsFactor[months] ?? 1) * (kmFactor[kmPerYear] ?? 1);
  const value = business ? gross / 1.21 : gross;
  return Math.round(value / 10) * 10;
}

export const leaseIncluded = [
  "Povinné ručení a havarijní pojištění",
  "Servis a pravidelná údržba",
  "Letní i zimní pneumatiky vč. přezutí",
  "Dálniční známka a silniční daň",
  "Asistenční služba 24/7",
  "Náhradní vůz při poruše",
];

if (!DEMO_MODE) leasingOffers.length = 0;
