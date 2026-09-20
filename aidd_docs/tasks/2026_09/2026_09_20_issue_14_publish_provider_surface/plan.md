---
objective: "Le paquet v1.3.3 publie un descripteur versionné et les packs Handbook qu’il annonce, vérifiés depuis un consommateur isolé, sans conserver d’archives de release dans Git."
status: in-progress
---

# Plan: Publier la surface du provider et des packs

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Rendre le contrat du provider auto-identifiable et rendre accessibles, dans le tarball comme par les exports, le descripteur et les manifests Handbook publiés. |
| **Source** | GitHub issue [RebelliousSmile/schema-in-the-mist#14](https://github.com/RebelliousSmile/schema-in-the-mist/issues/14) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Publier et prouver la surface déclarée | [phase-1.md](./phase-1.md) |
| 2 | Livrer le correctif et nettoyer les artefacts Git | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #14](https://github.com/RebelliousSmile/schema-in-the-mist/issues/14) | Demande `contractVersion: 1`, l’inclusion du descripteur et de `handbook/` dans le tarball, les exports résolubles correspondants, et le retrait des archives suivies. |
| [npm — package.json `files`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#files) | Le champ `files` contrôle la sélection de fichiers emballés par `npm pack`; il doit donc inclure le descripteur et le répertoire Handbook. |
| [Node.js — package entry points](https://nodejs.org/api/packages.html#package-entry-points) | Le champ `exports` encapsule les sous-chemins publics ; les fichiers empaquetés restent inaccessibles par résolution tant que leurs sous-chemins ne sont pas exportés. |

## Decisions

| Decision | Why |
| --- | --- |
| Publier tout `handbook/`, plutôt que seulement les trois manifests. | Les manifests déclarent des assets sous cette racine ; publier seulement leurs JSON créerait de nouveau des références mortes dans le paquet installé. |
| Garder `contractVersion` à 1 et sortir un correctif `v1.3.3`. | Le contrat reste compatible et sa valeur doit égaler `CONTRACT_VERSION`; la correction concerne l’accessibilité de surfaces déjà détenues par ce producteur. |
| Conserver les archives seulement comme assets de GitHub Release, jamais comme fichiers Git. | `.gitignore` couvre déjà ces sorties, tandis que les quatre fichiers historiques suivis polluent le dépôt et ne sont pas nécessaires à la distribution immuable. |
