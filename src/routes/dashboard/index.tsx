import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Gavel } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { btn, PageHeader, Stat } from "@/components/app-shell";
import { useCurrentDealer, useDealerBilling, leadsSample } from "@/lib/billing";
import { store, useAllVehicles } from "@/lib/store";
import { czk, vehicleTitle } from "@/lib/mock-data";

import { cars } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({ component: Overview });

const views = [
  { d: "23. 9.", views: 812, leads: 9 },
  { d: "24. 9.", views: 954, leads: 12 },
  { d: "25. 9.", views: 1021, leads: 11 },
  { d: "26. 9.", views: 1310, leads: 17 },
  { d: "27. 9.", views: 1188, leads: 14 },
  { d: "28. 9.", views: 1402, leads: 19 },
  { d: "29. 9.", views: 1265, leads: 15 },
];

function Overview() {
  const dealerId = useCurrentDealer();
  const b = useDealerBilling(dealerId);
  // Rychlost obratu: prodané vozy (doba do prodeje), jinak aktivní vozy (doba inzerce).
  const mineAll = useAllVehicles().filter((v) => v.dealerId === dealerId);
  const sold = mineAll.filter((v) => v.status === "sold");
  const basis = sold.length ? sold : b.lines.map((l) => l.vehicle);
  const avgDays = basis.length
    ? Math.round(basis.reduce((x, v) => x + v.listedDays, 0) / basis.length)
    : 0;
  const oldest = Math.max(0, ...b.lines.map((l) => l.vehicle.listedDays));
  const stale = b.lines.filter((l) => l.stale);
  return (
    <>
      <PageHeader
        title="Přehled"
        desc="Stav garáže, ležáky a odhad faktury za aktuální měsíc."
        actions={
          <Link to="/dashboard/pridat" className={btn.primary}>
            Přidat vůz
          </Link>
        }
      />

      {stale.map((l) => (
        <div
          key={l.vehicle.id}
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 md:flex-row md:items-center"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p className="flex-1 text-sm">
            <strong>{vehicleTitle(l.vehicle)}</strong> je inzerován {l.vehicle.listedDays} dní –
            sazba slotu je nyní +100 %. Přesuňte vůz do aukce od 1 Kč a navýšení za tento měsíc vám
            odpustíme.
          </p>
          <button
            className={btn.primary}
            onClick={() => {
              store.sendToAuction(l.vehicle.id);
              toast.success("Vůz je v aukci od 1 Kč", {
                description: "Aukce běží 7 dní, progrese za tento měsíc je odpuštěna.",
              });
            }}
          >
            <Gavel className="h-4 w-4" /> Přesunout do aukce
          </button>
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Obsazené sloty"
          value={b.payg ? String(b.used) : `${b.used} / ${b.plan.slots}`}
          hint={b.payg ? "tarif Platba za vůz" : `${b.plan.slots - b.used} volných`}
        />
        <Stat
          label="Rychlost obratu"
          value={`${avgDays} dní`}
          hint={`průměrná doba inzerce · nejstarší vůz ${oldest} dní`}
          tone={avgDays > 60 ? "warn" : "ok"}
        />
        <Stat
          label="Nové poptávky"
          value={String(leadsSample.length)}
          hint={`${leadsSample.filter((l) => l.kind === "financing").length} žádostí o financování`}
        />
        <Stat
          label="Odhad faktury"
          value={czk(b.total)}
          hint={b.extras ? `z toho ${czk(b.extras)} progrese a doplatky` : "jen paušál"}
          tone={b.extras ? "warn" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="surface-card p-5">
          <p className="mb-4 font-semibold">Zobrazení inzerátů</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={views} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="d"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Zobrazení"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#v)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <p className="mb-4 font-semibold">Rozpis faktury (září)</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {b.payg ? `Platba za vůz (${cars(b.used)})` : `Paušál ${b.plan.name}`}
              </dt>
              <dd className="font-semibold">
                {czk(b.payg ? b.lines.reduce((x, l) => x + l.base, 0) : b.plan.price)}
              </dd>
            </div>
            {b.lines
              .filter((l) => l.progression || l.surcharge)
              .map((l) => (
                <div key={l.vehicle.id} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {vehicleTitle(l.vehicle)} · {l.progression ? `progrese ${l.month}. měs.` : ""}
                    {l.surcharge ? " doplatek nad limit" : ""}
                  </dt>
                  <dd className="font-semibold">+ {czk(l.progression + l.surcharge)}</dd>
                </div>
              ))}
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-semibold">Celkem bez DPH</dt>
              <dd className="font-display font-extrabold">{czk(b.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
