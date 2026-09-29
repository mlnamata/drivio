import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Page, SectionTitle } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { vehicles } from "@/lib/mock-data";

export const Route = createFileRoute("/inzeraty")({
  head: () => ({
    meta: [
      { title: "Inzeráty ojetých vozů | Drivio" },
      {
        name: "description",
        content:
          "Procházejte nabídku ojetých vozů od prověřených autobazarů včetně měsíční splátky.",
      },
      { property: "og:title", content: "Inzeráty ojetých vozů | Drivio" },
      {
        property: "og:description",
        content: "Nabídka ojetin od autobazarů s cenou i měsíční splátkou.",
      },
    ],
  }),
  component: Listings,
});

const priceRanges = [
  { label: "Vše", min: 0, max: Infinity },
  { label: "do 150 tis.", min: 0, max: 150000 },
  { label: "150–400 tis.", min: 150000, max: 400000 },
  { label: "nad 400 tis.", min: 400000, max: Infinity },
];

function Listings() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState(0);
  const [sort, setSort] = useState<"price" | "age">("price");

  const list = useMemo(() => {
    const r = priceRanges[range];
    return vehicles
      .filter(
        (v) =>
          v.title.toLowerCase().includes(q.toLowerCase()) &&
          v.price >= r.min &&
          v.price <= r.max,
      )
      .sort((a, b) => (sort === "price" ? a.price - b.price : b.ageMonths - a.ageMonths));
  }, [q, range, sort]);

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle
          eyebrow="Nabídka"
          title="Inzeráty"
          desc="Ukázková nabídka vozů. Filtrování i řazení si můžete hned vyzkoušet."
        />

        <div className="surface-card mb-8 flex flex-col gap-4 p-4 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat značku nebo model…"
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((r, i) => (
              <button
                key={r.label}
                onClick={() => setRange(i)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  range === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "price" | "age")}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="price">Nejlevnější</option>
            <option value="age">Nejdéle inzerované</option>
          </select>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{list.length} vozů</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </div>
    </Page>
  );
}
