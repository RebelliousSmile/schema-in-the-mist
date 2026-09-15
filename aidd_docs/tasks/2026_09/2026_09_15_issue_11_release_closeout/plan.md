---
objective: "L’issue #11 est prouvée contre la release City v1.2.0 par des assertions reproductibles, puis peut être clôturée avec des preuves de cycle de vie et d’isolation."
status: in-progress
---

# Plan: Closeout de la release des feuilles de style de pack

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Ajouter la preuve d’intégration qui manque entre Handbook et la release City v1.2.0, puis clôturer l’issue #11. |
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
| Prouver la release v1.2.0 via le vrai chemin d’installation, pas uniquement avec une fixture CSS générique. | La feuille City est la première ressource expédiée qui exerce le contrat de bout en bout. |
| Ajouter la preuve v1.2.0 au parcours E2E sans retirer son contrôle historique v1.0.0. | La nouvelle régression vérifie la feuille City tout en préservant la compatibilité déjà couverte du premier tag. |
| Ne fermer #11 qu’après les preuves automatisées et le contrôle de transition City vers un pack sans CSS. | Le statut GitHub doit refléter un comportement observable, pas seulement des commits publiés. |
