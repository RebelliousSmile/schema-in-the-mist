---
objective: "Handbook can consume a validated, :Otherscape-scoped design schema to render the released Otherscape pack without coupling City of Mist or Legend in the Mist to its visual language."
status: implemented
---

# Plan: Intégrer le schéma de design Otherscape à Handbook

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Transformer le brouillon visuel Otherscape en source de design spécifique au jeu, avec des modes clair et sombre distincts dérivés de leurs maquettes respectives dans la variante Handbook `metro`, projetée de façon reproductible et vérifiée en CI. |
| **Source** | Demande utilisateur : « intègre le design comme schema de design pour handbook ». |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Stabiliser la source et le contrat de projection Otherscape | [`phase-1.md`](./phase-1.md) |
| 2 | Émettre le style Handbook et raccorder le pack | [`phase-2.md`](./phase-2.md) |
| 3 | Verrouiller la dérive et documenter la distribution | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Garder toute matière de design sous `schemas/otherscape/design/` et ne créer aucun répertoire de design partagé à la racine. | Le design appartient à :Otherscape ; cette frontière évite de mélanger ses tokens, ses variantes et son évolution avec City of Mist et Legend in the Mist. |
| Introduire une table de projection Otherscape → variables Handbook, plutôt que modifier le schéma `appearance/game-pack`. | `game-pack` est le contrat cross-game canonique externe et ses copies locales sont gelées ; il accepte déjà les propriétés CSS nécessaires. Une projection spécifique maintient le changement dans le périmètre du pack. |
| Traiter les branches `metro.style.light` et `metro.style.dark`, ainsi que la feuille CSS Otherscape, comme sorties déterministes de la source de design. | La projection ne possède que le territoire Metro ; `pack.json` reste l’enveloppe publiée et la source des branches `cairo`/`tokyo`. La CI contrôle la dérive des sorties qu’elle possède sans réécrire les territoires hors scope. |
| Réserver les deux modes issus des maquettes à la variante `metro`. | `page.jpg`, `chapter-title.jpg`, `light-chapo.jpg` et `description.jpg` fondent `metro/light` ; `dark.jpg` et `dark-chapo.jpg` fondent `metro/dark`. `cairo` et `tokyo` sont explicitement hors migration et restent inchangées. |
| Ne distribuer ni capture, ni illustration, ni police tirée des références sans droit de redistribution établi. | Le pack peut fournir du CSS original et employer les fontes déjà déclarées ou des fallbacks ; les images de référence servent à la direction, pas à la publication. |
