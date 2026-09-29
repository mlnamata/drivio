import {
  dealerById,
  monthOfListing,
  perVehicleFee,
  planById,
  slotSurcharge,
  surchargeFactor,
  vehicles,
  type PlanId,
  type Vehicle,
} from "./mock-data";
import { allVehicles, useStore } from "./store";

export type SlotLine = {
  vehicle: Vehicle;
  month: number;
  base: number;
  progression: number;
  surcharge: number;
  total: number;
  stale: boolean;
};

/** Stejná logika jako Edge Function `billing-processor` (supabase/functions). */
export function dealerBilling(
  dealerId: string,
  source: Vehicle[] = vehicles,
  planOverride?: PlanId,
) {
  const dealer = dealerById(dealerId);
  const plan = planById(planOverride ?? dealer.plan);
  const payg = plan.id === "payg";
  // Sloty zabírají aktivní vozy a vozy v aukci (v aukci se neúčtuje progrese).
  const mine = source.filter((v) => v.dealerId === dealerId && v.status !== "sold");
  const lines: SlotLine[] = mine.map((v) => {
    const month = monthOfListing(v);
    const inAuction = v.status === "in_auction";
    if (payg) {
      const base = perVehicleFee(v.price, 1);
      const progression = inAuction ? 0 : perVehicleFee(v.price, month) - base;
      return {
        vehicle: v,
        month,
        base,
        progression,
        surcharge: 0,
        total: base + progression,
        stale: !inAuction && month >= 4,
      };
    }
    const progression = inAuction ? 0 : Math.round(plan.perSlot * (surchargeFactor(month) - 1));
    const surcharge = slotSurcharge(plan, v.price);
    return {
      vehicle: v,
      month,
      base: plan.perSlot,
      progression,
      surcharge,
      total: plan.perSlot + progression + surcharge,
      stale: !inAuction && month >= 4,
    };
  });
  const extras = lines.reduce((s, l) => s + l.progression + l.surcharge, 0);
  const total = payg ? lines.reduce((s, l) => s + l.total, 0) : plan.price + extras;
  return { dealer, plan, payg, lines, used: mine.length, extras, total };
}

/** Vyúčtování autobazaru s aktuálními vozy a zvoleným tarifem z ukázkového úložiště. */
export function useDealerBilling(dealerId: string) {
  const s = useStore();
  return dealerBilling(dealerId, allVehicles(s), s.dealerPlans[dealerId]);
}

export const CURRENT_DEALER = "kolbenka";

export const invoices = [
  {
    id: "2026-0931",
    period: "Září 2026",
    issued: "1. 10. 2026",
    due: "15. 10. 2026",
    amount: 3289,
    status: "unpaid" as const,
  },
  {
    id: "2026-0812",
    period: "Srpen 2026",
    issued: "1. 9. 2026",
    due: "15. 9. 2026",
    amount: 2987,
    status: "paid" as const,
  },
  {
    id: "2026-0703",
    period: "Červenec 2026",
    issued: "1. 8. 2026",
    due: "15. 8. 2026",
    amount: 3410,
    status: "paid" as const,
  },
  {
    id: "2026-0611",
    period: "Červen 2026",
    issued: "1. 7. 2026",
    due: "15. 7. 2026",
    amount: 2490,
    status: "paid" as const,
  },
];

export const leadsSample = [
  {
    id: "L-10482",
    kind: "dealer_contact" as const,
    name: "Jan Novák",
    contact: "jan.novak@email.cz",
    vehicleId: "skoda-superb-20",
    at: "dnes 9:14",
    status: "new" as const,
  },
  {
    id: "L-10477",
    kind: "financing" as const,
    name: "Petra Svobodová",
    contact: "+420 777 555 111",
    vehicleId: "vw-golf-15",
    at: "dnes 8:02",
    status: "sent" as const,
    partner: "Essox",
  },
  {
    id: "L-10461",
    kind: "dealer_contact" as const,
    name: "Martin Dvořák",
    contact: "m.dvorak@seznam.cz",
    vehicleId: "hyundai-i30-19",
    at: "včera 17:40",
    status: "replied" as const,
  },
  {
    id: "L-10455",
    kind: "financing" as const,
    name: "Lucie Černá",
    contact: "+420 603 999 000",
    vehicleId: "mazda-cx5-18",
    at: "včera 14:21",
    status: "approved" as const,
    partner: "Cofidis",
  },
  {
    id: "L-10432",
    kind: "financing" as const,
    name: "Tomáš Procházka",
    contact: "+420 721 000 222",
    vehicleId: "opel-astra-13",
    at: "27. 9.",
    status: "rejected" as const,
    partner: "Home Credit",
  },
];
