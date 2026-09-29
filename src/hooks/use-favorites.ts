import { useCallback, useSyncExternalStore } from "react";

const KEY = "drivio:favorites";
const EVENT = "drivio:favorites";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
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

/** Oblíbené vozy – per-prohlížeč; po přihlášení se synchronizují do tabulky `favorites`. */
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
