import { Calculator } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { listingCostToDate, monthlyListingCost } from "@/lib/billing";
import { commissionFor, czk, type Plan, type Vehicle } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Kalkulačka nákladů a marže pro autobazar u konkrétního vozu – ukazuje, kolik vůz
 * stojí na inzerci dosud, kolik bude stát další měsíc a jaká zbude marže po prodeji.
 */
export function CostCalculatorDialog({
  vehicle: v,
  plan,
  month,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle;
  plan: Plan;
  month: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [purchase, setPurchase] = useState(Math.round((v.price * 0.82) / 1000) * 1000);
  const [prep, setPrep] = useState(5000);
  const [sale, setSale] = useState(v.price);

  const soFar = listingCostToDate(plan, v.price, month);
  const nextMonth = monthlyListingCost(plan, v.price, month + 1);
  const commission = commissionFor(sale);
  const marginNow = sale - purchase - prep - soFar - commission;
  const marginNext = sale - purchase - prep - soFar - nextMonth - commission;

  const Row = ({
    k,
    val,
    strong,
    tone,
  }: {
    k: string;
    val: number;
    strong?: boolean;
    tone?: "neg" | "pos";
  }) => (
    <div
      className={cn(
        "flex justify-between gap-4 py-1.5 text-sm",
        strong && "border-t border-border pt-2.5 font-bold",
      )}
    >
      <span className={strong ? "" : "text-muted-foreground"}>{k}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "neg" && "text-destructive",
          tone === "pos" && "text-success",
        )}
      >
        {czk(val)}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" /> Náklady a marže
        </DialogTitle>
        <DialogDescription>
          {v.year} · inzerováno {v.listedDays} dní ({month}. měsíc) · tarif {plan.name}
        </DialogDescription>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["Nákupní cena", purchase, setPurchase],
              ["Příprava / servis", prep, setPrep],
              ["Prodejní cena", sale, setSale],
            ] as const
          ).map(([l, val, set]) => (
            <label key={l} className="text-xs text-muted-foreground">
              {l}
              <input
                type="number"
                min={0}
                step={1000}
                value={val}
                onChange={(e) => set(Number(e.target.value) || 0)}
                className="field mt-1 px-2 py-2 text-sm font-semibold text-foreground"
              />
            </label>
          ))}
        </div>
        <div className="rounded-2xl bg-muted p-4">
          <Row k="Inzerce dosud (od vložení)" val={soFar} />
          <Row k={`Provize z prodeje`} val={commission} />
          <Row
            k="Marže při prodeji tento měsíc"
            val={marginNow}
            strong
            tone={marginNow >= 0 ? "pos" : "neg"}
          />
        </div>
        <div className="rounded-2xl border border-border p-4">
          <Row k={`Inzerce ${month + 1}. měsíc navíc`} val={nextMonth} />
          <Row
            k="Marže, pokud se prodá až příští měsíc"
            val={marginNext}
            strong
            tone={marginNext >= 0 ? "pos" : "neg"}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Každý další měsíc inzerce zdražuje (2. měsíc +50 %, od 3. měsíce +100 %). Pokud se vůz
            neprodává, zvažte snížení ceny nebo přesun do aukce – progrese za měsíc aukce se
            neúčtuje.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
