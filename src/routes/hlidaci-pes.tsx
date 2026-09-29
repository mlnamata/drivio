import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Search, Trash2 } from "lucide-react";
import { Breadcrumbs, Container, Page } from "@/components/site-shell";
import { describeSearch } from "@/components/watchdog-dialog";
import { sellerOf } from "@/lib/mock-data";
import { filterVehicles } from "@/lib/search";
import { store, useStore, useVehicles } from "@/lib/store";

import { cars } from "@/lib/utils";

export const Route = createFileRoute("/hlidaci-pes")({
  head: () => ({
    meta: [{ title: "Hlídací pes | Drivio" }, { name: "robots", content: "noindex" }],
  }),
  component: Watchdog,
});

function Watchdog() {
  const { searches } = useStore();
  const vehicles = useVehicles();

  return (
    <Page>
      <Container className="py-8">
        <Breadcrumbs items={[{ to: "/", label: "Drivio" }, { label: "Hlídací pes" }]} />
        <h1 className="text-3xl font-extrabold">Hlídací pes</h1>
        <p className="mt-1 text-muted-foreground">
          Uložená hledání. Když přibude vůz, který jim odpovídá, pošleme vám e-mail.
        </p>

        {searches.length === 0 ? (
          <div className="surface-card mt-8 p-12 text-center">
            <BellRing className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Zatím nic nehlídáte</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nastavte filtry ve výpisu vozů a klikněte na „Hlídat“.
            </p>
            <Link
              to="/inzeraty"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Hledat auta
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {searches.map((w) => {
              const count = filterVehicles(vehicles, w.search, (v) => sellerOf(v).region).length;
              return (
                <div key={w.id} className="surface-card flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{w.name}</p>
                      <p className="text-sm text-muted-foreground">{describeSearch(w.search)}</p>
                      {w.email ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Upozornění na {w.email}
                        </p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => store.removeSearch(w.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                      aria-label="Smazat hlídání"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    to="/inzeraty"
                    search={w.search}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
                  >
                    <Search className="h-4 w-4" /> Zobrazit {cars(count)}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </Page>
  );
}
