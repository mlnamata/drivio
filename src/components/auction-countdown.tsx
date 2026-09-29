import { useEffect, useState } from "react";

function fmt(ms: number) {
  if (ms <= 0) return "Ukončeno";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d} d ${h} h ${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min ${String(sec).padStart(2, "0")} s`;
}

/** Odpočet – čas konce se určí až na klientu, aby nevznikl rozdíl při hydrataci. */
export function AuctionCountdown({ minutes }: { minutes: number }) {
  const [end, setEnd] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const start = Date.now();
    setEnd(start + minutes * 60_000);
    setNow(start);
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [minutes]);
  if (end === null)
    return (
      <span>
        {minutes >= 1440 ? `${Math.floor(minutes / 1440)} d` : `${Math.floor(minutes / 60)} h`}
      </span>
    );
  const left = end - now;
  // Posledních 5 minut: výrazně červeně a pulzuje.
  const urgent = left > 0 && left < 5 * 60_000;
  return (
    <span
      className={urgent ? "animate-pulse font-bold tabular-nums text-destructive" : "tabular-nums"}
    >
      {fmt(left)}
    </span>
  );
}
