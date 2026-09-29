import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BellRing,
  Building2,
  Camera,
  ShieldCheck,
  Store,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { PayPerVehicleCard, PlanCards } from "@/components/pricing";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CarImage } from "@/components/car-image";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { VehicleForm } from "@/components/vehicle-form";
import { czk, monthlyPayment, PRIVATE_SELLER, vehicleTitle } from "@/lib/mock-data";
import { store, useAllVehicles } from "@/lib/store";

/** Počet inzerátů zdarma na jeden účet soukromé osoby. */
const FREE_PRIVATE_LISTINGS = 1;

export const Route = createFileRoute("/prodat-auto")({
  head: () => ({
    meta: [
      { title: "Prodat auto zdarma | Drivio" },
      {
        name: "description",
        content:
          "Prodejte své auto na Drivio. Jeden inzerát na účet zdarma, s fotkami, VIN dekodérem a zobrazením splátky pro kupce.",
      },
    ],
  }),
  component: SellCar,
});

function SellCar() {
  const navigate = useNavigate();
  const mine = useAllVehicles().filter((v) => v.dealerId === PRIVATE_SELLER && v.status !== "sold");
  const limitReached = mine.length >= FREE_PRIVATE_LISTINGS;
  const [sellerType, setSellerType] = useState<"private" | "company">("private");

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Prodat auto" }]} />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Pro soukromé prodejce
            </p>
            <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
              Prodejte auto <span className="text-primary">zdarma</span>
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">
              Každý účet má 1 inzerát zdarma na 60 dní. Kupci uvidí i měsíční splátku, takže se auto
              prodá rychleji.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              [Camera, "Až 8 fotek"],
              [ShieldCheck, "Dekódování VIN"],
              [BellRing, "Rozesíláme hlídacím psům"],
              [Wallet, "Kupci vidí splátku"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof Camera;
              return (
                <div key={t as string} className="surface-card flex items-center gap-2 p-3">
                  <I className="h-4 w-4 text-primary" /> {t as string}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid max-w-xl grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(
            [
              ["private", User, "Fyzická osoba"],
              ["company", Building2, "Firma / autobazar (IČO)"],
            ] as const
          ).map(([t, Icon, l]) => (
            <button
              key={t}
              onClick={() => setSellerType(t)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition",
                sellerType === t ? "bg-card shadow-sm" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        {sellerType === "company" ? (
          <div className="mt-6 space-y-5">
            <p className="max-w-2xl text-muted-foreground">
              Firmy a autobazary inzerují placeně. Vyberte si, jestli chcete platit za každý vůz
              zvlášť, nebo si předplatit balíček slotů a vozy v něm libovolně měnit.
            </p>
            <PayPerVehicleCard />
            <PlanCards />
            <div className="flex flex-wrap gap-3">
              <Link
                to="/prihlaseni"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Registrovat firmu a vložit vůz
              </Link>
              <Link
                to="/cenik"
                className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold"
              >
                Podrobný ceník a kalkulačka
              </Link>
            </div>
          </div>
        ) : limitReached ? (
          <div className="mt-8 space-y-5">
            <div className="surface-card p-6">
              <p className="text-lg font-bold">Váš inzerát</p>
              <p className="text-sm text-muted-foreground">
                Inzerát zdarma je vyčerpaný. Další vůz můžete vložit, až tento prodáte nebo smažete.
              </p>
              {mine.map((v) => (
                <div
                  key={v.id}
                  className="mt-4 flex flex-col gap-4 rounded-2xl border border-border p-3 sm:flex-row sm:items-center"
                >
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl">
                    <CarImage src={v.photos[0]!} alt={vehicleTitle(v)} />
                  </div>
                  <div className="flex-1">
                    <Link
                      to="/inzerat/$id"
                      params={{ id: v.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {vehicleTitle(v)} {v.trim}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {czk(v.price)} · splátka od {czk(monthlyPayment(v.price))}/měs. ·{" "}
                      {v.status === "in_auction" ? "v aukci" : "zveřejněno"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        store.markSold(v.id);
                        toast.success("Gratulujeme k prodeji!", {
                          description: "Inzerát je stažený a můžete vložit další vůz.",
                        });
                      }}
                      className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
                    >
                      Prodáno
                    </button>
                    <button
                      onClick={() => {
                        store.removeAdded(v.id);
                        toast("Inzerát smazán");
                      }}
                      className="rounded-full border border-border p-2 hover:text-destructive"
                      aria-label="Smazat inzerát"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <Store className="h-6 w-6 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Prodáváte víc aut?</p>
                  <p className="text-sm text-muted-foreground">
                    Pro autobazary a živnostníky máme balíčky slotů od 990 Kč měsíčně.
                  </p>
                </div>
              </div>
              <Link
                to="/pro-autobazary"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Balíčky pro prodejce
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <VehicleForm
              withContact
              submitLabel="Zveřejnit zdarma"
              aside={(price) => (
                <div className="rounded-xl bg-muted p-4 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Cena inzerátu</span>
                    <span className="font-bold text-success">0 Kč</span>
                  </p>
                  <p className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">Doba zveřejnění</span>
                    <span className="font-semibold">60 dní</span>
                  </p>
                  {price ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Kupci uvidí splátku od {czk(monthlyPayment(price))}/měs.
                    </p>
                  ) : null}
                </div>
              )}
              onSubmit={({ contact, ...v }) => {
                const id = store.addVehicle({
                  ...v,
                  dealerId: PRIVATE_SELLER,
                  listedAt: new Date().toISOString(),
                  ...(contact
                    ? {
                        privateSeller: {
                          name: contact.name,
                          city: contact.city,
                          region: contact.region,
                          phone: contact.phone,
                        },
                      }
                    : {}),
                });
                toast.success("Inzerát je zveřejněný", {
                  description: "Najdete ho ve výpisu vozů a v sekci Prodat auto.",
                });
                void navigate({ to: "/inzerat/$id", params: { id } });
              }}
            />
          </div>
        )}
      </Container>
    </Page>
  );
}
