import { createFileRoute } from "@tanstack/react-router";
import { Page, SectionTitle } from "@/components/site-shell";
import { czk, plans, surchargeFactor, vehicles } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard autobazaru | Drivio" },
      {
        name: "description",
        content:
          "Přehled obsazených slotů, stáří inzerátů, rostoucích poplatků a podkladu pro fakturaci.",
      },
      { property: "og:title", content: "Dashboard autobazaru | Drivio" },
      {
        property: "og:description",
        content: "Sloty, ležáky, poplatky a faktura na jedné obrazovce.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const plan = plans[0];
  const mine = vehicles.slice(0, 5);
  const used = mine.length;
  const fees = mine.reduce(
    (sum, v) => sum + Math.round(plan.perSlot * surchargeFactor(v.ageMonths)),
    0,
  );
  const surcharge = mine
    .filter((v) => v.price > 200000)
    .reduce((s, v) => s + Math.max(0, 499 - plan.perSlot), 0);
  const stale = mine.filter((v) => v.ageMonths >= 3);

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle
          eyebrow="Pro autobazary"
          title="Autobazar Kolbenka"
          desc="Náznak dashboardu: obsazenost garáže, stáří inzerátů a podklad pro měsíční fakturu."
        />

        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["Obsazené sloty", `${used} / ${plan.slots}`],
            ["Balíček", plan.name],
            ["Poplatky tento měsíc", czk(fees + surcharge)},
            ["Ležáky (3 měs.+)", String(stale.length)],
          ].map(([l, v]) => (
            <div key={l as string} className="surface-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
              <p className="mt-2 font-display text-2xl font-bold">{v}</p>
            </div>
          ))}
        </div>

        <div className="surface-card mt-8 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Obsazenost digitální garáže</h3>
            <span className="text-sm text-muted-foreground">
              {used} z {plan.slots} slotů
            </span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 md:grid-cols-10">
            {Array.from({ length: plan.slots }).map((_, i) => (
              <div
                key={i}
                className={`h-10 rounded-md border ${
                  i < used ? "bg-heat border-transparent" : "border-dashed border-border"
                }`}
              />
            ))}
          </div>
        </div>

        {stale.length > 0 ? (
          <div className="surface-card mt-6 border-warning/50 p-6">
            <p className="text-sm font-semibold text-warning">Doporučení systému</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stale.length} vůz leží 3 měsíce a více. Přesuňte ho do aukce od 1 Kč —
              progresi poplatků na tento měsíc odpustíme.
            </p>
            <button className="mt-4 rounded-lg border border-warning/60 px-4 py-2 text-sm font-semibold text-warning transition-colors hover:bg-warning/10">
              Přesunout do aukce
            </button>
          </div>
        ) : null}

        <div className="surface-card mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border/70 text-left text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Vozidlo</th>
                <th className="p-4 font-medium">Cena</th>
                <th className="p-4 font-medium">Měsíc inzerce</th>
                <th className="p-4 font-medium">Sazba slotu</th>
                <th className="p-4 font-medium">Doplatek</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((v) => {
                const f = surchargeFactor(v.ageMonths);
                const extra = v.price > 200000 ? Math.max(0, 499 - plan.perSlot) : 0;
                return (
                  <tr key={v.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4 font-medium">{v.title}</td>
                    <td className="p-4">{czk(v.price)}</td>
                    <td className="p-4">
                      {v.ageMonths}. {f > 1 ? `(+${Math.round((f - 1) * 100)} %)` : ""}
                    </td>
                    <td className="p-4">{czk(Math.round(plan.perSlot * f))}</td>
                    <td className="p-4">{extra ? czk(extra) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="surface-card mt-8 max-w-md p-6">
          <h3 className="font-semibold">Podklad pro fakturu</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Předplatné {plan.name}</dt>
              <dd>{czk(plan.price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Progrese za stáří inzerátů</dt>
              <dd>{czk(fees - plan.perSlot * used)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Doplatky za nadlimitní vozy</dt>
              <dd>{czk(surcharge)}</dd>
            </div>
            <div className="flex justify-between border-t border-border/70 pt-3 text-lg font-bold">
              <dt>Celkem</dt>
              <dd className="text-primary">
                {czk(plan.price + (fees - plan.perSlot * used) + surcharge)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Page>
  );
}
