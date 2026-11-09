import { useCallback, useSyncExternalStore } from "react";

const KEY = "drivio:favorites";
const EVENT = "drivio:favorites";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    // Poškozený nebo starý záznam nesmí shodit stránku.
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

let cache: string[] | null = null;
const snapshot = () => (cache ??= read());
const EMPTY: string[] = [];
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

/** Oblíbené vozy – ukládají se v tomto prohlížeči (tabulka `favorites` je připravená v databázi). */
export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const toggle = useCallback((id: string) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode – ignorovat */
    }
    cache = next;
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
