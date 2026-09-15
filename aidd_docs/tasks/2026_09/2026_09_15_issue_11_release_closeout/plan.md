---
objective: "L’issue #11 est prouvée contre la release City v1.2.0 par des assertions système reproductibles et portables, puis peut être clôturée avec des preuves de cycle de vie et d’isolation."
status: implemented
---

# Plan: Closeout de la release des feuilles de style de pack

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Ajouter la preuve système portable qui relie le pack installé à son CSS résolu, puis clôturer l’issue #11. |
| **Source** | GitHub issue [RebelliousSmile/schema-in-the-mist#11](https://github.com/RebelliousSmile/schema-in-the-mist/issues/11) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Verrouiller la preuve de la release City | [phase-1.md](./phase-1.md) |
| 2 | Vérifier les livrables et clôturer l’issue | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #11](https://github.com/RebelliousSmile/schema-in-the-mist/issues/11) | Définit le manifeste, l’installation sûre, l’ordre de cascade, l’isolation et la migration City attendus. |
| [Release v1.2.0](https://github.com/RebelliousSmile/schema-in-the-mist/releases/tag/v1.2.0) | Release publique non brouillon qui attache l’archive et son checksum ; le tag contient le manifest City et `assets/styles/city-of-mist.css`. |
| [Issue Handbook #32](https://github.com/RebelliousSmile/obsidian-handbook/issues/32) | Implémentation consommateur fermée : staging, validation PostCSS, élément dédié et nettoyage au changement de pack. |

## Decisions

| Decision | Why |
| --- | --- |
| Conserver les plans d’implémentation existants comme historique et créer un closeout séparé. | Ils sont déjà `implemented`; les modifier pour y ajouter une phase en attente casserait leur cycle de statut. |
| Prouver la chaîne runtime dans le harnais de packs existant, depuis le CSS installé jusqu’à `resolveGameAssets`. | Cette preuve Node/TypeScript est déterministe et compatible Windows ; elle couvre le maillon qui manquait entre staging et injecteur. |
| Conserver le parcours E2E v1.0.0/v1.2.0 comme diagnostic optionnel, sans en faire une condition de clôture. | Il demande un AppImage et un vault Linux dédiés, indisponibles dans le poste de développement courant ; les critères de #11 restent intégralement vérifiables par les harnais portables. |
| Ne fermer #11 qu’après les preuves automatisées de staging, résolution, portée et nettoyage. | Le statut GitHub doit refléter un comportement observable, pas seulement des commits publiés. |
