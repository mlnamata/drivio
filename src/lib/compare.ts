/**
 * Interní vyhodnocení porovnávaných vozů. Zákazníkovi se NEZOBRAZUJE – slouží pro
 * analytiku (které nabídky v porovnání vyhrávají) a pro doporučování v budoucnu.
 */
import { priceRating, type Vehicle } from "./mock-data";

const toneScore = { great: 1, good: 0.75, fair: 0.45, high: 0.15 } as const;

export type Evaluation = { id: string; score: number; parts: Record<string, number> };

export function evaluateVehicles(list: Vehicle[]): {
  ranking: Evaluation[];
  winnerId: string | null;
} {
  if (list.length < 2) return { ranking: [], winnerId: null };
  const maxEq = Math.max(1, ...list.map((v) => v.equipment.length));
  const minKmPerYear = Math.min(...list.map((v) => v.km / Math.max(1, 2026 - v.year)));
  const ranking = list
    .map((v) => {
      const age = Math.max(1, 2026 - v.year);
      const kmPerYear = v.km / age;
      const parts = {
        price: toneScore[priceRating(v).tone] * 30,
        age: Math.max(0, 1 - age / 15) * 15,
        km: Math.max(0, 1 - v.km / 300_000) * 15,
        usage: (minKmPerYear / Math.max(kmPerYear, 1)) * 5,
        equipment: (v.equipment.length / maxEq) * 15,
        history:
          (v.cebiaVerified ? 6 : 0) +
          (v.serviceBook ? 4 : 0) +
          (v.accidentFree ? 5 : 0) +
          (v.firstOwner ? 2 : 0),
        seller: v.dealerId === "private" ? 1 : 3,
      };
      const score = Object.values(parts).reduce((a, b) => a + b, 0);
      return { id: v.id, score: Math.round(score * 10) / 10, parts };
    })
    .sort((a, b) => b.score - a.score);
  return { ranking, winnerId: ranking[0]?.id ?? null };
}
