import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/pravni/cookies")({
  head: () => ({ meta: [{ title: "Cookies | Drivio" }] }),
  component: () => (
    <LegalPage title="Zásady používání cookies" updated="1. 10. 2026">
      <p>Cookies jsou malé soubory ukládané ve vašem prohlížeči. Používáme je takto:</p>
      <h2>Nezbytné</h2>
      <p>Přihlášení, bezpečnost, uložení volby cookies a oblíbených vozů. Nelze je vypnout.</p>
      <h2>Analytické (se souhlasem)</h2>
      <p>
        Anonymní měření návštěvnosti, abychom mohli zlepšovat vyhledávání. Spouštějí se až po
        kliknutí na „Přijmout vše".
      </p>
      <h2>Změna souhlasu</h2>
      <p>Souhlas můžete kdykoli změnit smazáním dat webu v prohlížeči nebo tlačítkem níže.</p>
      <p>
        <button
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
          onClick={() => {
            try {
              window.localStorage.removeItem("drivio:cookie-consent");
            } catch {
              /* ignore */
            }
            window.location.reload();
          }}
        >
          Změnit nastavení cookies
        </button>
      </p>
    </LegalPage>
  ),
});
