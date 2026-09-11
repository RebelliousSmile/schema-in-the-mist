---
objective: "Un même contrat Mist Engine v1, réconcilié sans perte avec les éléments valides du dépôt, de Lantern et de Handbook, est distribué par une release immuable et valide les mêmes TOML dans les trois projets."
status: in-progress
---

# Plan: Contrat Mist Engine canonique pour Lantern et Handbook

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Faire de `schema-in-the-mist` l'unique source des schémas, types, codecs et cas de conformité des 14 documents Mist Engine utilisés par Lantern et Handbook. |
| **Source** | Issue GitHub [`RebelliousSmile/schema-in-the-mist#10`](https://github.com/RebelliousSmile/schema-in-the-mist/issues/10), complétée par la demande utilisateur de s'appuyer sur Lantern sans perdre les bons éléments déjà présents ici, puis de faire valider le même TOML par les autres projets. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Réconcilier le contrat avec Lantern et Handbook | [`phase-1.md`](./phase-1.md) |
| 2 | Publier la surface TypeScript et les codecs | [`phase-2.md`](./phase-2.md) |
| 3 | Installer le corpus et les schémas versionnés | [`phase-3.md`](./phase-3.md) |
| 4 | Verrouiller et publier la release immuable | [`phase-4.md`](./phase-4.md) |
| 5 | Épingler et éprouver le contrat dans les consommateurs | [`phase-5.md`](./phase-5.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue schema-in-the-mist #10](https://github.com/RebelliousSmile/schema-in-the-mist/issues/10) | Le producteur doit livrer schémas Zod, types, codecs TOML/JSON, JSON Schemas immuables et corpus partagé dans un tarball de GitHub Release, sans registre npm. |
| [Lantern — templates Mist Engine](https://github.com/RebelliousSmile/lantern/tree/main/src/templates) | Lantern possède les 14 schémas et couples import/export TOML des trois jeux; ils prouvent les comportements du consommateur sans remplacer les éléments valides déjà publiés ici. |
| [Handbook — règle de conception des schémas](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/aidd_docs/guidelines/schema-design.md) | Le même corpus doit servir au rejet strict du producteur et à la dégradation tolérante du consommateur, sans mélanger valeurs, forme de rendu et pixels. |
| [Handbook — corpus existant](https://github.com/RebelliousSmile/obsidian-handbook/tree/main/corpus) | Douze formats Mist disposent déjà de témoins, refus et tests de round-trip, dont `theme-card` pour le `story-theme` Legend in the Mist; leurs extensions porteuses de sens doivent être réconciliées avant le gel de v1. |
| [schema-pbta — package canonique](https://github.com/RebelliousSmile/schema-pbta/blob/main/package.json) | Le dépôt frère démontre déjà le modèle ESM, `exports`, schémas versionnés, corpus embarqué, `npm pack` et dépendance par asset GitHub Release utilisé par Handbook. |
| [Zod — JSON Schema](https://zod.dev/json-schema) | La génération distingue schéma d'entrée et de sortie et certaines transformations Zod ne sont pas représentables; la parité doit donc être prouvée sur les valeurs décodées brutes. |
| [npm — package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) | `files` ferme le contenu du tarball et `exports` définit la surface publique importable. |
| [npm — URLs comme dépendances](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#urls-as-dependencies) | Une URL HTTPS de tarball peut être installée directement sans publication dans un registre. |
| [npm — package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json) | Le lockfile conserve la résolution du tarball et son intégrité SRI. |
| [TOML 1.0.0](https://toml.io/en/v1.0.0) | La version syntaxique acceptée et émise par le contrat peut être annoncée et testée séparément de sa version métier. |
| [Semantic Versioning](https://semver.org/) | Le passage à v1 fixe l'API publique; toute rupture ultérieure exige une nouvelle majeure. |
| [GitHub — releases immuables](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) | Une release immuable verrouille le tag et les assets; les assets doivent être joints au brouillon avant sa publication. |
| [GitHub — vérifier l'intégrité d'une release](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/verify-release-integrity) | Le tarball joint peut être vérifié contre l'attestation de la release et complété par un SHA-256 publié. |
| [Lantern issue #2](https://github.com/RebelliousSmile/lantern/issues/2) | Le consommateur doit retirer ses copies locales, conserver ses formulaires et exécuter le corpus partagé via un registre de documents. |
| [Lantern issue #3](https://github.com/RebelliousSmile/lantern/issues/3) | La migration doit comparer les 14 formats et préserver contraintes, métadonnées et exports canoniques avant de supprimer les copies Lantern. |
| [Handbook issue #27](https://github.com/RebelliousSmile/obsidian-handbook/issues/27) | Le host conserve renderers et capacités, tandis que les parseurs, sérialiseurs et règles métier proviennent des packages de contrat épinglés. |

## Decisions

| Decision | Why |
| --- | --- |
| Réconcilier les 14 formats dans les deux sens : conserver tout élément valide de schema-in-the-mist, importer les comportements éprouvés de Lantern et promouvoir les extensions Handbook qui transportent réellement une valeur. | Aucun dépôt consommateur ne doit écraser contraintes, métadonnées ou valeurs correctes déjà présentes dans le futur producteur canonique. |
| Ne pas promouvoir les conventions de test ou de rendu, telles que `publication_type = "corpus"`, dans le format métier. | Un marqueur de fixture ou une préférence d'interface n'est pas une donnée échangeable et ne doit pas élargir le contrat public. |
| Identifier chaque codec par `jeu/type-document` dans un registre public exhaustif. | Plusieurs jeux partagent des noms comme `challenge` et `theme-kit`; une clé non qualifiée serait ambiguë pour les consommateurs. |
| Rejeter strictement les données invalides dans le package, mais conserver la projection tolérante de Handbook. | Le producteur doit détecter la dérive; Handbook doit continuer à rendre la partie saine d'un bloc fautif comme sa règle existante l'exige. |
| Valider les types TOML/JSON bruts sans coercition métier et générer les JSON Schemas selon la sémantique d'entrée Zod. | Une chaîne numérique ou un blanc ne doit pas être accepté par le codec puis refusé par le JSON Schema; les conversions de formulaire restent dans les consommateurs. |
| Faire porter au manifeste du corpus l'attente canonique et l'attente de chaque consommateur. | Un même refus doit pouvoir être rejeté par le package, refusé par Lantern et rendu partiellement ou pas du tout par Handbook sans dupliquer le fichier. |
| Comparer la valeur normalisée après `parse → stringify → parse`, jamais le texte TOML ni le DOM. | Ordre, espaces et matérialisation de valeurs par défaut peuvent varier sans perte sémantique. |
| Faire de `1.0.0` la première version stable, stocker les schémas sous `schemas/v1` et ancrer leurs `$id` sur le tag immuable `v1.0.0`. | Le chemin exprime la majeure du contrat et l'identifiant résout une révision qui ne peut plus bouger. |
| Distribuer un unique package ESM contenant code, schémas et corpus comme asset `.tgz` d'une GitHub Release. | Lantern et Handbook installent exactement les mêmes octets et le même kit de conformité, sans registre ni copie locale. |
| Laisser formulaires, modèles d'édition, renderers, styles et capacités dans les consommateurs. | Le contrat possède les valeurs et leur sérialisation; il ne doit dépendre ni de React, ni d'Obsidian, ni d'un moteur de rendu. |
| Garder les packs Handbook comme données installables et hors du tarball de contrat. | Leur catalogue, styles, assets et capacités ont un cycle propre et ne doivent pas exécuter de logique chez le host. |
| Publier le producteur avant de modifier les consommateurs, puis épingler la même URL et committer chaque lockfile. | Une dépendance distante ne peut être testée de façon reproductible avant l'existence de l'asset immuable. |
| Exécuter la phase consommateur dans les dépôts Lantern et Handbook après la release, sous leurs issues de suivi, tout en gardant ce plan comme contrat de clôture inter-dépôts. | Les changements ne peuvent pas être atomiques dans un seul worktree, mais l'issue #10 ne doit pas être close avant la preuve de bout en bout demandée. |
| Exécuter le corpus complet dans les trois dépôts, mais réserver le parcours avec rendu Handbook aux 12 formats que ce host supporte réellement. | `city-of-mist/custom-move` et `city-of-mist/theme-kit` n'ont pas de renderer Handbook; valider leur codec installé ne doit pas prétendre le contraire. |
