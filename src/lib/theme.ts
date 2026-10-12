import { useSyncExternalStore } from "react";

/**
 * Světlý / tmavý vzhled webu. Volba se ukládá do localStorage, bez volby se řídí systémem.
 * Třídu `dark` na <html> nastaví už `themeScript` v hlavičce stránky, takže web při
 * načtení neproblikne světlou barvou; tady se jen přepíná a hlídá změna systému.
 */
export type ThemePref = "light" | "dark" | "system";
export type Theme = "light" | "dark";

const KEY = "drivio:theme";
const EVENT = "drivio:theme";
const QUERY = "(prefers-color-scheme: dark)";
/** Barva lišty prohlížeče na mobilu = barva hlavičky (--card). */
const BAR = { light: "#ffffff", dark: "#15171b" } as const;

export const themeScript = `(function(){try{var p=localStorage.getItem("${KEY}");var d=p==="dark"||(p!=="light"&&matchMedia("${QUERY}").matches);document.documentElement.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${BAR.dark}":"${BAR.light}")}catch(e){}})();`;

// Záloha pro prohlížeče se zakázaným úložištěm – volba pak platí do obnovení stránky.
let memory: ThemePref = "system";

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return memory;
  }
}

function resolve(pref: ThemePref): Theme {
  if (pref !== "system") return pref;
  return window.matchMedia(QUERY).matches ? "dark" : "light";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (root.classList.contains("dark") === (theme === "dark")) return;
  // Bez vypnutí přechodů by část prvků přebarvila plynule a část skokem.
  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(freeze);
  root.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR[theme]);
  void window.getComputedStyle(document.body).opacity;
  setTimeout(() => freeze.remove(), 1);
}

export function setThemePref(pref: ThemePref) {
  memory = pref;
  try {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch {
    /* úložiště nedostupné – zůstane v `memory` */
  }
  apply(resolve(pref));
  window.dispatchEvent(new Event(EVENT));
}

/** Hlídá změnu vzhledu v systému a volbu z jiné záložky. Volá se jednou v kořeni aplikace. */
export function initTheme() {
  const mq = window.matchMedia(QUERY);
  const sync = () => {
    apply(resolve(readPref()));
    window.dispatchEvent(new Event(EVENT));
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) sync();
  };
  mq.addEventListener("change", sync);
  window.addEventListener("storage", onStorage);
  sync();
  return () => {
    mq.removeEventListener("change", sync);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const snapshot = () => {
  const pref = readPref();
  return `${pref}:${document.documentElement.classList.contains("dark") ? "dark" : "light"}`;
};

export function useTheme() {
  // Na serveru vzhled neznáme; po hydrataci React přepočítá skutečný stav bez varování.
  const [pref, theme] = useSyncExternalStore(subscribe, snapshot, () => "system:light").split(
    ":",
  ) as [ThemePref, Theme];
  return {
    pref,
    theme,
    setPref: setThemePref,
    toggle: () => setThemePref(theme === "dark" ? "light" : "dark"),
  };
}
