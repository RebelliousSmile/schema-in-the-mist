---
objective: "L'issue #13 établit explicitement que schema-in-the-mist ne publie pas encore de métadonnée d'adaptateur, et sépare ce constat du raccordement des 80 descripteurs par leur producteur et Lantern."
status: implemented
---

# Plan: Établir la frontière des clés d'adaptateur consommateur

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Prouver puis consigner que les contrats actuellement publiés ici ne portent pas de métadonnée d'éditeur ; aucun adaptateur React ni vocabulaire artificiel n'est donc ajouté à ce package. |
| **Source** | GitHub issue [RebelliousSmile/schema-in-the-mist#13](https://github.com/RebelliousSmile/schema-in-the-mist/issues/13) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Constater la frontière et orienter le raccordement | [`phase-1.md`](./phase-1.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #13](https://github.com/RebelliousSmile/schema-in-the-mist/issues/13) | Exige des clés déclaratives, validées côté producteur, refusées côté Lantern si inconnues, sans déplacer les adaptateurs React. |
| [Lantern architecture](https://github.com/RebelliousSmile/lantern/blob/main/docs/codebase-architecture.md) | Sépare déjà le codec publié de `TemplateEditorSchema`, dont les identifiants restent locaux à l'état d'édition. |

## Decisions

| Decision | Why |
| --- | --- |
| Ne pas confondre `schemas/otherscape/design/components.json` et un contrat d'éditeur. | Il contient dix descripteurs de classes visuelles et le package ne l'embarque pas ; il ne justifie donc ni les 80 entrées annoncées ni une clé React. |
| Enregistrer l'alternative « aucune métadonnée ne s'applique encore » de #13. | Les quatorze contrats TOML publiés ne transportent aucune description d'éditeur ; inventer une extension dans le mauvais producteur violerait la frontière de propriété. |
| Réserver le raccordement des 80 descripteurs à leur producteur réel et à Lantern. | Le producteur devra publier la liste finie avant que Lantern puisse prouver l'égalité avec son registre fermé, dans une issue et une release propres à ce contrat. |
