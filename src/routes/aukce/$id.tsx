import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  CalendarClock,
  Clock,
  Gavel,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuctionCountdown } from "@/components/auction-countdown";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FavoriteButton } from "@/components/vehicle-card";
import { fuels, gearboxes, labelOf } from "@/lib/catalog";
import {
  auctionById,
  bidFeed,
  czk,
  num,
  sellerOf,
  vehicleById,
  vehicleTitle,
} from "@/lib/mock-data";
import { store, useAllVehicles, useAuctions, useStore, type LiveAuction } from "@/lib/store";
import { placeBid, subscribeToBids, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aukce/$id")({
  // Aukce založená v administraci (ukázkový režim) se dohledá až na klientu.
  loader: ({ params }) => {
    const auction = auctionById(params.id) ?? null;
    return { auction, vehicle: auction ? (vehicleById(auction.vehicleId) ?? null) : null };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.vehicle
      ? [
          {
            title: `Aukce: ${vehicleTitle(loaderData.vehicle)} ${loaderData.vehicle.year} | Drivio`,
          },
          {
            name: "description",
            content: `Aukce od 1 Kč – ${vehicleTitle(loaderData.vehicle)}, ${num(loaderData.vehicle.km)} km. Přihazujte živě na Drivio.`,
          },
        ]
      : [{ title: "Aukce | Drivio" }],
  }),
  component: AuctionPage,
});

function AuctionPage() {
  const { id } = Route.useParams();
  const auctions = useAuctions();
  const vehicles = useAllVehicles();
  const a = auctions.find((x) => x.id === id);
  const v = a ? vehicles.find((x) => x.id === a.vehicleId) : undefined;
  if (!a || !v)
    return (
      <Page>
        <Container className="py-24 text-center">
          <h1 className="text-3xl font-bold">Aukce nenalezena</h1>
          <Link
            to="/aukce"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Všechny aukce
          </Link>
        </Container>
      </Page>
    );
  return <AuctionDetail a={a} v={v} />;
}

type FeedItem = { user: string; amount: number; time: string; mine?: boolean };

function AuctionDetail({ a, v }: { a: LiveAuction; v: ReturnType<typeof useAllVehicles>[number] }) {
  const { bidder, bids: storedBids } = useStore();
  const seller = sellerOf(v);
  const myBids = storedBids[a.id] ?? [];
  const initialFeed: FeedItem[] = [
    ...myBids.map((b) => ({
      user: `${bidder?.name ?? "Vy"} (vy)`,
      amount: b.amount,
      time: "dříve",
      mine: true,
    })),
    ...(a.bids > myBids.length && a.currentBid > 0
      ? bidFeed.map((b, i) => ({
          ...b,
          amount: Math.max(1, a.currentBid - (i + (a.leading ? 1 : 0)) * a.minIncrement),
        }))
      : []),
  ]
    .sort((x, y) => y.amount - x.amount)
    .slice(0, 8);

  const [price, setPrice] = useState(a.currentBid);
  const [count, setCount] = useState(a.bids);
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [amount, setAmount] = useState(a.currentBid ? a.currentBid + a.minIncrement : a.startPrice);
  const [autoMax, setAutoMax] = useState<number | null>(null);
  const [register, setRegister] = useState(false);
  const priceRef = useRef(price);
  const leaderRef = useRef<"me" | "other">(a.leading ? "me" : "other");
  const autoRef = useRef<number | null>(null);
  autoRef.current = autoMax;

  const minBid = price > 0 ? price + a.minIncrement : a.startPrice;
  const fee = Math.round(amount * a.buyerFeeRate);
  const leading = leaderRef.current === "me" && price > 0;

  const push = (user: string, value: number, mine: boolean) => {
    priceRef.current = value;
    leaderRef.current = mine ? "me" : "other";
    setPrice(value);
    setCount((c) => c + 1);
    setFeed((f) => [{ user, amount: value, time: "právě teď", mine }, ...f.slice(0, 7)]);
    setAmount((cur) => Math.max(cur, value + a.minIncrement));
    if (mine) store.addBid(a.id, user, value);
  };

  const bidAsMe = (value: number) => push(`${bidder?.name ?? "Vy"} (vy)`, value, true);

  // Realtime: s napojeným Supabase poslouchá INSERTy do bids; bez něj simuluje ostatní dražitele.
  useEffect(() => {
    if (a.ended || a.upcoming) return;
    if (supabase) return subscribeToBids(a.id, (b) => push("Dražitel", b.amount, false));
    const names = ["Petr H.", "Kateřina D.", "Ondřej S.", "Pavla M.", "Radek B."];
    const t = window.setInterval(() => {
      if (Math.random() < 0.55) return;
      const next = priceRef.current + a.minIncrement * (1 + Math.floor(Math.random() * 2));
      push(names[Math.floor(Math.random() * names.length)]!, next, false);
      // Automatické přihazování: pokud nás někdo přehodí a máme nastavené maximum, přihodíme.
      const max = autoRef.current;
      if (max !== null) {
        const counter = next + a.minIncrement;
        if (counter <= max) {
          window.setTimeout(() => bidAsMe(counter), 600);
        } else {
          setAutoMax(null);
          toast.warning("Automatické přihazování skončilo", {
            description: `Příhoz ${czk(next)} přesáhl vaše maximum ${czk(max)}.`,
          });
        }
      }
    }, 8000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.id, a.minIncrement, a.ended, a.upcoming]);

  async function onBid(e: React.FormEvent) {
    e.preventDefault();
    if (!bidder) return setRegister(true);
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
    bidAsMe(amount);
    toast.success(`Přihodili jste ${czk(amount)}`, { description: "Vedete aukci." });
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
            <div className="surface-card relative overflow-hidden p-2">
              <div className="aspect-[16/10] overflow-hidden rounded-xl">
                <CarImage
                  src={v.photos[0]!}
                  alt={vehicleTitle(v)}
                  eager
                  className={cn(a.ended && "grayscale")}
                />
              </div>
              <FavoriteButton id={v.id} className="absolute right-5 top-5" />
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
                Prodejce: <span className="font-medium text-foreground">{seller.name}</span>
                {seller.city ? `, ${seller.city}` : ""} ·{" "}
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
              {a.upcoming ? (
                <div className="text-center">
                  <CalendarClock className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Aukce začne za</p>
                  <p className="font-display text-3xl font-extrabold">
                    <AuctionCountdown minutes={a.startsInMinutes ?? 0} />
                  </p>
                  <p className="mt-2 text-sm">
                    Vyvolávací cena <strong>{czk(a.startPrice)}</strong> · min. příhoz{" "}
                    {czk(a.minIncrement)}
                  </p>
                  <button
                    onClick={() => {
                      store.toggleReminder(a.id);
                      toast(a.reminded ? "Upozornění zrušeno" : "Upozorníme vás na start aukce");
                    }}
                    className={cn(
                      "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold",
                      a.reminded
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    <Bell className="h-4 w-4" />{" "}
                    {a.reminded ? "Upozorníme vás" : "Upozornit na start"}
                  </button>
                  {!bidder ? (
                    <button
                      onClick={() => setRegister(true)}
                      className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-semibold"
                    >
                      Registrovat se jako dražitel předem
                    </button>
                  ) : null}
                </div>
              ) : a.ended ? (
                <div className="text-center">
                  <Trophy className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Aukce skončila, vydraženo za</p>
                  <p className="font-display text-4xl font-extrabold">{czk(price)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{count} příhozů</p>
                  <Link
                    to="/aukce"
                    className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Probíhající aukce
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Živě
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
                    {czk(Math.max(price, 0))}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" /> {count} příhozů · vyvolávací cena{" "}
                    {czk(a.startPrice)}
                  </p>
                  {feed.some((f) => f.mine) ? (
                    <p
                      className={cn(
                        "mt-3 rounded-xl px-3 py-2 text-sm font-semibold",
                        leading
                          ? "bg-success/12 text-success"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {leading ? "Vedete aukci" : "Někdo vás přehodil – přihoďte znovu"}
                    </p>
                  ) : null}

                  <form onSubmit={onBid} className="mt-5 space-y-3">
                    <div className="flex gap-2">
                      {[1, 2, 5].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setAmount(Math.max(price, 0) + a.minIncrement * k)}
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
                    <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                      <Gavel className="h-4 w-4" /> Přihodit {czk(amount)}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Min. příhoz {czk(minBid)}. Aukční poplatek {Math.round(a.buyerFeeRate * 100)}{" "}
                      % = {czk(fee)}. Celkem při vydražení {czk(amount + fee)}.
                    </p>
                  </form>

                  <div className="mt-4 rounded-2xl border border-border p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Bot className="h-4 w-4 text-primary" /> Automatické přihazování
                    </p>
                    {autoMax !== null ? (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span>
                          Aktivní do <strong>{czk(autoMax)}</strong>
                        </span>
                        <button
                          onClick={() => setAutoMax(null)}
                          className="text-xs font-semibold text-destructive"
                        >
                          Zrušit
                        </button>
                      </div>
                    ) : (
                      <form
                        className="mt-2 flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!bidder) return setRegister(true);
                          const max = Number(new FormData(e.currentTarget).get("max"));
                          if (!max || max < minBid)
                            return void toast.error(`Maximum musí být alespoň ${czk(minBid)}`);
                          setAutoMax(max);
                          if (!leading) bidAsMe(minBid);
                          toast.success(`Budeme za vás přihazovat až do ${czk(max)}`);
                        }}
                      >
                        <input
                          name="max"
                          type="number"
                          min={minBid}
                          step={a.minIncrement}
                          placeholder="Moje maximum"
                          className="field py-2"
                        />
                        <button className="shrink-0 rounded-full bg-foreground px-4 text-sm font-semibold text-background">
                          Nastavit
                        </button>
                      </form>
                    )}
                  </div>
                </>
              )}

              <div className="mt-6 border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold">Historie příhozů</p>
                {feed.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Zatím žádné příhozy – buďte první.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {feed.map((b, i) => (
                      <li
                        key={`${b.amount}-${i}`}
                        className={cn(
                          "flex justify-between gap-2 rounded-lg px-2 py-1.5 text-sm",
                          i === 0 && "bg-accent font-semibold text-accent-foreground",
                          i === 0 &&
                            b.time === "právě teď" &&
                            "animate-in fade-in slide-in-from-top-1",
                        )}
                      >
                        <span className="truncate">{b.user}</span>
                        <span className="tabular-nums">{czk(b.amount)}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{b.time}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" /> Příhozy zpracovává
                databáze atomicky (zámek řádku), dva současné příhozy se nikdy nepřepíšou.
              </p>
            </div>
          </aside>
        </div>
      </Container>

      <Dialog open={register} onOpenChange={setRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Registrace dražitele</DialogTitle>
          <DialogDescription>
            Před prvním příhozem potvrďte kontakt a aukční řád. Příhoz je závazný.
          </DialogDescription>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              store.registerBidder(String(f.get("name")), String(f.get("email")));
              setRegister(false);
              toast.success("Jste registrovaný dražitel", {
                description: "Teď můžete přihazovat.",
              });
            }}
          >
            <input
              name="name"
              required
              minLength={2}
              className="field"
              placeholder="Jméno a příjmení"
              autoComplete="name"
            />
            <input
              name="email"
              type="email"
              required
              className="field"
              placeholder="E-mail"
              autoComplete="email"
            />
            <input
              name="phone"
              type="tel"
              required
              pattern="\+?[0-9 ]{9,16}"
              className="field"
              placeholder="Telefon"
              autoComplete="tel"
            />
            <label className="flex gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                Souhlasím s aukčním řádem v{" "}
                <Link to="/pravni/obchodni-podminky" className="text-primary underline">
                  obchodních podmínkách
                </Link>{" "}
                a beru na vědomí, že vítězný příhoz je závazný a platí se k němu aukční poplatek.
              </span>
            </label>
            <button className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">
              Registrovat a přihazovat
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
