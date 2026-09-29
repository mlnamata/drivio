import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/pravni/obchodni-podminky")({
  head: () => ({ meta: [{ title: "Obchodní podmínky | Drivio" }] }),
  component: () => (
    <LegalPage title="Všeobecné obchodní podmínky" updated="1. 10. 2026">
      <h2>1. Provozovatel</h2>
      <p>
        Provozovatelem portálu drivio.cz je Drivio s.r.o., IČO [doplnit], se sídlem [doplnit],
        zapsaná v obchodním rejstříku vedeném [doplnit] (dále jen „Provozovatel").
      </p>
      <h2>2. Vymezení služeb</h2>
      <ul>
        <li>
          Pro návštěvníky: vyhledávání vozidel, kontakt na prodejce, účast v aukcích a
          zprostředkování nabídky financování.
        </li>
        <li>
          Pro autobazary: pronájem inzertní kapacity (slotů) formou měsíčního předplatného, aukční
          modul a související služby.
        </li>
      </ul>
      <h2>3. Předplatné a poplatky autobazarů</h2>
      <p>
        Autobazar hradí měsíční paušál dle zvoleného balíčku. Za vozidlo, jehož cena přesahuje limit
        balíčku, je účtován doplatek ve výši rozdílu tabulkové ceny inzerátu nejvyšší kategorie a
        podílu slotu. Sazba slotu se ve 2. měsíci inzerce navyšuje o 50 % a od 3. měsíce o 100 %.
        Při převodu vozu do aukce Provozovatel navýšení za daný měsíc odpouští.
      </p>
      <p>
        Při prodeji vozu vzniká provize dle platného ceníku. Faktury jsou vystavovány měsíčně v
        elektronické podobě (PDF s ISDOC) se splatností 14 dní.
      </p>
      <h2>4. Aukce</h2>
      <p>
        Příhoz je závazný. Aukce končí v uvedený čas; příhoz v posledních 2 minutách ji prodlužuje o
        2 minuty. Vydražitel je povinen uhradit kupní cenu prodejci a aukční poplatek Provozovateli
        ve výši uvedené u aukce. Prodejce nesmí přihazovat na vlastní vozidla.
      </p>
      <h2>5. Odpovědnost</h2>
      <p>
        Za pravdivost údajů v inzerátu odpovídá autobazar. Kupní smlouva se uzavírá mezi kupujícím a
        autobazarem; Provozovatel není smluvní stranou.
      </p>
      <h2>6. Řešení sporů</h2>
      <p>
        Spotřebitel může využít mimosoudní řešení sporů u České obchodní inspekce (www.coi.cz). Tyto
        podmínky se řídí právem České republiky.
      </p>
      <p className="text-sm !text-muted-foreground">
        Text je šablona – před spuštěním nechte zkontrolovat advokátem.
      </p>
    </LegalPage>
  ),
});
