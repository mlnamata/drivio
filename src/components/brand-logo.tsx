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
  // Loga jsou kreslená pro světlé pozadí – v tmavém vzhledu dostanou světlou podložku.
  return (
    <img
      src={brandLogo(slug)}
      alt={`${name} logo`}
      loading="lazy"
      width={64}
      height={64}
      className={cn("h-10 w-10 rounded-md object-contain dark:bg-logo-plate dark:p-1", className)}
    />
  );
}
