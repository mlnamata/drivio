---
name: drivio-design
description: Pravidla vzhledu webu Drivio (bazar a leasing aut). Použij při každé úpravě UI v tomto repozitáři – nové stránce, komponentě, změně textů, barev, rozložení nebo při kontrole, jestli web nevypadá jako „vygenerovaný AI“.
---

# Drivio – jak upravovat vzhled

1. Přečti `DESIGN.md` v kořeni repozitáře. Tam je směr (prodejní štítek za oknem auta),
   barvy, písmo, poloměry a seznam věcí, které na webu nechceme.
2. Před úpravou UI si přečti `reference/impeccable-craft-floor.md` (minimální kvalita: kontrast,
   stavy, prvky prohlížeče, zákazy jako nadtitulky nad nadpisy nebo sklo jako dekorace).
3. Při větší změně vzhledu použij i skills `frontend-design`, `avoid-ai-design` a `taste-skill`
   ve složce `.claude/skills/`. Pokud jsou v rozporu s `DESIGN.md`, platí `DESIGN.md`.
4. Po úpravě spusť `npm run design:check`. Výsledek musí být 0 nálezů. Vědomou výjimku označ
   komentářem `avoid-ai-design-ignore: <ID>` s důvodem.
5. Podívej se na výsledek v prohlížeči (Playwright, šířky 390 a 1440 px), ne jen do kódu.

## Rychlý přehled

- Písmo: jen Archivo (hostované v `public/fonts`). Nadpisy rozšířené (`font-stretch` 112–118 %),
  text normální šířky. Logo v administraci je Exo 2. Žádné Google Fonts, žádný Inter.
- Barvy: grafit `--foreground`, bílá karta, oranžová `--primary` jen pro hlavní akci, cenu
  a aktivní stav. Drobný oranžový text vždy `text-primary-ink` (kontrast 5,5 : 1), na oranžové
  ploše grafitový text (`text-primary-foreground`).
- Plochy: karta = `surface-card` (rámeček, bez stínu). Stín jen u věcí, které plavou
  (hlavička po odrolování, lišta porovnání, cookies, dialogy). Žádné `backdrop-blur`, žádné
  barevné skvrny a přechody v pozadí.
- Tlačítka `rounded-lg`, plně kulaté jen štítky, čipy a přepínače kategorií.
- Nadpis sekce přes `SectionTitle` – bez nadtitulku. Odkaz „zobrazit vše“ patří do `action`.
- Texty česky a konkrétně: tlačítko říká, co udělá. Mezi jednoznakovou předložkou a dalším slovem
  nezlomitelná mezera (`{" "}`), čísla a jednotky také (`cars()` to dělá samo).
  Žádné „→“ za odkazem, žádné „ · “ jako oddělovač, žádné slovo v nadpisu zvýrazněné barvou.
- Recenze, loga partnerů a čísla na webu musí být skutečné. Vymyšlené recenze zakazuje zákon.
