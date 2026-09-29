import { createFileRoute } from "@tanstack/react-router";
import { brands } from "@/lib/catalog";
import { leasingOffers } from "@/lib/leasing";
import { auctions, vehicles } from "@/lib/mock-data";

const SITE = "https://drivio.cz";
const staticPaths = [
  "/",
  "/inzeraty",
  "/aukce",
  "/leasing",
  "/leasing/firmy",
  "/financovani",
  "/prodat-auto",
  "/cenik",
  "/pro-autobazary",
  "/pro-leasingove-spolecnosti",
  "/reklama",
  "/kontakt",
  "/pravni/obchodni-podminky",
  "/pravni/ochrana-osobnich-udaju",
  "/pravni/cookies",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = [
          ...staticPaths,
          ...brands.map((b) => `/inzeraty?brand=${b.slug}`),
          ...vehicles.filter((v) => v.status === "active").map((v) => `/inzerat/${v.id}`),
          ...auctions.filter((a) => a.endsInMinutes > 0).map((a) => `/aukce/${a.id}`),
          ...leasingOffers.map((o) => `/leasing/${o.id}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.replace(/&/g, "&amp;")}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
