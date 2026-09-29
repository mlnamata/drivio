/**
 * Ukázková data pro frontend. Po napojení Supabase se nahradí dotazy na tabulky
 * `vehicles`, `tenants`, `auctions`, `bids` (viz supabase/migrations).
 */
import { brandBySlug } from "./catalog";

export const czk = (v: number) =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(v);

export const num = (v: number) => v.toLocaleString("cs-CZ");

/* ---------------------------------------------------------------- finance */

export const DEFAULT_RATE = 0.099; // úrok p.a. pro orientační splátku
export const DEFAULT_MONTHS = 72;

/** Anuitní splátka. */
export function monthlyPayment(principal: number, months = DEFAULT_MONTHS, rate = DEFAULT_RATE) {
  if (principal <= 0) return 0;
  const r = rate / 12;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -months)));
}

/* ---------------------------------------------------------------- photos */

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const photoPool = [
  u("1503376780353-7e6692767b70"),
  u("1552519507-da3b142c6e3d"),
  u("1541899481282-d53bffe3c35d"),
  u("1555215695-3004980ad54e"),
  u("1494976388531-d1058494cdd8"),
  u("1606664515524-ed2f786a0bd6"),
  u("1583121274602-3e2820c69888"),
  u("1502877338535-766e1452684a"),
  u("1511919884226-fd3cad34687c"),
];

export const PHOTO_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#eef1f6"/><path d="M40 62h80l-8-16c-2-4-5-6-9-6H57c-4 0-7 2-9 6z" fill="#cfd6e3"/><circle cx="58" cy="64" r="7" fill="#aab4c6"/><circle cx="102" cy="64" r="7" fill="#aab4c6"/></svg>`,
  );

/* ---------------------------------------------------------------- dealers */

export type Dealer = {
  id: string;
  name: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  since: number;
  plan: PlanId;
};

export const dealers: Dealer[] = [
  {
    id: "kolbenka",
    name: "Autobazar Kolbenka",
    city: "Praha 9",
    region: "Praha",
    phone: "+420 777 123 456",
    email: "prodej@kolbenka.cz",
    rating: 4.8,
    reviews: 214,
    since: 2009,
    plan: "standard",
  },
  {
    id: "acbrno",
    name: "AutoCentrum Brno",
    city: "Brno",
    region: "Jihomoravský",
    phone: "+420 604 222 333",
    email: "info@acbrno.cz",
    rating: 4.6,
    reviews: 158,
    since: 2013,
    plan: "standard",
  },
  {
    id: "poruba",
    name: "Bazar Ostrava Poruba",
    city: "Ostrava",
    region: "Moravskoslezský",
    phone: "+420 736 444 555",
    email: "bazar@poruba-auto.cz",
    rating: 4.4,
    reviews: 97,
    since: 2016,
    plan: "economy",
  },
  {
    id: "plzenauto",
    name: "Plzeň Auto Point",
    city: "Plzeň",
    region: "Plzeňský",
    phone: "+420 608 111 999",
    email: "obchod@plzenauto.cz",
    rating: 4.7,
    reviews: 131,
    since: 2011,
    plan: "economy",
  },
  {
    id: "premiumcars",
    name: "Premium Cars Praha",
    city: "Praha 5",
    region: "Praha",
    phone: "+420 725 888 000",
    email: "sales@premiumcars.cz",
    rating: 4.9,
    reviews: 76,
    since: 2018,
    plan: "premium",
  },
];

export const dealerById = (id: string) => dealers.find((d) => d.id === id)!;

/* ---------------------------------------------------------------- vehicles */

export type Vehicle = {
  id: string;
  brand: string; // slug
  model: string;
  trim: string;
  category: "osobni" | "uzitkove";
  body: string;
  year: number;
  km: number;
  fuel: string;
  gearbox: string;
  drive: string;
  powerKw: number;
  engineCcm: number;
  color: string;
  condition: string;
  price: number;
  vatDeductible: boolean;
  equipment: string[];
  photos: string[];
  dealerId: string;
  /** Počet dní od vložení inzerátu. */
  listedDays: number;
  vin: string;
  serviceBook: boolean;
  firstOwner: boolean;
  accidentFree: boolean;
  description: string;
  doors: number;
  seats: number;
  /** "cz" = původem z ČR, "import" = dovoz. */
  origin: "cz" | "import";
  /** Historie ověřena (Cebia: VIN, rok, odcizení, financování, tachometr). */
  cebiaVerified: boolean;
  /** Topovaný inzerát (placené zvýraznění). */
  top: boolean;
  status: "active" | "in_auction" | "sold";
  /** Soukromý prodejce (dealerId === "private"). */
  privateSeller?: { name: string; city: string; region: string; phone: string };
};

export const PRIVATE_SELLER = "private";

export type Seller = {
  name: string;
  city: string;
  region: string;
  phone: string;
  email?: string;
  isDealer: boolean;
  rating?: number;
  reviews?: number;
  since?: number;
};

/** Prodejce vozu – autobazar nebo soukromá osoba. */
export function sellerOf(v: Vehicle): Seller {
  if (v.dealerId === PRIVATE_SELLER || !dealers.some((d) => d.id === v.dealerId)) {
    const p = v.privateSeller ?? { name: "Soukromý prodejce", city: "", region: "", phone: "" };
    return { ...p, isDealer: false };
  }
  const d = dealerById(v.dealerId);
  return { ...d, isDealer: true };
}

type Seed = [
  string,
  string,
  string,
  string,
  number,
  number,
  string,
  string,
  string,
  number,
  number,
  string,
  number,
  string,
  number,
  string[],
];

// id, brand, model, trim, year, km, fuel, gearbox, body, kW, ccm, color, price, dealer, days, equipment
const seeds: Seed[] = [
  [
    "vw-golf-15",
    "volkswagen",
    "Golf",
    "1.6 TDI Comfortline",
    2015,
    187000,
    "nafta",
    "manual",
    "hatchback",
    81,
    1598,
    "stribrna",
    189000,
    "kolbenka",
    12,
    ["klima", "tempomat", "parksenzory"],
  ],
  [
    "skoda-octavia-17",
    "skoda",
    "Octavia",
    "2.0 TDI Style DSG",
    2017,
    142000,
    "nafta",
    "automat",
    "kombi",
    110,
    1968,
    "seda",
    279000,
    "acbrno",
    44,
    ["klima", "navigace", "tempomat", "parksenzory", "vyhrivane", "led"],
  ],
  [
    "ford-fiesta-12",
    "ford",
    "Fiesta",
    "1.25 Trend",
    2012,
    211000,
    "benzin",
    "manual",
    "hatchback",
    44,
    1242,
    "cervena",
    89000,
    "poruba",
    95,
    ["klima"],
  ],
  [
    "bmw-x5-19",
    "bmw",
    "X5",
    "xDrive30d M Sport",
    2019,
    96000,
    "nafta",
    "automat",
    "suv",
    195,
    2993,
    "cerna",
    1290000,
    "premiumcars",
    9,
    [
      "klima",
      "navigace",
      "acc",
      "kamera",
      "vyhrivane",
      "tazne",
      "panorama",
      "led",
      "carplay",
      "kuze",
    ],
  ],
  [
    "renault-clio-14",
    "renault",
    "Clio",
    "1.2 16V Limited",
    2014,
    158000,
    "benzin",
    "manual",
    "hatchback",
    54,
    1149,
    "modra",
    119000,
    "acbrno",
    38,
    ["klima", "tempomat"],
  ],
  [
    "audi-a4-16",
    "audi",
    "A4",
    "Avant 2.0 TDI S tronic",
    2016,
    203000,
    "nafta",
    "automat",
    "kombi",
    110,
    1968,
    "cerna",
    329000,
    "poruba",
    121,
    ["klima", "navigace", "tempomat", "vyhrivane", "led"],
  ],
  [
    "skoda-fabia-18",
    "skoda",
    "Fabia",
    "1.0 TSI Ambition",
    2018,
    88000,
    "benzin",
    "manual",
    "hatchback",
    70,
    999,
    "bila",
    199000,
    "plzenauto",
    5,
    ["klima", "tempomat", "carplay"],
  ],
  [
    "hyundai-i30-19",
    "hyundai",
    "i30",
    "1.4 T-GDI Comfort",
    2019,
    64000,
    "benzin",
    "manual",
    "hatchback",
    103,
    1353,
    "seda",
    319000,
    "kolbenka",
    21,
    ["klima", "kamera", "vyhrivane", "carplay"],
  ],
  [
    "toyota-corolla-20",
    "toyota",
    "Corolla",
    "1.8 Hybrid Comfort",
    2020,
    71000,
    "hybrid",
    "automat",
    "kombi",
    90,
    1798,
    "bila",
    449000,
    "plzenauto",
    17,
    ["klima", "acc", "kamera", "led", "carplay"],
  ],
  [
    "dacia-duster-18",
    "dacia",
    "Duster",
    "1.5 dCi 4x4 Prestige",
    2018,
    119000,
    "nafta",
    "manual",
    "suv",
    85,
    1461,
    "hneda",
    269000,
    "poruba",
    63,
    ["klima", "navigace", "kamera", "tazne"],
  ],
  [
    "kia-ceed-21",
    "kia",
    "Ceed",
    "1.5 T-GDI SW Exclusive",
    2021,
    42000,
    "benzin",
    "automat",
    "kombi",
    118,
    1482,
    "modra",
    469000,
    "acbrno",
    28,
    ["klima", "navigace", "acc", "kamera", "vyhrivane", "led", "carplay"],
  ],
  [
    "opel-astra-13",
    "opel",
    "Astra",
    "1.4 Turbo Sports Tourer",
    2013,
    176000,
    "benzin",
    "manual",
    "kombi",
    103,
    1364,
    "stribrna",
    115000,
    "kolbenka",
    102,
    ["klima", "tempomat", "tazne"],
  ],
  [
    "peugeot-3008-19",
    "peugeot",
    "3008",
    "1.5 BlueHDi Allure EAT8",
    2019,
    98000,
    "nafta",
    "automat",
    "suv",
    96,
    1499,
    "seda",
    429000,
    "plzenauto",
    33,
    ["klima", "navigace", "kamera", "led", "carplay"],
  ],
  [
    "mercedes-c-18",
    "mercedes-benz",
    "Třída C",
    "C 220 d 4MATIC AMG Line",
    2018,
    139000,
    "nafta",
    "automat",
    "sedan",
    125,
    1950,
    "cerna",
    589000,
    "premiumcars",
    48,
    ["klima", "navigace", "acc", "kamera", "vyhrivane", "led", "kuze"],
  ],
  [
    "skoda-superb-20",
    "skoda",
    "Superb",
    "2.0 TDI L&K 4x4",
    2020,
    118000,
    "nafta",
    "automat",
    "liftback",
    147,
    1968,
    "cerna",
    689000,
    "kolbenka",
    14,
    [
      "klima",
      "navigace",
      "acc",
      "kamera",
      "vyhrivane",
      "tazne",
      "panorama",
      "led",
      "carplay",
      "kuze",
    ],
  ],
  [
    "vw-passat-16",
    "volkswagen",
    "Passat",
    "Variant 2.0 TDI Highline",
    2016,
    229000,
    "nafta",
    "automat",
    "kombi",
    110,
    1968,
    "modra",
    259000,
    "acbrno",
    76,
    ["klima", "navigace", "acc", "vyhrivane", "tazne"],
  ],
  [
    "tesla-model3-21",
    "tesla",
    "Model 3",
    "Long Range AWD",
    2021,
    81000,
    "elektro",
    "automat",
    "sedan",
    324,
    0,
    "bila",
    749000,
    "premiumcars",
    26,
    ["klima", "navigace", "acc", "kamera", "vyhrivane", "panorama", "led"],
  ],
  [
    "fiat-panda-11",
    "fiat",
    "Panda",
    "1.2 Easy",
    2011,
    132000,
    "benzin",
    "manual",
    "hatchback",
    51,
    1242,
    "zluta",
    59000,
    "poruba",
    88,
    [],
  ],
  [
    "ford-transit-17",
    "ford",
    "Transit",
    "2.0 TDCi L3H2",
    2017,
    248000,
    "nafta",
    "manual",
    "dodavka",
    96,
    1995,
    "bila",
    339000,
    "plzenauto",
    41,
    ["klima", "tazne"],
  ],
  [
    "mazda-cx5-18",
    "mazda",
    "CX-5",
    "2.5 Skyactiv-G AWD Revolution",
    2018,
    104000,
    "benzin",
    "automat",
    "suv",
    143,
    2488,
    "cervena",
    459000,
    "kolbenka",
    52,
    ["klima", "navigace", "acc", "kamera", "vyhrivane", "led", "kuze"],
  ],
  [
    "citroen-c3-16",
    "citroen",
    "C3",
    "1.2 PureTech Feel",
    2016,
    97000,
    "benzin",
    "manual",
    "hatchback",
    60,
    1199,
    "bila",
    145000,
    "acbrno",
    19,
    ["klima", "tempomat", "parksenzory"],
  ],
  [
    "seat-leon-19",
    "seat",
    "Leon",
    "1.5 TSI FR",
    2019,
    76000,
    "benzin",
    "manual",
    "hatchback",
    110,
    1498,
    "seda",
    349000,
    "plzenauto",
    8,
    ["klima", "navigace", "acc", "led", "carplay"],
  ],
  [
    "volvo-xc60-17",
    "volvo",
    "XC60",
    "D4 AWD Momentum",
    2017,
    164000,
    "nafta",
    "automat",
    "suv",
    140,
    1969,
    "stribrna",
    559000,
    "premiumcars",
    67,
    ["klima", "navigace", "acc", "kamera", "vyhrivane", "tazne", "led", "kuze"],
  ],
  [
    "suzuki-vitara-20",
    "suzuki",
    "Vitara",
    "1.4 BoosterJet AllGrip",
    2020,
    58000,
    "hybrid",
    "manual",
    "suv",
    95,
    1373,
    "zelena",
    399000,
    "poruba",
    11,
    ["klima", "navigace", "acc", "kamera", "carplay"],
  ],
  [
    "skoda-fabia-09",
    "skoda",
    "Fabia",
    "1.2 HTP Classic",
    2009,
    168000,
    "benzin",
    "manual",
    "hatchback",
    51,
    1198,
    "stribrna",
    64000,
    "plzenauto",
    9,
    ["klima"],
  ],
  [
    "vw-polo-12",
    "volkswagen",
    "Polo",
    "1.2 TSI Comfortline",
    2012,
    139000,
    "benzin",
    "manual",
    "hatchback",
    77,
    1197,
    "cerna",
    99000,
    "kolbenka",
    4,
    ["klima", "tempomat"],
  ],
  [
    "hyundai-i20-14",
    "hyundai",
    "i20",
    "1.25 Comfort",
    2014,
    121000,
    "benzin",
    "manual",
    "hatchback",
    63,
    1248,
    "bila",
    115000,
    "acbrno",
    16,
    ["klima", "parksenzory"],
  ],
  [
    "toyota-yaris-13",
    "toyota",
    "Yaris",
    "1.33 Dual VVT-i Active",
    2013,
    98000,
    "benzin",
    "manual",
    "hatchback",
    73,
    1329,
    "cervena",
    129000,
    "plzenauto",
    23,
    ["klima", "kamera"],
  ],
  [
    "skoda-roomster-11",
    "skoda",
    "Roomster",
    "1.6 TDI Style",
    2011,
    214000,
    "nafta",
    "manual",
    "mpv",
    66,
    1598,
    "modra",
    79000,
    "poruba",
    31,
    ["klima", "tazne"],
  ],
  [
    "dacia-sandero-17",
    "dacia",
    "Sandero",
    "0.9 TCe Stepway",
    2017,
    87000,
    "lpg",
    "manual",
    "hatchback",
    66,
    898,
    "hneda",
    149000,
    "acbrno",
    6,
    ["klima", "navigace"],
  ],
  [
    "kia-rio-15",
    "kia",
    "Rio",
    "1.25 CVVT Comfort",
    2015,
    104000,
    "benzin",
    "manual",
    "hatchback",
    62,
    1248,
    "seda",
    139000,
    "kolbenka",
    12,
    ["klima", "tempomat", "vyhrivane"],
  ],
  [
    "ford-focus-14",
    "ford",
    "Focus",
    "1.0 EcoBoost Kombi",
    2014,
    176000,
    "benzin",
    "manual",
    "kombi",
    92,
    999,
    "stribrna",
    119000,
    "poruba",
    45,
    ["klima", "tempomat", "parksenzory"],
  ],
];

const descriptions = [
  "Vůz v zachovalém stavu, pravidelný servis, 2 sady kol. Možnost prověření v autorizovaném servisu a financování bez akontace.",
  "Pečlivě udržovaný vůz od prvního majitele. Doložená servisní historie, nekuřácký interiér, nová STK a emise.",
  "Spolehlivý vůz ideální na každodenní ježdění. Po velkém servisu, nové brzdy a rozvody. Ověřený stav tachometru.",
];

const vinChars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
const fakeVin = (seed: string) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  let out = "TMB";
  for (let i = 0; i < 14; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out += vinChars[h % vinChars.length];
  }
  return out;
};

const inAuction = new Set([
  "opel-astra-13",
  "audi-a4-16",
  "fiat-panda-11",
  "vw-passat-16",
  // čekají na aukci (galerie připravovaných aukcí)
  "renault-clio-14",
  "dacia-duster-18",
  "peugeot-3008-19",
]);
const soldInAuction = new Set(["ford-fiesta-12"]);

export const vehicles: Vehicle[] = seeds.map((s, i) => {
  const [
    id,
    brand,
    model,
    trim,
    year,
    km,
    fuel,
    gearbox,
    body,
    powerKw,
    engineCcm,
    color,
    price,
    dealerId,
    listedDays,
    eq,
  ] = s;
  return {
    id,
    brand,
    model,
    trim,
    category: body === "dodavka" ? "uzitkove" : "osobni",
    body,
    year,
    km,
    fuel,
    gearbox,
    drive:
      trim.includes("4x4") ||
      trim.includes("AWD") ||
      trim.includes("xDrive") ||
      trim.includes("4MATIC") ||
      trim.includes("AllGrip")
        ? "4x4"
        : "predni",
    powerKw,
    engineCcm,
    color,
    condition: "ojete",
    price,
    vatDeductible: price > 400000 || i % 4 === 0,
    equipment: eq,
    photos: [0, 1, 2, 3].map((k) => photoPool[(i + k * 2) % photoPool.length]!),
    dealerId,
    listedDays,
    vin: fakeVin(id),
    serviceBook: i % 3 !== 2,
    firstOwner: i % 4 === 1,
    accidentFree: i % 5 !== 3,
    description: descriptions[i % descriptions.length]!,
    doors: body === "kupe" || body === "kabriolet" ? 3 : body === "dodavka" ? 4 : 5,
    seats: body === "mpv" ? 7 : body === "dodavka" ? 3 : 5,
    origin: i % 3 === 1 ? "import" : "cz",
    cebiaVerified: i % 3 !== 0,
    top: i % 7 === 2,
    status: soldInAuction.has(id) ? "sold" : inAuction.has(id) ? "in_auction" : "active",
  };
});

export const vehicleById = (id: string) => vehicles.find((v) => v.id === id);
export const vehicleTitle = (v: Vehicle) => `${brandBySlug(v.brand)?.name ?? v.brand} ${v.model}`;
export const monthOfListing = (v: Vehicle) => Math.floor(v.listedDays / 30) + 1;

/**
 * Hodnocení ceny (jako „hodnocení ceny" na sauto.cz) – porovnání s odhadem tržní ceny
 * podle stáří, nájezdu a výkonu. Po napojení dat nahradit mediánem podobných inzerátů.
 */
export function priceRating(v: Vehicle): {
  label: string;
  tone: "great" | "good" | "fair" | "high";
} {
  const age = Math.max(0, 2026 - v.year);
  const expected =
    800_000 *
    Math.pow(0.92, age) *
    Math.max(0.4, 1 - v.km / 700_000) *
    (Math.max(v.powerKw || 80, 40) / 110);
  const r = v.price / expected;
  if (r < 0.85) return { label: "Výhodná cena", tone: "great" };
  if (r < 1.05) return { label: "Dobrá cena", tone: "good" };
  if (r < 1.3) return { label: "Férová cena", tone: "fair" };
  return { label: "Vyšší cena", tone: "high" };
}

/* ---------------------------------------------------------------- pricing */

export type PlanId = "economy" | "standard" | "premium" | "payg";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  slots: number;
  /** Maximální cena vozu v Kč, null = bez limitu. */
  maxPrice: number | null;
  perSlot: number;
  highlight?: boolean;
};

export const plans: Plan[] = [
  { id: "economy", name: "Garáž ECONOMY 10", price: 990, slots: 10, maxPrice: 200000, perSlot: 99 },
  {
    id: "standard",
    name: "Garáž STANDARD 15",
    price: 2490,
    slots: 15,
    maxPrice: 700000,
    perSlot: 166,
    highlight: true,
  },
  { id: "premium", name: "Garáž PREMIUM 5", price: 1990, slots: 5, maxPrice: null, perSlot: 398 },
];

/** Bez předplatného – autobazar/firma platí za každý vůz zvlášť (30 dní). */
export const PAYG_PLAN: Plan = {
  id: "payg",
  name: "Platba za vůz",
  price: 0,
  slots: 999,
  maxPrice: null,
  perSlot: 0,
};

export const planById = (id: PlanId) =>
  id === "payg" ? PAYG_PLAN : plans.find((p) => p.id === id)!;

/** Tabulková cena samostatného inzerátu v nejvyšší kategorii. */
export const TOP_TIER_LISTING_PRICE = 499;

/** Progrese poplatku podle měsíce inzerce: M1 základ, M2 +50 %, M3+ +100 %. */
export const surchargeFactor = (month: number) => (month <= 1 ? 1 : month === 2 ? 1.5 : 2);

/** Platba za vůz (bez předplatného) – cena za 30 dní podle ceny vozu. */
export const perVehicleTiers = [
  { upTo: 200000, price: 149, label: "Vůz do 200 000 Kč" },
  { upTo: 700000, price: 249, label: "Vůz do 700 000 Kč" },
  { upTo: Infinity, price: TOP_TIER_LISTING_PRICE, label: "Vůz nad 700 000 Kč" },
];

/** Poplatek za vůz v daném měsíci inzerce – platí stejná časová progrese jako u slotů. */
export const perVehicleFee = (vehiclePrice: number, month = 1) =>
  Math.round(perVehicleTiers.find((t) => vehiclePrice <= t.upTo)!.price * surchargeFactor(month));

/** „Lamborghini" doplatek – jen pro slot s vozem nad limitem balíčku. */
export function slotSurcharge(plan: Plan, vehiclePrice: number) {
  if (plan.maxPrice === null || vehiclePrice <= plan.maxPrice) return 0;
  return Math.max(0, TOP_TIER_LISTING_PRICE - plan.perSlot);
}

/** Provize z prodeje – klesající procento s cenou vozu. */
export const commissionTiers = [
  { upTo: 50000, rate: 0.02 },
  { upTo: 200000, rate: 0.01 },
  { upTo: 700000, rate: 0.005 },
  { upTo: Infinity, rate: 0.002 },
];
export const commissionFor = (price: number) =>
  Math.round(price * commissionTiers.find((t) => price <= t.upTo)!.rate);

/* ---------------------------------------------------------------- auctions */

export type Auction = {
  id: string;
  vehicleId: string;
  startPrice: number;
  currentBid: number;
  bids: number;
  /** Minuty do konce (převádí se na čas až na klientu, kvůli hydrataci). */
  endsInMinutes: number;
  minIncrement: number;
  buyerFeeRate: number;
  /** Minimální (rezervní) cena; pod ní se vůz neprodá. */
  reservePrice?: number;
  /** Minuty do začátku; > 0 = vůz čeká na aukci (galerie připravovaných). */
  startsInMinutes?: number;
};

export const auctions: Auction[] = [
  {
    id: "a-opel-astra",
    vehicleId: "opel-astra-13",
    startPrice: 1,
    currentBid: 34500,
    bids: 47,
    endsInMinutes: 134,
    minIncrement: 500,
    buyerFeeRate: 0.04,
  },
  {
    id: "a-audi-a4",
    vehicleId: "audi-a4-16",
    startPrice: 1,
    currentBid: 151000,
    bids: 62,
    endsInMinutes: 362,
    minIncrement: 1000,
    buyerFeeRate: 0.04,
  },
  {
    id: "a-fiat-panda",
    vehicleId: "fiat-panda-11",
    startPrice: 1,
    currentBid: 18200,
    bids: 29,
    endsInMinutes: 1620,
    minIncrement: 200,
    buyerFeeRate: 0.05,
  },
  {
    id: "a-vw-passat",
    vehicleId: "vw-passat-16",
    startPrice: 1,
    currentBid: 96000,
    bids: 38,
    endsInMinutes: 2890,
    minIncrement: 1000,
    buyerFeeRate: 0.04,
  },
];

/** Připravované aukce – vozy čekající na start. */
auctions.push(
  {
    id: "a-renault-clio",
    vehicleId: "renault-clio-14",
    startPrice: 1,
    currentBid: 0,
    bids: 0,
    startsInMinutes: 300,
    endsInMinutes: 300 + 7 * 24 * 60,
    minIncrement: 500,
    buyerFeeRate: 0.05,
  },
  {
    id: "a-dacia-duster",
    vehicleId: "dacia-duster-18",
    startPrice: 1,
    currentBid: 0,
    bids: 0,
    startsInMinutes: 1500,
    endsInMinutes: 1500 + 7 * 24 * 60,
    minIncrement: 1000,
    buyerFeeRate: 0.04,
    reservePrice: 180000,
  },
  {
    id: "a-peugeot-3008",
    vehicleId: "peugeot-3008-19",
    startPrice: 1,
    currentBid: 0,
    bids: 0,
    startsInMinutes: 2900,
    endsInMinutes: 2900 + 5 * 24 * 60,
    minIncrement: 1000,
    buyerFeeRate: 0.04,
  },
);

/** Ukončené aukce (historie výsledků). endsInMinutes < 0 = skončila. */
auctions.push({
  id: "a-ford-fiesta",
  vehicleId: "ford-fiesta-12",
  startPrice: 1,
  currentBid: 41500,
  bids: 88,
  endsInMinutes: -2 * 24 * 60,
  minIncrement: 500,
  buyerFeeRate: 0.05,
});

export const auctionById = (id: string) => auctions.find((a) => a.id === id);

export const bidFeed = [
  { user: "Jiří N.", amount: 34500, time: "před 12 s" },
  { user: "Marek P.", amount: 34000, time: "před 48 s" },
  { user: "Lucie K.", amount: 33000, time: "před 2 min" },
  { user: "Tomáš V.", amount: 31500, time: "před 4 min" },
];

/* ---------------------------------------------------------------- leasing partners */

export const financePartners = [
  { id: "essox", name: "Essox", product: "Úvěr na auto", rate: 0.089, maxMonths: 96 },
  { id: "homecredit", name: "Home Credit", product: "Autoúvěr", rate: 0.099, maxMonths: 84 },
  { id: "cofidis", name: "Cofidis", product: "Půjčka na auto", rate: 0.079, maxMonths: 96 },
];
