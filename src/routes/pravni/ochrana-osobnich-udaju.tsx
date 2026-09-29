import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/pravni/ochrana-osobnich-udaju")({
  head: () => ({ meta: [{ title: "Ochrana osobních údajů | Drivio" }] }),
  component: () => (
    <LegalPage title="Zásady zpracování osobních údajů" updated="1. 10. 2026">
      <h2>Správce</h2>
      <p>
        Správcem osobních údajů je Drivio s.r.o., IČO [doplnit]. Kontakt pro ochranu osobních údajů:
        gdpr@drivio.cz.
      </p>
      <h2>Jaké údaje a proč zpracováváme</h2>
      <ul>
        <li>
          <strong>Účty autobazarů</strong> – identifikační a kontaktní údaje, fakturace. Právní
          základ: plnění smlouvy.
        </li>
        <li>
          <strong>Dotazy na prodejce</strong> – jméno, e-mail, telefon, zpráva. Předáváme dotčenému
          autobazaru. Právní základ: plnění smlouvy / oprávněný zájem.
        </li>
        <li>
          <strong>Žádosti o financování</strong> – jméno, kontakt, požadovaná částka. Předáváme
          vybraným finančním partnerům (Essox s.r.o., Home Credit a.s., Cofidis s.r.o.) pouze na
          základě vašeho výslovného souhlasu. Ukládáme čas, znění a verzi souhlasu a IP adresu.
        </li>
        <li>
          <strong>Aukce</strong> – identita dražitele a historie příhozů. Právní základ: plnění
          smlouvy.
        </li>
        <li>
          <strong>Cookies</strong> – viz zásady cookies.
        </li>
      </ul>
      <h2>Doba uložení</h2>
      <p>
        Leady na financování 12 měsíců od udělení souhlasu, účetní doklady 10 let, ostatní po dobu
        trvání účtu a 3 roky poté.
      </p>
      <h2>Kde jsou data uložena</h2>
      <p>
        Data jsou uložena výhradně v datových centrech v EU (Frankfurt, eu-central-1). Nepředáváme
        je do třetích zemí.
      </p>
      <h2>Vaše práva</h2>
      <ul>
        <li>
          přístup, oprava, výmaz („právo být zapomenut"), omezení zpracování a přenositelnost,
        </li>
        <li>odvolání souhlasu kdykoli, bez vlivu na předchozí zpracování,</li>
        <li>stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz).</li>
      </ul>
      <p>
        Při výmazu údaje anonymizujeme; záznamy nutné ze zákona (účetnictví) uchováváme po zákonnou
        dobu.
      </p>
    </LegalPage>
  ),
});
