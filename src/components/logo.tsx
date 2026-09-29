import { cn } from "@/lib/utils";

/**
 * Oficiální logo Drivio (3D wordmark, černá + oranžová) – pro světlá pozadí.
 * Zdroj: public/brand/drivio-logo-original.png, průhledná verze drivio-logo.webp.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/drivio-logo.webp"
      alt="Drivio"
      width={633}
      height={160}
      className={cn("h-8 w-auto select-none", className)}
      draggable={false}
    />
  );
}

/** Plochá verze wordmarku pro tmavá pozadí (administrace). */
export function LogoFlat({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-logo inline-flex items-baseline text-[1.6rem] font-black uppercase italic leading-none tracking-[-0.03em]",
        className,
      )}
      aria-label="Drivio"
    >
      <span className="text-white">DRıVı</span>
      <span className="text-primary">O</span>
    </span>
  );
}

/** Symbol – oranžové „O" z loga. Favicon a malé plochy. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8", className)}>
      <rect width="32" height="32" rx="8" fill="#1f1e1d" />
      <g transform="translate(16 16) skewX(-14)">
        <rect
          x="-10"
          y="-8"
          width="20"
          height="16"
          rx="8"
          fill="none"
          stroke="#ea7930"
          strokeWidth="4.2"
        />
      </g>
    </svg>
  );
}
