import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { btn, PageHeader } from "@/components/app-shell";
import { CURRENT_DEALER } from "@/lib/billing";
import { dealerById } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/nastaveni")({ component: Settings });

function Settings() {
  const d = dealerById(CURRENT_DEALER);
  return (
    <>
      <PageHeader
        title="Nastavení"
        desc="Údaje autobazaru se zobrazují u inzerátů a na fakturách."
      />
      <form
        className="grid max-w-4xl gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Uloženo");
        }}
      >
        <section className="surface-card grid gap-3 p-5 sm:grid-cols-2">
          <p className="font-semibold sm:col-span-2">Firemní údaje</p>
          <input className="field" defaultValue={d.name} placeholder="Název" />
          <input className="field" defaultValue="12345678" placeholder="IČO" />
          <input className="field" defaultValue="CZ12345678" placeholder="DIČ" />
          <input className="field" defaultValue={d.city} placeholder="Město" />
          <input
            className="field sm:col-span-2"
            defaultValue="Kolbenova 12, 190 00 Praha 9"
            placeholder="Adresa provozovny"
          />
        </section>
        <section className="surface-card grid gap-3 p-5 sm:grid-cols-2">
          <p className="font-semibold sm:col-span-2">Kontakty</p>
          <input className="field" defaultValue={d.phone} placeholder="Telefon" />
          <input className="field" defaultValue={d.email} placeholder="E-mail pro poptávky" />
        </section>
        <section className="surface-card space-y-2 p-5">
          <p className="font-semibold">Notifikace</p>
          {[
            "Nová poptávka na vůz (e-mail)",
            "Upozornění na ležák a nabídka aukce",
            "Nový příhoz v mé aukci",
            "Vystavená faktura",
          ].map((n) => (
            <label key={n} className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />{" "}
              {n}
            </label>
          ))}
        </section>
        <section className="surface-card space-y-3 p-5">
          <p className="font-semibold">Uživatelé</p>
          {[
            ["Pavel Kolben", "vlastník"],
            ["Jana Malá", "prodejce"],
          ].map(([n, r]) => (
            <div key={n} className="flex justify-between text-sm">
              <span>{n}</span>
              <span className="text-muted-foreground">{r}</span>
            </div>
          ))}
          <button type="button" className={btn.ghost} onClick={() => toast("Pozvánka odeslána")}>
            Pozvat uživatele
          </button>
        </section>
        <div>
          <button className={btn.primary}>Uložit změny</button>
        </div>
      </form>
    </>
  );
}
