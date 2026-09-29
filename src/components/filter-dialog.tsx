import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ListingFilters } from "@/components/listing-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { num, sellerOf } from "@/lib/mock-data";
import { cleanSearch, filterVehicles, type ListingSearch } from "@/lib/search";
import { useVehicles } from "@/lib/store";

/**
 * Vyskakovací okno se všemi filtry. Změny se nejdřív jen „zkoušejí" (živý počet vozů),
 * použijí se až tlačítkem „Zobrazit X vozů".
 */
import { cars } from "@/lib/utils";

export function FilterDialog({
  value,
  onApply,
  trigger,
  activeCount = 0,
}: {
  value: ListingSearch;
  onApply: (next: ListingSearch) => void;
  trigger?: ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListingSearch>(value);
  const source = useVehicles();
  useEffect(() => {
    if (open) setDraft(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const count = useMemo(
    () => filterVehicles(source, draft, (v) => sellerOf(v).region).length,
    [source, draft],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary/50"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Všechny filtry
            {activeCount ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:rounded-3xl">
        <div className="border-b border-border px-6 py-4">
          <DialogTitle className="text-xl font-bold">Filtry</DialogTitle>
          <DialogDescription>Počet vozů se přepočítává hned při výběru.</DialogDescription>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ListingFilters
            variant="popup"
            value={draft}
            onChange={(patch) => setDraft((d) => cleanSearch({ ...d, ...patch }))}
            onReset={() => setDraft(draft.category ? { category: draft.category } : {})}
          />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={() => setDraft(draft.category ? { category: draft.category } : {})}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Zrušit vše
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(cleanSearch({ ...draft, page: undefined }));
              setOpen(false);
            }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            Zobrazit {cars(count)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
