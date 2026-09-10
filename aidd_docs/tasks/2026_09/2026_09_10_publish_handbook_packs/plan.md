---
objective: "Le starter kit Mist Engine peut installer depuis schema-in-the-mist les trois packs versionnés et tous leurs assets déclarés, avec des notices de droits publiées et une validation empêchant toute publication incohérente."
status: implemented
---

# Plan: Achever la publication des packs Handbook

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Compléter le travail déjà publié par `34bb7e7` avec les notices de droits et de provenance manquantes, sans retirer les assets existants, puis ajouter une validation durable du catalogue, des manifests et des assets. |
| **Source** | GitHub ticket [`RebelliousSmile/schema-in-the-mist#8`](https://github.com/RebelliousSmile/schema-in-the-mist/issues/8) |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Publier les notices de droits des packs | [`phase-1.md`](./phase-1.md) |
| 2   | Verrouiller le contrat de publication | [`phase-2.md`](./phase-2.md) |
| 3   | Prouver l'installation par le starter kit | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [Issue #8](https://github.com/RebelliousSmile/schema-in-the-mist/issues/8) | Le dépôt doit publier `handbook.json`, les packs City of Mist et Legend in the Mist, leurs assets et licences, avec versions, dépendances, polarités/variantes et ressources; le starter kit ne doit plus dépendre des anciens doublons de Handbook. |
| [`34bb7e7`](https://github.com/RebelliousSmile/schema-in-the-mist/commit/34bb7e7) | Le catalogue, les trois packs Mist Engine, leurs versions, capacités, polarités/variantes et les assets déclarés sont déjà sur `main`; les notices propres aux assets et à PragRoman ne le sont pas. |
| [Handbook repository manifest reader](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/src/games/repositoryManifest.ts) | Le catalogue public est strict: version de format 1, dépôt `owner/repository`, identifiants uniques, SemVer et chemins relatifs sûrs. |
| [Handbook source installer](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/src/games/sourceInstaller.ts) | Handbook lit `handbook.json`, vérifie la correspondance id/version, puis télécharge uniquement les images et polices explicitement déclarées sous la racine d'assets du pack. |
| [Mist Engine starter kit](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/starter-kits/catalog.json) | Le kit pointe vers `RebelliousSmile/schema-in-the-mist` sur la branche `main` et démarre en mode `city-of-mist`. |
| [Son of Oak asset notice](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/licenses/assets/SonOfOak.LICENSE.txt) | Handbook conserve une notice qui inventorie les illustrations City of Mist et Legend in the Mist distribuées; son texte doit être repris sans reformulation juridique. |
| [PragRoman font notice](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/licenses/fonts/PragRoman.LICENSE.txt) | La police distribuée dans le pack Legend in the Mist possède une notice distincte et restrictive qui doit accompagner le binaire. |
| [Canonical game-pack schema](https://github.com/RebelliousSmile/schema-appearance/blob/main/schemas/appearance/game-pack.schema.json) | La partie `pack` de chaque manifest possède déjà un contrat JSON Schema public; la validation locale doit utiliser la copie de compatibilité synchronisée plutôt que réinventer ce sous-format. |

## Decisions

| Decision | Why |
| -------- | --- |
| Prendre `34bb7e7` comme baseline et ne pas republier ni renommer les packs existants. | Les identifiants et versions `1.0.0` sont déjà consommables depuis `main`; les modifier élargirait inutilement le ticket et pourrait casser les installations existantes. |
| Centraliser les notices tierces dans `handbook/LICENSES/` et les relier depuis `handbook/README.md` et le README racine. | Les droits concernent plusieurs packs, tandis que Handbook n'installe que les fichiers d'assets explicitement déclarés et n'expose aucun champ de licence dans son manifest. |
| Conserver les assets actuellement publiés, y compris PragRoman, et documenter sans ambiguïté que leur droit de redistribution n'a pas été établi. | Le mainteneur choisit explicitement de préserver le rendu et l'historique de Brumes malgré le risque connu; une notice ne doit toutefois jamais être présentée comme une autorisation. |
| Ajouter une validation producteur autonome à `schema-in-the-mist`, branchée sur `npm run check`. | Le dépôt peut garantir en CI la cohérence de ses chemins, versions, capacités et assets sans importer le code interne de Handbook ni dépendre du réseau. |
| Valider la partie apparence avec la copie locale du schéma canonique, puis appliquer les invariants propres à l'enveloppe Handbook. | Cela évite de dupliquer le contrat `game-pack` tout en couvrant les champs que ce schéma ne porte pas: version du manifest, version du pack, version minimale de Handbook, capacités et variantes. |
| Réserver la compatibilité des capacités et l'installation complète à un test avec le vrai code de Handbook 2.7.x. | Réimplémenter son registre de capacités dans le dépôt producteur créerait un second contrat susceptible de dériver et ne prouverait pas que le consommateur réel accepte les packs. |
| Exécuter l'intégration dans un répertoire temporaire, sans ajouter Handbook comme dépendance du dépôt. | Le test de clôture doit utiliser le consommateur réel tout en gardant la CI quotidienne de `schema-in-the-mist` autonome et reproductible hors réseau. |
