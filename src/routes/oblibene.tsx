import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { useFavorites } from "@/hooks/use-favorites";
import { vehicles } from "@/lib/mock-data";

export const Route = createFileRoute("/oblibene")({
  head: () => ({
    meta: [{ title: "Oblíbené vozy | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: Favorites,
});

function Favorites() {
  const { ids } = useFavorites();
  const list = vehicles.filter((v) => ids.includes(v.id));
  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Oblíbené" }]} />
        <h1 className="text-3xl font-extrabold">Oblíbené vozy</h1>
        {list.length === 0 ? (
          <div className="surface-card mt-8 p-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Zatím nemáte žádné oblíbené vozy</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Klikněte na srdíčko u inzerátu a vůz se uloží sem.
            </p>
            <Link
              to="/inzeraty"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Prohlížet vozy
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </Container>
    </Page>
  );
}
