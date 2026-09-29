import { createFileRoute, Link } from "@tanstack/react-router";
import { AuctionCountdown } from "@/components/auction-countdown";
import { DataTable, PageHeader, StatusBadge } from "@/components/app-shell";
import { auctions, czk, vehicleById, vehicleTitle } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/aukce")({ component: DealerAuctions });

function DealerAuctions() {
  return (
    <>
      <PageHeader
        title="Aukce"
        desc="Vozy, které jste přesunuli do aukce od 1 Kč. Progrese poplatku se za měsíc aukce neúčtuje."
      />
      <DataTable head={["Vůz", "Aktuální příhoz", "Příhozů", "Konec", "Stav"]}>
        {auctions.map((a) => {
          const v = vehicleById(a.vehicleId)!;
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
              <td>
                <AuctionCountdown minutes={a.endsInMinutes} />
              </td>
              <td>
                <StatusBadge tone="info">Probíhá</StatusBadge>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
