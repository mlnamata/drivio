/**
 * Lokální úložiště ukázkového provozu (localStorage). Díky němu se akce z administrace
 * okamžitě projeví na webu: přidaný vůz je ve výpisu, prodaný zmizí, aukce se vytvoří.
 * Po napojení Supabase se tyto akce nahradí zápisy do tabulek vehicles / auctions.
 */
import { useSyncExternalStore } from "react";
import {
  auctions as baseAuctions,
  vehicles as baseVehicles,
  DEMO_MODE,
  type Auction,
  type PlanId,
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
  reminders: string[];
  compare: string[];
  compareLog: { ids: string[]; winner: string; at: string }[];
  dealerPlans: Record<string, PlanId>;
};

const KEY = "drivio:demo-v1";
export const MAX_COMPARE = 4;
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
  reminders: [],
  compare: [],
  compareLog: [],
  dealerPlans: {},
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

/** Změna stavu zvenčí (synchronizace se Supabase). */
export function patchStore(update: (s: State) => State) {
  write(update);
}

/** Zápisy do Supabase – zaregistruje je src/lib/remote.ts, když je Supabase nastavený. */
export type RemoteHandlers = {
  addVehicle: (v: NewVehicle & { id: string }) => Promise<void>;
  setPrice: (id: string, price: number) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  markSold: (id: string) => Promise<void>;
  sendToAuction: (id: string) => Promise<void>;
  setHidden: (id: string, hidden: boolean) => Promise<void>;
  setDealerPlan: (dealerId: string, plan: PlanId) => Promise<void>;
};
let remote: RemoteHandlers | null = null;
export const setRemote = (r: RemoteHandlers) => {
  remote = r;
};
export const isRemote = () => remote !== null;

let remoteReady = false;
/** Zavolá remote.ts po prvním načtení dat z databáze. */
export function markRemoteReady() {
  remoteReady = true;
  // Nový objekt stavu – jinak by React (useSyncExternalStore) neviděl změnu a nepřekreslil.
  write((s) => ({ ...s }));
}
/** true = data jsou k dispozici (ukázkový režim nebo načteno z databáze). */
export function useDataReady() {
  useStore();
  return DEMO_MODE || remoteReady;
}
const run = (p: Promise<void> | undefined) =>
  p?.catch((e: unknown) => {
    console.error(e);
    window.dispatchEvent(
      new CustomEvent("drivio:remote-error", {
        detail: e instanceof Error ? e.message : String(e),
      }),
    );
  });

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
  const baseIds = new Set(baseVehicles.map((v) => v.id));
  return [...added.filter((v) => !baseIds.has(v.id)), ...baseVehicles].map((v) => ({
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

export type LiveAuction = Auction & {
  ended: boolean;
  upcoming: boolean;
  myBest: number | null;
  leading: boolean;
  reminded: boolean;
};

export function useAuctions(): LiveAuction[] {
  const s = useStore();
  // Vůz přesunutý do aukce nejdřív 24 h čeká v galerii připravovaných, pak běží 7 dní.
  const created: Auction[] = s.auctioned.map((a) => {
    const elapsed = Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 60_000);
    const startsIn = 24 * 60 - elapsed;
    return {
      id: `a-${a.vehicleId}`,
      vehicleId: a.vehicleId,
      startPrice: 1,
      currentBid: 0,
      bids: 0,
      startsInMinutes: startsIn,
      endsInMinutes: Math.max(1, startsIn + 7 * 24 * 60),
      minIncrement: 500,
      buyerFeeRate: 0.04,
    };
  });
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
        upcoming: (a.startsInMinutes ?? 0) > 0,
        reminded: s.reminders.includes(a.id),
        myBest,
        leading: myBest !== null && myBest >= current,
      };
    });
}

export const store = {
  addVehicle(v: NewVehicle) {
    const id = remote
      ? crypto.randomUUID()
      : `${v.brand}-${v.model}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9-]/g, "");
    write((s) => ({ ...s, added: [{ ...v, id }, ...s.added] }));
    void run(remote?.addVehicle({ ...v, id }));
    return id;
  },
  setPrice(id: string, price: number) {
    write((s) => ({ ...s, prices: { ...s.prices, [id]: price } }));
    void run(remote?.setPrice(id, price));
  },
  removeAdded(id: string) {
    write((s) => ({ ...s, added: s.added.filter((v) => v.id !== id) }));
    void run(remote?.removeVehicle(id));
  },
  markSold(id: string) {
    write((s) => ({ ...s, sold: s.sold.includes(id) ? s.sold : [...s.sold, id] }));
    void run(remote?.markSold(id));
  },
  sendToAuction(id: string) {
    // S databází vznikne aukce v tabulce auctions (načte se synchronizací).
    if (remote) return void run(remote.sendToAuction(id));
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
    void run(remote?.setHidden(id, !read().hidden.includes(id)));
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
  toggleReminder(auctionId: string) {
    write((s) => ({
      ...s,
      reminders: s.reminders.includes(auctionId)
        ? s.reminders.filter((x) => x !== auctionId)
        : [...s.reminders, auctionId],
    }));
  },
  /** Porovnání – max. 4 vozy. Vrací false, když je plno. */
  toggleCompare(id: string) {
    const cur = read().compare;
    if (!cur.includes(id) && cur.length >= MAX_COMPARE) return false;
    write((s) => ({
      ...s,
      compare: s.compare.includes(id) ? s.compare.filter((x) => x !== id) : [...s.compare, id],
    }));
    return true;
  },
  clearCompare() {
    write((s) => ({ ...s, compare: [] }));
  },
  /** Interní záznam vyhodnocení porovnání (zákazníkovi se nezobrazuje). */
  logComparison(ids: string[], winner: string) {
    write((s) => ({
      ...s,
      compareLog: [{ ids, winner, at: new Date().toISOString() }, ...s.compareLog].slice(0, 200),
    }));
  },
  setDealerPlan(dealerId: string, plan: PlanId) {
    write((s) => ({ ...s, dealerPlans: { ...s.dealerPlans, [dealerId]: plan } }));
    void run(remote?.setDealerPlan(dealerId, plan));
  },
  registerBidder(name: string, email: string) {
    write((s) => ({ ...s, bidder: { name, email, acceptedAt: new Date().toISOString() } }));
  },
  reset() {
    write(() => EMPTY);
  },
};
