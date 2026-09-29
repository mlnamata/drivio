import { useEffect, useRef } from "react";
import { PHOTO_FALLBACK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function CarImage({
  src,
  alt,
  className,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const fallback = (img: HTMLImageElement) => {
    if (img.src !== PHOTO_FALLBACK) img.src = PHOTO_FALLBACK;
  };
  // Obrázek mohl selhat ještě před hydratací (SSR) – onError by se pak nezavolal.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) fallback(img);
  }, [src]);
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={(e) => fallback(e.currentTarget)}
      className={cn("h-full w-full bg-muted object-cover", className)}
    />
  );
}
