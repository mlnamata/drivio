import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Stat } from "@/components/app-shell";
import { czk, dealers, planById } from "@/lib/mock-data";
import { useAuctions, useVehicles } from "@/lib/store";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

const revenue = [
  { m: "Dub", sub: 182000, extra: 21000, leads: 64000, auctions: 18000 },
  { m: "Kvě", sub: 198000, extra: 24000, leads: 71000, auctions: 22000 },
  { m: "Čvn", sub: 214000, extra: 26000, leads: 83000, auctions: 31000 },
  { m: "Čvc", sub: 231000, extra: 29000, leads: 88000, auctions: 36000 },
  { m: "Srp", sub: 247000, extra: 33000, leads: 97000, auctions: 41000 },
  { m: "Zář", sub: 262000, extra: 35000, leads: 104000, auctions: 47000 },
];

function AdminOverview() {
  const vehicles = useVehicles();
  const auctions = useAuctions().filter((a) => !a.ended);
  const mrr = dealers.reduce((s, d) => s + planById(d.plan).price, 0);
  return (
    <>
      <PageHeader title="Přehled platformy" desc="Klíčové metriky za aktuální měsíc." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="MRR (ukázkové bazary)" value={czk(mrr)} hint="+6,2 % m/m" tone="ok" />
        <Stat
          label="Aktivní inzeráty"
          value={String(vehicles.length)}
          hint={`${vehicles.filter((v) => v.listedDays >= 90).length} ležáků nad 90 dní`}
          tone="warn"
        />
        <Stat
          label="Běžící aukce"
          value={String(auctions.length)}
          hint={`${auctions.reduce((s, a) => s + a.bids, 0)} příhozů`}
        />
        <Stat label="Leady na financování" value="312" hint="konverze na úvěr 18 %" />
      </div>
      <div className="surface-card mt-6 p-5">
        <p className="mb-4 font-semibold">Tržby podle zdroje</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue} margin={{ left: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="m"
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
                tickFormatter={(v: number) => `${v / 1000}k`}
              />
              <Tooltip
                formatter={(v: number) => czk(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
              />
              <Bar dataKey="sub" name="Předplatné" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="extra" name="Progrese a doplatky" stackId="a" fill="var(--chart-4)" />
              <Bar dataKey="leads" name="Leady (CPL/CPS)" stackId="a" fill="var(--chart-2)" />
              <Bar
                dataKey="auctions"
                name="Aukční poplatky"
                stackId="a"
                fill="var(--chart-3)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
