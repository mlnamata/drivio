import { brandLogo } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function BrandLogo({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <img
      src={brandLogo(slug)}
      alt={`${name} logo`}
      loading="lazy"
      width={64}
      height={64}
      className={cn("h-10 w-10 object-contain", className)}
    />
  );
}
