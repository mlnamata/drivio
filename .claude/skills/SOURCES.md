# Design skills v tomto repozitáři

Skills se načítají automaticky, když Claude Code pracuje v tomto repozitáři. Každý soubor je
převzatý beze změn, pokud není uvedeno jinak. Stav k 25. 10. 2026.

| Složka                                              | Zdroj                                                                                                          | Commit  | Licence                               | Co je převzato                                                                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `frontend-design/`                                  | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)                     | dbd4588 | Apache 2.0 (`LICENSE.txt`)            | celý skill                                                                                                            |
| `avoid-ai-design/`                                  | [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design)                                      | 2b7c718 | MIT (`LICENSE`)                       | `SKILL.md`, `references/`, skener `scripts/detect.mjs` (jen čte soubory, nic nestahuje)                               |
| `taste-skill/`                                      | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)                                                | 12af471 | MIT (`LICENSE`)                       | `SKILL.md` a `references/`, bez skriptů (viz `NOTICE.md`)                                                             |
| `web-design-guidelines/`                            | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | 063bee9 | MIT (podle README, text v `LICENSE`)  | celý skill; pravidla si stahuje z [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) |
| `drivio-design/reference/impeccable-craft-floor.md` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable)                                                    | 3671d50 | Apache 2.0 (`LICENSE-impeccable.txt`) | jen soubor `reference/craft-floor.md`; samotný skill Impeccable spouští stažený binární program, proto přiložen není  |
| `drivio-design/SKILL.md`                            | vlastní                                                                                                        | –       | –                                     | pravidla pro Drivio, odkazuje na `DESIGN.md`                                                                          |

Prohledané, ale nepřevzaté: [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(MIT; obecná databáze stylů a palet přes Python skript, pro hotový brand Drivio nepřináší nic, co by
neřešily skills výše).

## Kontrola

```bash
npm run design:check   # skener avoid-ai-design nad src/, musí skončit s 0 nálezy
```

Hook v `.claude/settings.json` pouští stejný skener po každé úpravě souboru přes Claude Code.
