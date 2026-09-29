import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const anonKey = (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  import.meta.env["VITE_SUPABASE_ANON_KEY"]) as string | undefined;

/**
 * Prohlížečový klient (anon klíč, podléhá RLS). Dokud nejsou nastavené proměnné
 * VITE_SUPABASE_URL a VITE_SUPABASE_PUBLISHABLE_KEY, běží web nad ukázkovými daty.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export type BidRow = {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
};

/** Příhoz přes RPC `place_bid` – zámek SELECT … FOR UPDATE drží databáze. */
export async function placeBid(auctionId: string, amount: number) {
  if (!supabase) throw new Error("Supabase není nakonfigurován");
  const { data, error } = await supabase.rpc("place_bid", {
    p_auction_id: auctionId,
    p_amount: amount,
  });
  if (error) throw error;
  return data as { bid_id: string; current_price: number; ends_at: string };
}

/** Realtime odběr nových příhozů jedné aukce (INSERT do public.bids, filtr na auction_id). */
export function subscribeToBids(auctionId: string, onBid: (bid: BidRow) => void) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`auction:${auctionId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${auctionId}` },
      (payload) => onBid(payload.new as BidRow),
    )
    .subscribe();
  return () => {
    void supabase!.removeChannel(channel);
  };
}
