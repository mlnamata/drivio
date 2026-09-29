import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Car,
  Clock3,
  FileText,
  Gavel,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dealers } from "@/lib/mock-data";
import { useAllVehicles, useAuctions } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Správa portálu | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const vehicles = useAllVehicles();
  const auctions = useAuctions().filter((a) => !a.ended);
  return (
    <AppShell
      title="Správa portálu"
      subtitle="Superadmin"
      nav={[
        {
          items: [
            { to: "/admin", label: "Přehled", icon: LayoutDashboard },
            {
              to: "/admin/autobazary",
              label: "Autobazary",
              icon: Building2,
              badge: dealers.length,
            },
            { to: "/admin/inzeraty", label: "Inzeráty", icon: Car, badge: vehicles.length },
            { to: "/admin/aukce", label: "Aukce", icon: Gavel, badge: auctions.length },
            { to: "/admin/leady", label: "Leady a partneři", icon: Users },
          ],
        },
        {
          section: "Systém",
          items: [
            { to: "/admin/fakturace", label: "Fakturace", icon: FileText },
            { to: "/admin/automatizace", label: "Automatizace", icon: Clock3 },
            { to: "/admin/nastaveni", label: "Nastavení", icon: Settings },
          ],
        },
      ]}
    />
  );
}
