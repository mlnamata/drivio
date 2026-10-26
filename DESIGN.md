# Drivio – design

Jednotná pravidla vzhledu. Platí pro veřejný web i administraci. Když se nějaká pravidla
z `.claude/skills/` rozcházejí s tímto souborem, platí tento soubor.

## Směr

**Prodejní štítek za oknem ojetého auta.** Bílý papír, grafitový text, údaje srovnané do
sloupců jako na štítku (najeto, palivo, převodovka), cena velkým písmem a měsíční splátka hned
vedle. Oranžová z loga funguje jako blinkr: jen tam, kam má oko jít (hlavní akce, splátka,
aktivní filtr). Tmavé grafitové pásy přes celou šířku stránky mají jen místa „s provozem“:
aukce, úvod operativního leasingu, stránka pro autobazary a patička.

Web je hlavně pro zákazníky. Hlavička obsahuje jen nákup, leasing, aukce a financování.
Autobazary, leasingové společnosti a inzerenti mají vlastní oddíl v patičce.

## Barvy

| Token                  | Hodnota                             | Použití                                               |
| ---------------------- | ----------------------------------- | ----------------------------------------------------- |
| `--foreground`         | `oklch(0.21 0.004 60)` ≈ `#1f1e1d`  | text, tmavá tlačítka (grafit z loga)                  |
| `--background`         | `oklch(0.985 0.002 75)`             | podklad stránky                                       |
| `--card`               | bílá                                | karty, hlavička, formuláře                            |
| `--primary`            | `oklch(0.665 0.185 45)` ≈ `#ea7930` | oranžová z loga: plochy tlačítek, ikony, aktivní stav |
| `--primary-foreground` | grafit                              | text na oranžové (5,8 : 1; bílá by měla jen 3 : 1)    |
| `--primary-ink`        | `oklch(0.52 0.16 43)`               | drobný oranžový text a odkazy na bílé (5,5 : 1)       |
| `--sidebar`            | `oklch(0.19 0.004 60)`              | tmavé pásy a patička                                  |
| `--auction`            | `oklch(0.6 0.21 25)`                | jen „živě“ u aukcí                                    |
| `--success`            | `oklch(0.6 0.14 155)`               | Cebia, výhodná cena, ověřený prodejce                 |

## Písmo

- **Archivo** (licence OFL, soubory v `public/fonts`, hostujeme sami – žádné volání Google Fonts).
  Proměnná šířka 62–125 %: nadpisy `font-stretch: 112 %`, hlavní nadpis `118 %` – široké
  grotesky jako na palubních deskách a SPZ. Běžný text ve 100 %.
- **Exo 2 Black Italic** jen pro plochou verzi loga (`LogoFlat`) na tmavém podkladu.
- Ceny, nájezdy a odpočty mají `tabular-nums`, aby se při změně čísla neposouvaly.
- Nadpisy `text-wrap: balance`, odstavce `pretty`. Délka řádku textu do cca 70 znaků.

## Tvary a plochy

- `--radius: 0.375rem`: pole a tlačítka 6 px, karty 10 px. Plně kulaté jsou jen štítky, čipy
  a přepínače kategorií.
- Karta (`surface-card`) má rámeček, ne stín. Klikací karta (`lift`) při najetí ztmaví rámeček,
  nic neposkakuje a fotka se nezvětšuje.
- Stín (`--shadow-lift`) jen u prvků, které plavou nad obsahem: hlavička po odrolování, lišta
  porovnání, lišta cookies, dialogy.
- Štítek přes fotku (`photo-chip`) je plný bílý, aby byl čitelný na každém snímku.
- Mřížky značek a karoserií mají sdílené linky (`ruled-grid`), ne samostatné karty.
- Výhody a vlastnosti se píší jako seznam s linkami (`dl`), ne jako tři karty s ikonou v kolečku.

## Text

- Česky, věcně, v jazyce kupujícího auta. Tlačítko říká, co udělá („Nastavit hlídání“,
  „Otevřít aukční síň“), ne „Zjistit více“.
- Nezlomitelná mezera za jednoznakovými předložkami a spojkami (`v`, `s`, `k`, `z`, `u`, `o`,
  `a`, `i`) a mezi číslem a jednotkou. `cars(n)` ji vkládá sama.
- České uvozovky „takto“, výpustka „…“, pomlčka – s mezerami.
- Recenze, partneři, počty a ceny jsou skutečné. Co je ukázkové, musí být označené.

## Na webu nechceme

Tyto prvky skills `frontend-design`, `avoid-ai-design`, `taste-skill` a Impeccable označují
za typické znaky stránek vygenerovaných AI:

- nadtitulek (eyebrow) nad nadpisem, štítky VELKÝMI PROLOŽENÝMI písmeny,
- jedno slovo nadpisu zvýrazněné barvou, přechodový text,
- sklo a rozmazání (`backdrop-blur`) jako dekorace, barevné skvrny a přechody v pozadí,
- tři stejné karty „ikona v kolečku + nadpis + text“, velká čísla se štítkem v úvodu,
- „→“ přilepená k odkazu, oddělovač „ · “ v popiscích, číslování 01/02/03 bez skutečného pořadí,
- písmo Inter, Plus Jakarta Sans, DM Sans a podobné výchozí volby, výchozí poloměr shadcn,
- ohrané ikony Lucide v dekorativní roli (Zap, Sparkles, Rocket, BarChart3, ArrowRight u CTA),
- všechno se stínem a zvedáním při najetí, animace bez ohledu na `prefers-reduced-motion`,
- vymyšlené recenze a loga.

## Kontrola

```bash
npm run design:check
```

Skener `avoid-ai-design` musí hlásit 0 nálezů. Vizuální stránku (rytmus, váhu barev, hierarchii)
skener neposoudí, na tu je potřeba snímek obrazovky v šířce 390 a 1440 px.
