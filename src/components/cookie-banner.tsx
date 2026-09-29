import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const KEY = "drivio:cookie-consent";

/** Jednoduchá cookie lišta (GDPR / ePrivacy) – analytika jen po souhlasu. */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(!window.localStorage.getItem(KEY));
    } catch {
      setShow(false);
    }
  }, []);

  const decide = (value: "all" | "necessary") => {
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ value, at: new Date().toISOString(), version: 1 }),
      );
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl">
      <div className="glass flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:gap-4 md:p-5">
        <p className="flex-1 text-xs text-foreground/80 md:text-sm">
          Používáme nezbytné cookies pro chod webu a s vaším souhlasem i analytické cookies.{" "}
          <Link
            to="/pravni/cookies"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Více informací
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => decide("necessary")}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/40"
          >
            Jen nezbytné
          </button>
          <button
            onClick={() => decide("all")}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
