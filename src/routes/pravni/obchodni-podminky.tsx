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
      <h2>3. Inzerce a poplatky</h2>
      <p>
        <strong>Fyzická osoba</strong> (nepodnikatel) může mít na jeden účet zdarma 1 aktivní
        inzerát vlastního vozidla po dobu 60 dní. Inzerci v rámci podnikání nelze vydávat za
        soukromou.
      </p>
      <p>
        <strong>Podnikatel (autobazar, firma)</strong> si volí tarif: (a) <em>platba za vůz</em> –
        149 Kč, 249 Kč nebo 499 Kč bez DPH za 30 dní podle ceny vozidla (do 200 000 Kč, do 700 000
        Kč, nad 700 000 Kč), nebo (b) <em>předplatné balíčku slotů</em> za měsíční paušál dle
        ceníku, v jehož rámci lze vozidla libovolně měnit. Za vozidlo, jehož cena přesahuje limit
        balíčku, se účtuje doplatek ve výši rozdílu tabulkové ceny inzerátu nejvyšší kategorie a
        podílu slotu.
      </p>
      <p>
        U obou tarifů se sazba za vozidlo ve 2. měsíci inzerce navyšuje o 50 % a od 3. měsíce o 100
        %. Při převodu vozidla do aukce Provozovatel navýšení za daný měsíc odpouští. Při prodeji
        vozu vzniká provize dle platného ceníku. Faktury jsou vystavovány měsíčně v elektronické
        podobě (PDF s ISDOC) se splatností 14 dní. Tarif lze změnit v administraci; nový tarif platí
        okamžitě.
      </p>
      <h2>4. Aukční řád</h2>
      <ul>
        <li>
          Vozidlo zařazené do aukce je nejprve zveřejněno v galerii připravovaných aukcí a aukce
          začíná v uvedený čas. Vyvolávací cena je 1 Kč, prodávající může stanovit minimální cenu.
        </li>
        <li>
          Přihazovat může registrovaný dražitel, který potvrdil tento aukční řád. Příhoz je závazný.
          Automatické přihazování přihazuje za dražitele nejvýše do jím zvolené částky.
        </li>
        <li>
          Příhoz v posledních 2 minutách prodlužuje aukci o 2 minuty. Prodávající ani osoby s ním
          spojené nesmí přihazovat na vlastní vozidla.
        </li>
        <li>
          Vydražitel je povinen do 3 pracovních dnů uhradit kupní cenu prodávajícímu a aukční
          poplatek Provozovateli ve výši uvedené u aukce (3–5 % z vydražené ceny). Nedosáhne-li
          nejvyšší příhoz minimální ceny, vozidlo se neprodá.
        </li>
      </ul>
      <h2>4a. Financování a operativní leasing</h2>
      <p>
        Výpočty splátek jsou orientační. Provozovatel na základě souhlasu zákazníka předává žádost
        vybraným poskytovatelům; smlouvu o úvěru nebo operativním leasingu uzavírá zákazník přímo s
        poskytovatelem. Porovnání vozidel slouží k informaci a nepředstavuje doporučení.
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
