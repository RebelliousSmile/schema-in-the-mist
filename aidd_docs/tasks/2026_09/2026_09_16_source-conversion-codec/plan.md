---
objective: "Une release v1.3.0 publiée laisse tout consommateur convertir les six cibles Lantern/Handbook depuis un TOML canonique validé vers une source déclarée concise quand c'est prouvé sans perte, sinon le TOML brut verbatim, prouvé par un corpus dédié."
status: implemented
---

<!-- Fill or omit these sections; never add, rename, or reorder one. -->

# Plan: Codec de conversion source pour Lantern et Handbook

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | Publier une API publique versionnée qui convertit un document TOML Mist Engine canonique validé en source déclarée concise (perte prouvée nulle) ou en TOML brut explicite, pour les six cibles `legend-in-the-mist/{story-theme,challenge,journey,theme-kit}` et `city-of-mist/{theme-card,danger}` ; livrer une release immuable v1.3.0. |
| **Source** | Issue GitHub [`RebelliousSmile/schema-in-the-mist#12`](https://github.com/RebelliousSmile/schema-in-the-mist/issues/12) |

## Phases

| #   | Phase        | File                         |
| --- | ------------ | ---------------------------- |
| 1   | Codec de conversion concise/brut | [`phase-1.md`](./phase-1.md) |
| 2   | Corpus de preuve de non-perte | [`phase-2.md`](./phase-2.md) |
| 3   | Documentation, réconciliation de version et release v1.3.0 | [`phase-3.md`](./phase-3.md) |

## Resources

<!-- External sources only (URLs, docs), not code files. Omit if none consulted. -->

| Source | Verified |
| ------ | -------- |
| [Issue schema-in-the-mist #12](https://github.com/RebelliousSmile/schema-in-the-mist/issues/12) | Portée exacte : six cibles nommées, contrat de résultat concis-ou-brut, corpus avec champs inconnus/meta/commentaires, release immuable, frontière sans Obsidian/rendu. |
| [Issue schema-in-the-mist #10](https://github.com/RebelliousSmile/schema-in-the-mist/issues/10) et son plan `2026_09_11_mist-engine-canonical-contract` | Conventions déjà posées et réutilisées ici : release immuable draft-first, `prepare-release.ts` reproductible, corpus possédé par le producteur, schéma strict / consommateur tolérant. |
| [Handbook — règle de conception des schémas](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/aidd_docs/guidelines/schema-design.md) | La « source déclarée » appartient au schéma (sortie canonique `stringifyToml`) ; la grammaire terse d'édition (`parse<Format>Document`) reste côté Handbook, hors de ce paquet. |
| [Zod — objects](https://zod.dev/api?id=objects) | Vérification initiale erronée (corrigée le 2026-09-16 par repro sur le code réel, pendant l'implémentation de la phase 1) : les six schémas cibles utilisent tous `.strictObject()`, à toute profondeur y compris les éléments de tableau (`ThreatSchema`, etc.) — une clé inconnue ne se fait **jamais** retirer silencieusement, elle fait lever `schema.parse()` avec une `ZodError` dont chaque issue porte `code: "unrecognized_keys"`. La détection doit donc intercepter cette erreur précise plutôt que comparer un objet validé qui n'existera jamais dans ce cas. |
| [TOML v1.0.0 — Comments](https://toml.io/en/v1.0.0#comment) | Un commentaire commence par `#` jusqu'à la fin de ligne, sauf à l'intérieur d'une chaîne ; aucune dépendance du dépôt (`smol-toml`, `@iarna/toml`) n'expose les commentaires après parsing — la détection doit se faire sur le texte brut avant parsing. |
| [GitHub — releases immuables](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) | Réutilisé tel quel pour la phase 3 ; même procédure que `v1.0.0`/`v1.1.0`/`v1.2.0`. |

## Decisions

<!-- Architecture-magnitude only, one you'd regret reversing. Omit if none qualify. -->

| Decision | Why |
| -------- | --- |
| « Concis » = `stringifyToml(schema.parse(table))` ; « brut » = le texte TOML d'entrée renvoyé verbatim, octet pour octet. | Le paquet ne réimplémente pas de nouvelle grammaire ; la sortie concise reste la forme canonique que le schéma possède déjà. |
| Preuve de non-perte = trois signaux indépendants, n'importe lequel force le repli brut : (1) `schema.parse(table)` lève une `ZodError` dont **toutes** les issues portent `code: "unrecognized_keys"` (à n'importe quelle profondeur, y compris dans un élément de tableau) — capturée explicitement et transformée en repli brut, toute autre issue restant fatale et propagée telle quelle ; (2) une fois le parse réussi, `isLosslessSubset`, structurel et récursif à travers objets et tableaux imbriqués, détecte une divergence de valeur introduite par une transformation du schéma (`.trim()`, coercion) — une clé additionnelle côté validé (`.default()`) n'est pas un échec ; (3) un lexeur minimal détecte un commentaire `#` hors chaîne dans le texte brut. | Les six schémas cibles utilisent `.strictObject()` à toute profondeur (vérifié par repro le 2026-09-16, corrigeant l'hypothèse initiale du plan) : une clé inconnue ne survit jamais un `schema.parse()` réussi, elle le fait échouer avant que toute comparaison structurelle ne s'exécute. La traiter comme une erreur fatale romprait la promesse de l'issue #12 de préserver le contenu brut plutôt que de faire échouer la conversion sur un document par ailleurs légitime (ex. un champ ajouté ad hoc par un·e auteur·ice) ; le filtre `every(issue => issue.code === "unrecognized_keys")` la distingue précisément d'une erreur de validation réelle (champ manquant, type erroné), qui doit rester fatale. `isLosslessSubset` garde son rôle et sa récursion dans les tableaux d'objets (`threats[]`, `vignettes[]`, …) pour le résidu réel : les transformations de valeur (`.trim()` notamment, omniprésent sur les champs texte) que `schema.parse()` applique silencieusement sans lever. |
| Le codec de conversion est générique sur `z.ZodType`, comme `createTomlCodec`/`createJsonCodec`, et vit dans `src/codecs/source.ts` — aucune logique par cible. | Cohérent avec la convention « chaque cible est autonome, rien n'est importé d'un fichier voisin » : ce module est de l'infra partagée, pas du code métier par jeu. |
| Le périmètre des six cibles est un registre explicite et distinct de `MIST_ENGINE_CODECS` (qui en couvre 14), plutôt qu'une activation silencieuse pour les 14. | L'issue #12 nomme exactement six cibles ; une activation large donnerait un faux sentiment de couverture pour les huit autres, jamais prouvées par corpus. |
| Le corpus de conversion vit dans son propre manifeste (`corpus/contract/source-conversion-cases.json`), pas dans `corpus/contract/cases.json`. | Le manifeste existant a un schéma de champs (`canonical`/`lantern`/`handbook`) et une assertion de couverture pensés pour les 14 cibles ; y greffer un axe concis/brut qui ne s'applique qu'à six d'entre elles casserait cette assertion ou l'affaiblirait pour tous. |
| La release qui clôt cette issue absorbe l'entrée `CHANGELOG.md` « v1.3.0 » déjà écrite mais jamais publiée (package.json, `SCHEMA_RELEASE_TAG` et `gh release list` s'accordent tous sur v1.2.0 comme dernière release réelle), au lieu de la traiter comme déjà expédiée. | Publier une release v1.3.0 vide juste pour corriger la dérive du CHANGELOG serait un aller-retour inutile ; la réconciliation et la nouvelle fonctionnalité partagent la même release. |
| Vérifié (`git show 6c2392d`, `gh release list`, `git rev-parse v1.3.0`) : un tag annoté local `v1.3.0` existe déjà, mais pointe sur `6c2392d` (qui renomme seulement l'en-tête `CHANGELOG.md`, sans toucher `package.json` ni `contract-version.ts`) — deux commits derrière `HEAD`, et jamais publié comme release GitHub. La phase 3 doit le repositionner (`git tag -f`) sur le commit de release réel une fois `package.json`/`contract-version.ts` effectivement à 1.3.0, plutôt que d'échouer sur un tag existant ou d'en créer un second. | Un tag local orphelin, laissé par une tentative de release interrompue avant les deux commits `otherscape` suivants, ferait échouer silencieusement `git tag v1.3.0` en phase 3 s'il n'est pas anticipé. |
