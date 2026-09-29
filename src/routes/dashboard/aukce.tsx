import { createFileRoute, Link } from "@tanstack/react-router";
import { AuctionCountdown } from "@/components/auction-countdown";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { CURRENT_DEALER } from "@/lib/billing";
import { czk, vehicleTitle } from "@/lib/mock-data";
import { useAllVehicles, useAuctions } from "@/lib/store";

export const Route = createFileRoute("/dashboard/aukce")({ component: DealerAuctions });

function DealerAuctions() {
  const vehicles = useAllVehicles();
  const auctions = useAuctions().filter(
    (a) => vehicles.find((v) => v.id === a.vehicleId)?.dealerId === CURRENT_DEALER,
  );
  return (
    <>
      <PageHeader
        title="Aukce"
        desc="Vozy, které jste přesunuli do aukce od 1 Kč. Progrese poplatku se za měsíc aukce neúčtuje."
      />
      <DataTable head={["Vůz", "Aktuální příhoz", "Příhozů", "Konec", "Stav"]}>
        {auctions.map((a) => {
          const v = vehicles.find((x) => x.id === a.vehicleId);
          if (!v) return null;
          return (
            <tr key={a.id}>
              <td>
                <Link
                  to="/aukce/$id"
                  params={{ id: a.id }}
                  className="font-semibold hover:text-primary"
                >
                  {vehicleTitle(v)}
                </Link>
              </td>
              <td className="font-semibold">{czk(a.currentBid)}</td>
              <td>{a.bids}</td>
              <td>{a.ended ? "Ukončeno" : <AuctionCountdown minutes={a.endsInMinutes} />}</td>
              <td>
                {a.ended ? (
                  <StatusBadge tone="muted">Ukončeno</StatusBadge>
                ) : (
                  <StatusBadge tone="info">Probíhá</StatusBadge>
                )}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
