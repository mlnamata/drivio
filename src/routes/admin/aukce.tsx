import { createFileRoute } from "@tanstack/react-router";
import { AuctionCountdown } from "@/components/auction-countdown";
import { DataTable, PageHeader } from "@/components/app-shell";
import { auctions, czk, dealerById, vehicleById, vehicleTitle } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/aukce")({ component: AdminAuctions });

function AdminAuctions() {
  return (
    <>
      <PageHeader title="Aukce" desc="Monitoring běžících aukcí a očekávaných aukčních poplatků." />
      <DataTable head={["Vůz", "Prodejce", "Příhoz", "Příhozů", "Poplatek vydražitele", "Konec"]}>
        {auctions.map((a) => {
          const v = vehicleById(a.vehicleId)!;
          return (
            <tr key={a.id}>
              <td className="font-semibold">{vehicleTitle(v)}</td>
              <td>{dealerById(v.dealerId).name}</td>
              <td className="font-semibold">{czk(a.currentBid)}</td>
              <td>{a.bids}</td>
              <td>
                {czk(Math.round(a.currentBid * a.buyerFeeRate))} ({Math.round(a.buyerFeeRate * 100)}{" "}
                %)
              </td>
              <td>
                <AuctionCountdown minutes={a.endsInMinutes} />
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
