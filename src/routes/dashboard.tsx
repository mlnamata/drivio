import { createFileRoute } from "@tanstack/react-router";
import {
  Car,
  CreditCard,
  FileText,
  Gavel,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Settings,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CURRENT_DEALER, useDealerBilling, leadsSample } from "@/lib/billing";
import { czk } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Administrace autobazaru | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: DealerLayout,
});

function DealerLayout() {
  const b = useDealerBilling(CURRENT_DEALER);
  return (
    <AppShell
      title={b.dealer.name}
      subtitle="Administrace autobazaru"
      nav={[
        {
          items: [
            { to: "/dashboard", label: "Přehled", icon: LayoutDashboard },
            {
              to: "/dashboard/vozy",
              label: "Moje vozy",
              icon: Car,
              badge: b.payg ? String(b.used) : `${b.used}/${b.plan.slots}`,
            },
            { to: "/dashboard/pridat", label: "Přidat vůz", icon: PlusCircle },
            { to: "/dashboard/aukce", label: "Aukce", icon: Gavel },
            {
              to: "/dashboard/poptavky",
              label: "Poptávky",
              icon: MessageSquare,
              badge: leadsSample.filter((l) => l.status === "new").length,
            },
          ],
        },
        {
          section: "Účet",
          items: [
            { to: "/dashboard/faktury", label: "Faktury", icon: FileText },
            { to: "/dashboard/predplatne", label: "Předplatné", icon: CreditCard },
            { to: "/dashboard/nastaveni", label: "Nastavení", icon: Settings },
          ],
        },
      ]}
      footer={
        <div className="rounded-xl bg-sidebar-accent p-3 text-xs">
          <p className="font-semibold text-white">{b.plan.name}</p>
          {b.payg ? (
            <p className="mt-1.5 text-sidebar-foreground/60">
              {b.used} vozů · tento měsíc {czk(b.total)}
            </p>
          ) : (
            <>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-border">
                <div
                  className="h-full rounded-full bg-sidebar-primary"
                  style={{ width: `${Math.min(100, (b.used / b.plan.slots) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-sidebar-foreground/60">
                {b.used} z {b.plan.slots} slotů obsazeno
              </p>
            </>
          )}
        </div>
      }
    />
  );
}
