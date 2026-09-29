/**
 * Lokální úložiště ukázkového provozu (localStorage). Díky němu se akce z administrace
 * okamžitě projeví na webu: přidaný vůz je ve výpisu, prodaný zmizí, aukce se vytvoří.
 * Po napojení Supabase se tyto akce nahradí zápisy do tabulek vehicles / auctions.
 */
import { useSyncExternalStore } from "react";
import {
  auctions as baseAuctions,
  vehicles as baseVehicles,
  type Auction,
  type Vehicle,
} from "./mock-data";
import type { ListingSearch } from "./search";

export type NewVehicle = Omit<Vehicle, "id" | "listedDays" | "status" | "top"> & {
  listedAt: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  search: ListingSearch;
  createdAt: string;
  email?: string;
};

type State = {
  added: (NewVehicle & { id: string })[];
  sold: string[];
  hidden: string[];
  auctioned: { vehicleId: string; createdAt: string }[];
  searches: SavedSearch[];
  bids: Record<string, { user: string; amount: number; at: string }[]>;
  prices: Record<string, number>;
  bidder: { name: string; email: string; acceptedAt: string } | null;
};

const KEY = "drivio:demo-v1";
const EVENT = "drivio:store";
const EMPTY: State = {
  added: [],
  sold: [],
  hidden: [],
  auctioned: [],
  searches: [],
  bids: {},
  prices: {},
  bidder: null,
};

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let cache: State | null = null;
const snapshot = () => (cache ??= read());
const serverSnapshot = () => EMPTY;

function subscribe(cb: () => void) {
  const handler = () => {
    cache = null;
    cb();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function write(update: (s: State) => State) {
  const next = update(read());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode – změna platí jen do obnovení stránky */
  }
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

export const useStore = () => useSyncExternalStore(subscribe, snapshot, serverSnapshot);

const daysSince = (iso: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

/** Všechny vozy (základní + přidané) s aktuálním stavem. */
export function allVehicles(s: State): Vehicle[] {
  const added: Vehicle[] = s.added.map(({ listedAt, ...v }) => ({
    ...v,
    listedDays: daysSince(listedAt),
    top: false,
    status: "active",
  }));
  const auctioned = new Set(s.auctioned.map((a) => a.vehicleId));
  return [...added, ...baseVehicles].map((v) => ({
    ...v,
    price: s.prices[v.id] ?? v.price,
    status: s.sold.includes(v.id) ? "sold" : auctioned.has(v.id) ? "in_auction" : v.status,
  }));
}

/** Vozy viditelné ve veřejném výpisu (aktivní). */
export function useVehicles() {
  const s = useStore();
  return allVehicles(s).filter((v) => v.status === "active" && !s.hidden.includes(v.id));
}

export function useAllVehicles() {
  return allVehicles(useStore());
}

export type LiveAuction = Auction & { ended: boolean; myBest: number | null; leading: boolean };

export function useAuctions(): LiveAuction[] {
  const s = useStore();
  const created: Auction[] = s.auctioned.map((a) => ({
    id: `a-${a.vehicleId}`,
    vehicleId: a.vehicleId,
    startPrice: 1,
    currentBid: 0,
    bids: 0,
    endsInMinutes: Math.max(
      1,
      7 * 24 * 60 - Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 60_000),
    ),
    minIncrement: 500,
    buyerFeeRate: 0.04,
  }));
  return [...created, ...baseAuctions]
    .filter((a) => !s.sold.includes(a.vehicleId) || a.endsInMinutes < 0)
    .map((a) => {
      const mine = s.bids[a.id] ?? [];
      const myBest = mine.length ? Math.max(...mine.map((b) => b.amount)) : null;
      const current = Math.max(a.currentBid, myBest ?? 0);
      return {
        ...a,
        currentBid: current,
        bids: a.bids + mine.length,
        ended: a.endsInMinutes <= 0,
        myBest,
        leading: myBest !== null && myBest >= current,
      };
    });
}

export const store = {
  addVehicle(v: NewVehicle) {
    const id = `${v.brand}-${v.model}-${Date.now().toString(36)}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    write((s) => ({ ...s, added: [{ ...v, id }, ...s.added] }));
    return id;
  },
  setPrice(id: string, price: number) {
    write((s) => ({ ...s, prices: { ...s.prices, [id]: price } }));
  },
  removeAdded(id: string) {
    write((s) => ({ ...s, added: s.added.filter((v) => v.id !== id) }));
  },
  markSold(id: string) {
    write((s) => ({ ...s, sold: s.sold.includes(id) ? s.sold : [...s.sold, id] }));
  },
  sendToAuction(id: string) {
    write((s) =>
      s.auctioned.some((a) => a.vehicleId === id)
        ? s
        : {
            ...s,
            auctioned: [...s.auctioned, { vehicleId: id, createdAt: new Date().toISOString() }],
          },
    );
  },
  toggleHidden(id: string) {
    write((s) => ({
      ...s,
      hidden: s.hidden.includes(id) ? s.hidden.filter((x) => x !== id) : [...s.hidden, id],
    }));
  },
  saveSearch(name: string, search: ListingSearch, email?: string) {
    const entry: SavedSearch = {
      id: Date.now().toString(36),
      name,
      search,
      createdAt: new Date().toISOString(),
      ...(email ? { email } : {}),
    };
    write((s) => ({ ...s, searches: [entry, ...s.searches] }));
  },
  removeSearch(id: string) {
    write((s) => ({ ...s, searches: s.searches.filter((x) => x.id !== id) }));
  },
  addBid(auctionId: string, user: string, amount: number) {
    write((s) => ({
      ...s,
      bids: {
        ...s.bids,
        [auctionId]: [
          { user, amount, at: new Date().toISOString() },
          ...(s.bids[auctionId] ?? []),
        ].slice(0, 50),
      },
    }));
  },
  registerBidder(name: string, email: string) {
    write((s) => ({ ...s, bidder: { name, email, acceptedAt: new Date().toISOString() } }));
  },
  reset() {
    write(() => EMPTY);
  },
};
