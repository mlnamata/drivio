import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DetailedFilters } from "@/components/listing-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { activeFilterCount, cleanSearch, filterVehicles, type ListingSearch } from "@/lib/search";
import { useVehicles } from "@/lib/store";
import { cars, cn } from "@/lib/utils";

/**
 * Podrobné hledání ve vyskakovacím okně. Změny se nejdřív jen zkoušejí (živý počet vozů),
 * použijí se až tlačítkem „Zobrazit X vozů“.
 */
export function FilterDialog({
  value,
  onApply,
  trigger,
}: {
  value: ListingSearch;
  onApply: (next: ListingSearch) => void;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListingSearch>(value);
  const source = useVehicles();
  useEffect(() => {
    if (open) setDraft(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const count = useMemo(() => filterVehicles(source, draft).length, [source, draft]);
  const active = activeFilterCount(value);
  const draftActive = activeFilterCount(draft);
  const clear = () => setDraft(draft.category ? { category: draft.category } : {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground/30"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Podrobné hledání
            {active ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {active}
              </span>
            ) : null}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-6xl flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[92vh] sm:w-[calc(100vw-2rem)] sm:rounded-2xl">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <DialogTitle className="text-xl font-bold">Podrobné hledání</DialogTitle>
          <DialogDescription>
            Všechny parametry vozu. Počet odpovídajících vozů se přepočítává hned.
          </DialogDescription>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <DetailedFilters
            value={draft}
            onChange={(patch) => setDraft((d) => cleanSearch({ ...d, ...patch }))}
            onReset={clear}
          />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={clear}
            disabled={!draftActive}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Zrušit vše{draftActive ? ` (${draftActive})` : ""}
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(cleanSearch({ ...draft, page: undefined }));
              setOpen(false);
            }}
            className={cn(
              "rounded-lg px-6 py-3 text-sm font-bold transition-colors",
              count
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {count ? `Zobrazit ${cars(count)}` : "Žádný vůz neodpovídá"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
