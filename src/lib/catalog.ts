/**
 * Číselníky pro vyhledávání – inspirováno filtry sauto.cz, tipcars.com a mobile.de.
 * Loga značek jsou v /public/brands (zdroj: filippofilip95/car-logos-dataset, MIT).
 */

export type Brand = { slug: string; name: string; models: string[]; popular?: boolean };

export const brands: Brand[] = [
  {
    slug: "skoda",
    name: "Škoda",
    popular: true,
    models: [
      "Citigo",
      "Fabia",
      "Rapid",
      "Scala",
      "Octavia",
      "Superb",
      "Kamiq",
      "Karoq",
      "Kodiaq",
      "Enyaq",
      "Roomster",
      "Yeti",
    ],
  },
  {
    slug: "volkswagen",
    name: "Volkswagen",
    popular: true,
    models: [
      "up!",
      "Polo",
      "Golf",
      "Passat",
      "Arteon",
      "T-Roc",
      "Tiguan",
      "Touran",
      "Sharan",
      "Touareg",
      "Caddy",
      "Transporter",
      "ID.3",
      "ID.4",
    ],
  },
  {
    slug: "ford",
    name: "Ford",
    popular: true,
    models: [
      "Ka",
      "Fiesta",
      "Focus",
      "Mondeo",
      "Kuga",
      "Puma",
      "S-Max",
      "Galaxy",
      "C-Max",
      "Ranger",
      "Transit",
    ],
  },
  {
    slug: "hyundai",
    name: "Hyundai",
    popular: true,
    models: ["i10", "i20", "i30", "Kona", "Tucson", "Santa Fe", "ix35", "Ioniq"],
  },
  {
    slug: "toyota",
    name: "Toyota",
    popular: true,
    models: [
      "Aygo",
      "Yaris",
      "Corolla",
      "Auris",
      "Avensis",
      "C-HR",
      "RAV4",
      "Land Cruiser",
      "Hilux",
    ],
  },
  {
    slug: "bmw",
    name: "BMW",
    popular: true,
    models: ["Řada 1", "Řada 3", "Řada 5", "Řada 7", "X1", "X3", "X5", "X6", "i3"],
  },
  {
    slug: "audi",
    name: "Audi",
    popular: true,
    models: ["A1", "A3", "A4", "A5", "A6", "A8", "Q2", "Q3", "Q5", "Q7", "e-tron"],
  },
  {
    slug: "mercedes-benz",
    name: "Mercedes-Benz",
    popular: true,
    models: [
      "Třída A",
      "Třída B",
      "Třída C",
      "Třída E",
      "Třída S",
      "GLA",
      "GLC",
      "GLE",
      "Vito",
      "Sprinter",
    ],
  },
  {
    slug: "kia",
    name: "Kia",
    popular: true,
    models: ["Picanto", "Rio", "Ceed", "Stonic", "Sportage", "Sorento", "Niro", "XCeed"],
  },
  {
    slug: "renault",
    name: "Renault",
    popular: true,
    models: ["Twingo", "Clio", "Mégane", "Captur", "Kadjar", "Scénic", "Talisman", "Trafic"],
  },
  {
    slug: "peugeot",
    name: "Peugeot",
    popular: true,
    models: ["108", "208", "308", "508", "2008", "3008", "5008", "Partner"],
  },
  {
    slug: "opel",
    name: "Opel",
    popular: true,
    models: ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira", "Meriva"],
  },
  {
    slug: "dacia",
    name: "Dacia",
    models: ["Sandero", "Logan", "Duster", "Jogger", "Spring", "Lodgy"],
  },
  {
    slug: "citroen",
    name: "Citroën",
    models: ["C1", "C3", "C4", "C4 Picasso", "C5", "Berlingo", "C5 Aircross"],
  },
  {
    slug: "seat",
    name: "Seat",
    models: ["Mii", "Ibiza", "Leon", "Arona", "Ateca", "Tarraco", "Alhambra"],
  },
  { slug: "cupra", name: "Cupra", models: ["Born", "Formentor", "Leon", "Ateca"] },
  { slug: "mazda", name: "Mazda", models: ["2", "3", "6", "CX-3", "CX-30", "CX-5", "MX-5"] },
  {
    slug: "nissan",
    name: "Nissan",
    models: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Navara"],
  },
  { slug: "honda", name: "Honda", models: ["Jazz", "Civic", "HR-V", "CR-V", "Accord"] },
  {
    slug: "volvo",
    name: "Volvo",
    models: ["V40", "S60", "V60", "S90", "V90", "XC40", "XC60", "XC90"],
  },
  { slug: "fiat", name: "Fiat", models: ["Panda", "500", "Punto", "Tipo", "Doblo", "Ducato"] },
  {
    slug: "suzuki",
    name: "Suzuki",
    models: ["Swift", "Ignis", "Vitara", "S-Cross", "Jimny", "SX4"],
  },
  { slug: "mitsubishi", name: "Mitsubishi", models: ["Space Star", "ASX", "Outlander", "L200"] },
  { slug: "tesla", name: "Tesla", models: ["Model 3", "Model Y", "Model S", "Model X"] },
  { slug: "porsche", name: "Porsche", models: ["911", "Cayenne", "Macan", "Panamera", "Taycan"] },
  {
    slug: "land-rover",
    name: "Land Rover",
    models: ["Defender", "Discovery", "Range Rover", "Range Rover Evoque", "Range Rover Sport"],
  },
  {
    slug: "jeep",
    name: "Jeep",
    models: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler"],
  },
  { slug: "mini", name: "Mini", models: ["Cooper", "Clubman", "Countryman"] },
  { slug: "lexus", name: "Lexus", models: ["CT", "IS", "ES", "NX", "RX", "UX"] },
  { slug: "alfa-romeo", name: "Alfa Romeo", models: ["Giulietta", "Giulia", "Stelvio", "Tonale"] },
  { slug: "subaru", name: "Subaru", models: ["Impreza", "XV", "Forester", "Outback"] },
  { slug: "jaguar", name: "Jaguar", models: ["XE", "XF", "F-Pace", "E-Pace", "I-Pace"] },
];

export const brandBySlug = (slug: string) => brands.find((b) => b.slug === slug);
export const brandLogo = (slug: string) => `/brands/${slug}.webp`;

export const categories = [
  { value: "osobni", label: "Osobní" },
  { value: "uzitkove", label: "Užitkové" },
  { value: "obytne", label: "Obytné" },
  { value: "motorky", label: "Motorky" },
] as const;

export const bodyTypes = [
  { value: "hatchback", label: "Hatchback" },
  { value: "kombi", label: "Kombi" },
  { value: "sedan", label: "Sedan" },
  { value: "liftback", label: "Liftback" },
  { value: "suv", label: "SUV" },
  { value: "mpv", label: "MPV" },
  { value: "kupe", label: "Kupé" },
  { value: "kabriolet", label: "Kabriolet" },
  { value: "pickup", label: "Pick-up" },
  { value: "dodavka", label: "Dodávka" },
] as const;

export const fuels = [
  { value: "benzin", label: "Benzín" },
  { value: "nafta", label: "Nafta" },
  { value: "hybrid", label: "Hybrid" },
  { value: "phev", label: "Plug-in hybrid" },
  { value: "elektro", label: "Elektro" },
  { value: "lpg", label: "LPG + benzín" },
  { value: "cng", label: "CNG + benzín" },
] as const;

export const gearboxes = [
  { value: "manual", label: "Manuální" },
  { value: "automat", label: "Automatická" },
] as const;

export const drives = [
  { value: "predni", label: "Přední" },
  { value: "zadni", label: "Zadní" },
  { value: "4x4", label: "4×4" },
] as const;

export const colors = [
  { value: "bila", label: "Bílá", hex: "#f8fafc" },
  { value: "cerna", label: "Černá", hex: "#111827" },
  { value: "stribrna", label: "Stříbrná", hex: "#cbd5e1" },
  { value: "seda", label: "Šedá", hex: "#6b7280" },
  { value: "modra", label: "Modrá", hex: "#1d4ed8" },
  { value: "cervena", label: "Červená", hex: "#dc2626" },
  { value: "zelena", label: "Zelená", hex: "#15803d" },
  { value: "hneda", label: "Hnědá", hex: "#78350f" },
  { value: "zluta", label: "Žlutá", hex: "#eab308" },
] as const;

export const regions = [
  "Praha",
  "Středočeský",
  "Jihočeský",
  "Plzeňský",
  "Karlovarský",
  "Ústecký",
  "Liberecký",
  "Královéhradecký",
  "Pardubický",
  "Vysočina",
  "Jihomoravský",
  "Olomoucký",
  "Zlínský",
  "Moravskoslezský",
] as const;

export const equipment = [
  { value: "klima", label: "Klimatizace" },
  { value: "navigace", label: "Navigace" },
  { value: "tempomat", label: "Tempomat" },
  { value: "acc", label: "Adaptivní tempomat" },
  { value: "parksenzory", label: "Parkovací senzory" },
  { value: "kamera", label: "Parkovací kamera" },
  { value: "vyhrivane", label: "Vyhřívaná sedadla" },
  { value: "tazne", label: "Tažné zařízení" },
  { value: "panorama", label: "Panoramatická střecha" },
  { value: "led", label: "LED světlomety" },
  { value: "carplay", label: "Apple CarPlay / Android Auto" },
  { value: "kuze", label: "Kožené čalounění" },
] as const;

export const conditions = [
  { value: "ojete", label: "Ojeté" },
  { value: "predvadeci", label: "Předváděcí" },
  { value: "nove", label: "Nové" },
] as const;

export const labelOf = <T extends { value: string; label: string }>(
  list: readonly T[],
  value: string,
) => list.find((i) => i.value === value)?.label ?? value;

export const yearsRange = Array.from({ length: 27 }, (_, i) => 2026 - i);
export const priceSteps = [
  30000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 700000, 1000000,
  1500000, 2000000,
];
export const kmSteps = [10000, 30000, 50000, 80000, 100000, 150000, 200000, 250000, 300000];
