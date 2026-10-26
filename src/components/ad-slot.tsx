import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reklamní plocha. S nastaveným VITE_ADSENSE_CLIENT (a souhlasem s cookies) vykreslí
 * Google AdSense, jinak nic. Formáty odpovídají ceníku na stránce /reklama.
 */
export type AdFormat = "leaderboard" | "rectangle" | "infeed";

const sizes: Record<AdFormat, string> = {
  leaderboard: "min-h-[90px] md:min-h-[110px]",
  rectangle: "min-h-[250px]",
  infeed: "min-h-[260px]",
};

const ADSENSE_CLIENT = import.meta.env["VITE_ADSENSE_CLIENT"] as string | undefined;
const ADSENSE_SLOTS: Partial<Record<AdFormat, string | undefined>> = {
  leaderboard: import.meta.env["VITE_ADSENSE_SLOT_LEADERBOARD"] as string | undefined,
  rectangle: import.meta.env["VITE_ADSENSE_SLOT_RECTANGLE"] as string | undefined,
  infeed: import.meta.env["VITE_ADSENSE_SLOT_INFEED"] as string | undefined,
};

function hasAdConsent() {
  try {
    const raw = window.localStorage.getItem("drivio:cookie-consent");
    return raw ? (JSON.parse(raw) as { value: string }).value === "all" : false;
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ format, className }: { format: AdFormat; className?: string }) {
  const [live, setLive] = useState(false);
  const pushed = useRef(false);
  const slot = ADSENSE_SLOTS[format];

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || !hasAdConsent()) return;
    if (!document.querySelector("script[data-adsense]")) {
      const s = document.createElement("script");
      s.async = true;
      s.dataset["adsense"] = "1";
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(s);
    }
    setLive(true);
  }, [slot]);

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      /* blokátor reklam */
    }
  }, [live]);

  if (live && ADSENSE_CLIENT && slot) {
    return (
      <div className={cn("overflow-hidden", sizes[format], className)} aria-label="Reklama">
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Prázdná plocha by ve výpisu vypadala jako chyba; nabídka reklamy je odkazem v patičce.
  return null;
}
