import { cn } from "@/lib/utils";

/**
 * Značka Drivio: písmeno „D", jehož dřík je přerušovaná dělicí čára silnice –
 * pohyb, cesta, rychlý prodej. Jednobarevné, funguje i v 16 px.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8 text-primary", className)}>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M11 8.5h5a7.5 7.5 0 0 1 0 15h-5"
        fill="none"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 8.5v15"
        fill="none"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="3.4 4.4"
      />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.35rem] font-extrabold lowercase tracking-[-0.04em]",
          light ? "text-white" : "text-foreground",
        )}
      >
        drivio
      </span>
    </span>
  );
}
