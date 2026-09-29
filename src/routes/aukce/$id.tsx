import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Gavel, ShieldCheck, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuctionCountdown } from "@/components/auction-countdown";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { fuels, gearboxes, labelOf } from "@/lib/catalog";
import {
  auctionById,
  bidFeed,
  czk,
  dealerById,
  num,
  vehicleById,
  vehicleTitle,
} from "@/lib/mock-data";
import { placeBid, subscribeToBids, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aukce/$id")({
  loader: ({ params }) => {
    const auction = auctionById(params.id);
    if (!auction) throw notFound();
    return { auction, vehicle: vehicleById(auction.vehicleId)! };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `Aukce: ${vehicleTitle(loaderData.vehicle)} ${loaderData.vehicle.year} | Drivio`,
          },
          {
            name: "description",
            content: `Aktuální příhoz ${czk(loaderData.auction.currentBid)}. Aukce od 1 Kč na Drivio.`,
          },
        ]
      : [{ title: "Aukce nenalezena | Drivio" }],
  }),
  component: AuctionDetail,
});

type FeedItem = { user: string; amount: number; time: string; fresh?: boolean };

function AuctionDetail() {
  const { auction: a, vehicle: v } = Route.useLoaderData();
  const [price, setPrice] = useState(a.currentBid);
  const [count, setCount] = useState(a.bids);
  const [feed, setFeed] = useState<FeedItem[]>(
    a.id === "a-opel-astra"
      ? bidFeed
      : bidFeed.map((b, i) => ({ ...b, amount: a.currentBid - i * a.minIncrement })),
  );
  const [amount, setAmount] = useState(a.currentBid + a.minIncrement);
  const minBid = price + a.minIncrement;
  const fee = Math.round(amount * a.buyerFeeRate);

  const priceRef = useRef(price);
  const pushBid = (user: string, value: number) => {
    priceRef.current = value;
    setPrice(value);
    setCount((c) => c + 1);
    setFeed((f) => [{ user, amount: value, time: "právě teď", fresh: true }, ...f.slice(0, 7)]);
    setAmount((cur) => Math.max(cur, value + a.minIncrement));
  };

  // Realtime: s napojeným Supabase poslouchá INSERTy do bids; bez něj simuluje živé příhozy.
  useEffect(() => {
    if (supabase) return subscribeToBids(a.id, (b) => pushBid("Dražitel", b.amount));
    const names = ["Petr H.", "Kateřina D.", "Ondřej S.", "Pavla M.", "Radek B."];
    const t = window.setInterval(() => {
      if (Math.random() < 0.5) return;
      const next = priceRef.current + a.minIncrement * (1 + Math.floor(Math.random() * 2));
      pushBid(names[Math.floor(Math.random() * names.length)]!, next);
    }, 7000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.id, a.minIncrement]);

  async function onBid(e: React.FormEvent) {
    e.preventDefault();
    if (amount < minBid) {
      toast.error(`Minimální příhoz je ${czk(minBid)}`);
      return;
    }
    if (supabase) {
      try {
        await placeBid(a.id, amount);
        toast.success("Příhoz přijat");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Příhoz se nepodařilo zpracovat");
      }
      return;
    }
    pushBid("Vy", amount);
    toast.success(`Přihodili jste ${czk(amount)}`, {
      description: "Ukázkový režim – po přihlášení bude příhoz závazný.",
    });
  }

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs
          items={[
            { to: "/", label: "Drivio" },
            { to: "/aukce", label: "Aukce" },
            { label: vehicleTitle(v) },
          ]}
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <div className="surface-card overflow-hidden p-2">
              <div className="aspect-[16/10] overflow-hidden rounded-xl">
                <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} eager />
              </div>
            </div>
            <div className="mt-6 surface-card p-6">
              <h1 className="text-3xl font-extrabold">{vehicleTitle(v)}</h1>
              <p className="text-muted-foreground">{v.trim}</p>
              <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Rok", String(v.year)],
                  ["Najeto", `${num(v.km)} km`],
                  ["Palivo", labelOf(fuels, v.fuel)],
                  ["Převodovka", labelOf(gearboxes, v.gearbox)],
                ].map(([k, val]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{val}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">{v.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Prodejce:{" "}
                <span className="font-medium text-foreground">{dealerById(v.dealerId).name}</span>,{" "}
                {dealerById(v.dealerId).city} ·{" "}
                <Link
                  to="/inzerat/$id"
                  params={{ id: v.id }}
                  className="text-primary hover:underline"
                >
                  kompletní parametry vozu
                </Link>
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="surface-card sticky top-20 p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-auction/15 px-3 py-1 text-xs font-semibold text-auction">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-auction" /> Živě
                </span>
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-4 w-4" /> <AuctionCountdown minutes={a.endsInMinutes} />
                </span>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">Aktuální příhoz</p>
              <p
                key={price}
                className="font-display text-4xl font-extrabold animate-in fade-in zoom-in-95"
              >
                {czk(price)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> {count} příhozů · vyvolávací cena{" "}
                {czk(a.startPrice)}
              </p>

              <form onSubmit={onBid} className="mt-5 space-y-3">
                <div className="flex gap-2">
                  {[1, 2, 5].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setAmount(price + a.minIncrement * k)}
                      className="flex-1 rounded-full border border-border py-1.5 text-xs font-semibold hover:border-primary/40"
                    >
                      +{num(a.minIncrement * k)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={minBid}
                  step={a.minIncrement}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="field text-lg font-semibold"
                  aria-label="Výše příhozu"
                />
                <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <Gavel className="h-4 w-4" /> Přihodit {czk(amount)}
                </button>
                <p className="text-xs text-muted-foreground">
                  Min. příhoz {czk(minBid)}. Aukční poplatek {Math.round(a.buyerFeeRate * 100)} % ={" "}
                  {czk(fee)}. Celkem při vydražení {czk(amount + fee)}.
                </p>
              </form>

              <div className="mt-6 border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold">Historie příhozů</p>
                <ul className="space-y-1">
                  {feed.map((b, i) => (
                    <li
                      key={`${b.amount}-${i}`}
                      className={cn(
                        "flex justify-between rounded-lg px-2 py-1.5 text-sm",
                        i === 0 && "bg-accent font-semibold text-accent-foreground",
                        b.fresh && i === 0 && "animate-in fade-in slide-in-from-top-1",
                      )}
                    >
                      <span>{b.user}</span>
                      <span className="tabular-nums">{czk(b.amount)}</span>
                      <span className="text-xs text-muted-foreground">{b.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" /> Příhozy zpracovává
                databáze atomicky (zámek řádku), dva současné příhozy se nikdy nepřepíšou.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </Page>
  );
}
