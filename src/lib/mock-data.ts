export type Vehicle = {
  id: string;
  title: string;
  year: number;
  km: number;
  fuel: string;
  gearbox: string;
  price: number;
  monthly: number;
  dealer: string;
  city: string;
  ageMonths: number;
  photo: string;
  tier: "economy" | "standard" | "premium";
};

export const czk = (v: number) =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(v);

export const vehicles: Vehicle[] = [
  {
    id: "vw-golf-19",
    title: "Volkswagen Golf 1.6 TDI",
    year: 2015,
    km: 187000,
    fuel: "Nafta",
    gearbox: "Manuál",
    price: 189000,
    monthly: 3190,
    dealer: "Autobazar Kolbenka",
    city: "Praha 9",
    ageMonths: 1,
    photo:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70",
    tier: "economy",
  },
  {
    id: "skoda-octavia-17",
    title: "Škoda Octavia III 2.0 TDI",
    year: 2017,
    km: 142000,
    fuel: "Nafta",
    gearbox: "Automat",
    price: 279000,
    monthly: 4690,
    dealer: "AutoCentrum Brno",
    city: "Brno",
    ageMonths: 2,
    photo:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=70",
    tier: "standard",
  },
  {
    id: "ford-fiesta-12",
    title: "Ford Fiesta 1.25",
    year: 2012,
    km: 211000,
    fuel: "Benzín",
    gearbox: "Manuál",
    price: 89000,
    monthly: 1490,
    dealer: "Bazar Ostrava Poruba",
    city: "Ostrava",
    ageMonths: 3,
    photo:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=70",
    tier: "economy",
  },
  {
    id: "bmw-x5-19",
    title: "BMW X5 xDrive30d",
    year: 2019,
    km: 96000,
    fuel: "Nafta",
    gearbox: "Automat",
    price: 1290000,
    monthly: 18900,
    dealer: "Autobazar Kolbenka",
    city: "Praha 9",
    ageMonths: 1,
    photo:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=70",
    tier: "premium",
  },
  {
    id: "renault-clio-14",
    title: "Renault Clio 1.2 16V",
    year: 2014,
    km: 158000,
    fuel: "Benzín",
    gearbox: "Manuál",
    price: 119000,
    monthly: 1990,
    dealer: "AutoCentrum Brno",
    city: "Brno",
    ageMonths: 2,
    photo:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=70",
    tier: "economy",
  },
  {
    id: "audi-a4-16",
    title: "Audi A4 Avant 2.0 TDI",
    year: 2016,
    km: 203000,
    fuel: "Nafta",
    gearbox: "Automat",
    price: 329000,
    monthly: 5490,
    dealer: "Bazar Ostrava Poruba",
    city: "Ostrava",
    ageMonths: 4,
    photo:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=70",
    tier: "standard",
  },
];

export type Plan = {
  name: string;
  price: number;
  slots: number;
  limit: string;
  perSlot: number;
  highlight?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Garáž ECONOMY 10",
    price: 990,
    slots: 10,
    limit: "Do 200 000 Kč za vůz",
    perSlot: 99,
  },
  {
    name: "Garáž STANDARD 15",
    price: 2490,
    slots: 15,
    limit: "Do 700 000 Kč za vůz",
    perSlot: 166,
    highlight: true,
  },
  {
    name: "Garáž PREMIUM 5",
    price: 1990,
    slots: 5,
    limit: "Bez omezení hodnoty",
    perSlot: 398,
  },
];

export type Auction = {
  id: string;
  title: string;
  year: number;
  km: number;
  currentBid: number;
  bids: number;
  endsIn: string;
  dealer: string;
  photo: string;
};

export const auctions: Auction[] = [
  {
    id: "opel-astra",
    title: "Opel Astra 1.6",
    year: 2011,
    km: 224000,
    currentBid: 34500,
    bids: 47,
    endsIn: "2 h 14 min",
    dealer: "Bazar Ostrava Poruba",
    photo:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "peugeot-308",
    title: "Peugeot 308 1.6 HDi",
    year: 2013,
    km: 198000,
    currentBid: 51000,
    bids: 62,
    endsIn: "6 h 02 min",
    dealer: "AutoCentrum Brno",
    photo:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "citroen-c4",
    title: "Citroën C4 Picasso",
    year: 2010,
    km: 267000,
    currentBid: 18200,
    bids: 29,
    endsIn: "1 d 3 h",
    dealer: "Autobazar Kolbenka",
    photo:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=70",
  },
];

export const bidFeed = [
  { user: "Jiří N.", amount: 34500, time: "před 12 s" },
  { user: "Marek P.", amount: 34000, time: "před 48 s" },
  { user: "Lucie K.", amount: 33000, time: "před 2 min" },
  { user: "Tomáš V.", amount: 31500, time: "před 4 min" },
];

/** Progrese poplatku podle stáří inzerátu: M1 základ, M2 +50 %, M3 +100 %. */
export const surchargeFactor = (ageMonths: number) =>
  ageMonths <= 1 ? 1 : ageMonths === 2 ? 1.5 : 2;
