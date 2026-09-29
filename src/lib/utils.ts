import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** České skloňování podle počtu: plural(1, "vůz", "vozy", "vozů") → "vůz". */
export function plural(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}

/** „1 vůz“, „3 vozy“, „12 vozů“. */
export const cars = (n: number) =>
  `${n.toLocaleString("cs-CZ")} ${plural(n, "vůz", "vozy", "vozů")}`;
