import { cn } from "@/lib/utils";

/**
 * Vlastní fajfka pro seznamy výbavy a tarifů. Kreslená ve stejné tloušťce jako ikony
 * Lucide, ale s kratším levým ramenem – připomíná odškrtnutí v předávacím protokolu.
 */
export function Tick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}
