import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, GitCompareArrows, Minus, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { bodyTypes, colors, drives, equipment, fuels, gearboxes, labelOf } from "@/lib/catalog";
import { evaluateVehicles } from "@/lib/compare";
import {
  czk,
  monthlyPayment,
  num,
  priceRating,
  sellerOf,
  vehicleTitle,
  type Vehicle,
} from "@/lib/mock-data";
import { store, useAllVehicles, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/porovnani")({
  head: () => ({
    meta: [{ title: "Porovnání vozů | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: Compare,
});

type Row = { label: string; value: (v: Vehicle) => ReactNode; raw: (v: Vehicle) => string };

const yes = (b: boolean) =>
  b ? (
    <Check className="h-4 w-4 text-success" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground" />
  );

const groups: { title: string; rows: Row[] }[] = [
  {
    title: "Cena",
    rows: [
      { label: "Cena", value: (v) => <strong>{czk(v.price)}</strong>, raw: (v) => String(v.price) },
      {
        label: "Splátka od",
        value: (v) => `${czk(monthlyPayment(v.price))}/měs.`,
        raw: (v) => String(monthlyPayment(v.price)),
      },
      {
        label: "Hodnocení ceny",
        value: (v) => priceRating(v).label,
        raw: (v) => priceRating(v).label,
      },
      {
        label: "Odpočet DPH",
        value: (v) => yes(v.vatDeductible),
        raw: (v) => String(v.vatDeductible),
      },
    ],
  },
  {
    title: "Základní údaje",
    rows: [
      { label: "Rok výroby", value: (v) => v.year, raw: (v) => String(v.year) },
      { label: "Najeto", value: (v) => `${num(v.km)} km`, raw: (v) => String(v.km) },
      {
        label: "Najeto za rok",
        value: (v) => `${num(Math.round(v.km / Math.max(1, 2026 - v.year)))} km`,
        raw: (v) => String(Math.round(v.km / Math.max(1, 2026 - v.year))),
      },
      { label: "Palivo", value: (v) => labelOf(fuels, v.fuel), raw: (v) => v.fuel },
      { label: "Převodovka", value: (v) => labelOf(gearboxes, v.gearbox), raw: (v) => v.gearbox },
      {
        label: "Výkon",
        value: (v) => (v.powerKw ? `${v.powerKw} kW (${Math.round(v.powerKw * 1.36)} k)` : "—"),
        raw: (v) => String(v.powerKw),
      },
      {
        label: "Objem motoru",
        value: (v) => (v.engineCcm ? `${num(v.engineCcm)} cm³` : "—"),
        raw: (v) => String(v.engineCcm),
      },
      { label: "Karoserie", value: (v) => labelOf(bodyTypes, v.body), raw: (v) => v.body },
      { label: "Pohon", value: (v) => labelOf(drives, v.drive), raw: (v) => v.drive },
      { label: "Barva", value: (v) => labelOf(colors, v.color), raw: (v) => v.color },
      {
        label: "Dveře / místa",
        value: (v) => `${v.doors} / ${v.seats}`,
        raw: (v) => `${v.doors}/${v.seats}`,
      },
    ],
  },
  {
    title: "Historie a stav",
    rows: [
      {
        label: "Ověřeno Cebia",
        value: (v) => yes(v.cebiaVerified),
        raw: (v) => String(v.cebiaVerified),
      },
      {
        label: "Servisní knížka",
        value: (v) => yes(v.serviceBook),
        raw: (v) => String(v.serviceBook),
      },
      {
        label: "Nehavarované",
        value: (v) => yes(v.accidentFree),
        raw: (v) => String(v.accidentFree),
      },
      { label: "První majitel", value: (v) => yes(v.firstOwner), raw: (v) => String(v.firstOwner) },
      { label: "Původ", value: (v) => (v.origin === "cz" ? "ČR" : "Dovoz"), raw: (v) => v.origin },
      { label: "Prodejce", value: (v) => sellerOf(v).name, raw: (v) => sellerOf(v).name },
    ],
  },
  {
    title: "Výbava",
    rows: equipment.map((e) => ({
      label: e.label,
      value: (v: Vehicle) => yes(v.equipment.includes(e.value)),
      raw: (v: Vehicle) => String(v.equipment.includes(e.value)),
    })),
  },
];

function Compare() {
  const { compare } = useStore();
  const all = useAllVehicles();
  const list = compare.map((id) => all.find((v) => v.id === id)).filter((v): v is Vehicle => !!v);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const key = list.map((v) => v.id).join(",");

  // Interní vyhodnocení – uloží se pro správu portálu, zákazník ho nevidí.
  useEffect(() => {
    if (list.length < 2) return;
    const { winnerId } = evaluateVehicles(list);
    if (winnerId)
      store.logComparison(
        list.map((v) => v.id),
        winnerId,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Porovnání vozů" }]} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Porovnání vozů</h1>
            <p className="mt-1 text-muted-foreground">
              Cena, rok, nájezd, historie i výbava vedle sebe. Porovnat lze až 4 vozy.
            </p>
          </div>
          {list.length ? (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={onlyDiff}
                  onChange={(e) => setOnlyDiff(e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Jen rozdíly
              </label>
              <button
                onClick={() => store.clearCompare()}
                className="text-sm font-semibold text-destructive"
              >
                Vymazat vše
              </button>
            </div>
          ) : null}
        </div>

        {list.length < 2 ? (
          <div className="surface-card mt-8 p-12 text-center">
            <GitCompareArrows className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">
              {list.length === 1 ? "Přidejte ještě alespoň jeden vůz" : "Zatím nic neporovnáváte"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              U vozu ve výpisu klikněte na ikonu porovnání.
            </p>
            <Link
              to="/inzeraty"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Vybrat vozy
            </Link>
          </div>
        ) : (
          <div className="surface-card mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed text-sm">
              <colgroup>
                <col className="w-48" />
                {list.map((v) => (
                  <col key={v.id} />
                ))}
              </colgroup>
              <thead>
                <tr className="align-top">
                  <th className="sticky left-0 bg-card p-4" />
                  {list.map((v) => (
                    <th key={v.id} className="p-4 text-left font-normal">
                      <div className="relative">
                        <Link
                          to="/inzerat/$id"
                          params={{ id: v.id }}
                          className="block overflow-hidden rounded-xl"
                        >
                          <div className="aspect-[16/10]">
                            <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} />
                          </div>
                        </Link>
                        <button
                          onClick={() => store.toggleCompare(v.id)}
                          className="glass absolute right-2 top-2 rounded-full p-1.5"
                          aria-label="Odebrat z porovnání"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Link
                        to="/inzerat/$id"
                        params={{ id: v.id }}
                        className="mt-3 block font-bold hover:text-primary"
                      >
                        {vehicleTitle(v)}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{v.trim}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((g) => {
                const rows = g.rows.filter(
                  (r) => !onlyDiff || new Set(list.map((v) => r.raw(v))).size > 1,
                );
                if (!rows.length) return null;
                return (
                  <tbody key={g.title}>
                    <tr>
                      <td
                        colSpan={list.length + 1}
                        className="bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        {g.title}
                      </td>
                    </tr>
                    {rows.map((r) => (
                      <tr key={r.label} className="border-b border-border last:border-0">
                        <td className="sticky left-0 bg-card px-4 py-2.5 text-muted-foreground">
                          {r.label}
                        </td>
                        {list.map((v) => (
                          <td
                            key={v.id}
                            className={cn(
                              "px-4 py-2.5",
                              typeof r.value(v) !== "string" && "text-left",
                            )}
                          >
                            {r.value(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </table>
          </div>
        )}
      </Container>
    </Page>
  );
}
