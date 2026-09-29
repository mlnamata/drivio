import { createFileRoute } from "@tanstack/react-router";
import { AuctionCountdown } from "@/components/auction-countdown";
import { DataTable, PageHeader } from "@/components/app-shell";
import { czk, sellerOf, vehicleTitle } from "@/lib/mock-data";
import { useAllVehicles, useAuctions } from "@/lib/store";

export const Route = createFileRoute("/admin/aukce")({ component: AdminAuctions });

function AdminAuctions() {
  const auctions = useAuctions();
  const vehicles = useAllVehicles();
  return (
    <>
      <PageHeader title="Aukce" desc="Monitoring běžících aukcí a očekávaných aukčních poplatků." />
      <DataTable head={["Vůz", "Prodejce", "Příhoz", "Příhozů", "Poplatek vydražitele", "Konec"]}>
        {auctions.map((a) => {
          const v = vehicles.find((x) => x.id === a.vehicleId);
          if (!v) return null;
          return (
            <tr key={a.id}>
              <td className="font-semibold">{vehicleTitle(v)}</td>
              <td>{sellerOf(v).name}</td>
              <td className="font-semibold">{czk(a.currentBid)}</td>
              <td>{a.bids}</td>
              <td>
                {czk(Math.round(a.currentBid * a.buyerFeeRate))} ({Math.round(a.buyerFeeRate * 100)}{" "}
                %)
              </td>
              <td>{a.ended ? "Ukončeno" : <AuctionCountdown minutes={a.endsInMinutes} />}</td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
