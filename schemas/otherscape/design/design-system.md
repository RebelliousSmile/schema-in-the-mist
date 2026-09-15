---
status: figé
version: 1.1.0
---

# Otherscape — direction de layout

## Provenance

Extrait le 15 septembre 2026 des six captures fournies dans `C:\Users\fxgui\Documents\Perso\RPG\otherscape\_sources\Design` : `page.jpg`, `dark.jpg`, `chapter-title.jpg`, `dark-chapo.jpg`, `light-chapo.jpg` et `description.jpg`. Figé en v1.1.0 : les maquettes claires alimentent `metro/light`, les maquettes sombres `metro/dark` ; les pistes de refonte du rapport de critique restent différées. Le delta v1.1.0 ajoute les accents de cartes `self`, `mythos` et `noise`, en clair et en sombre, sur les classes réellement émises par le bloc Handbook `os-theme`.

Le dépôt est une bibliothèque de schémas TypeScript (`package.json` : `typescript`, `tsx`) sans interface web, runtime visuel ni préprocesseur de styles déclaré. Aucun consommateur d’adaptateur n’est donc détecté à ce stade ; aucun fichier sous `design/adapters/` n’est produit.

## Foundations

La direction transpose une mise en page de livre de jeu de rôle éditoriale : précise, dense et mécanique, où le fantastique s’insinue dans un futur saturé de technologie. Les fonds alternent entre un papier blanc légèrement bruité et une nuit bleu-noir quadrillée ; les accents de signalisation sont jaune acide, avec cyan et rouge néon dans les textures, séparateurs ou médias — jamais comme couleur de corps de texte.

L’ancre de palette est `color.brand.primary` (`#C8FF2E`) sur les neutres froids. Les titres emploient `font.family.display`, une condensée noire, en capitales. Le texte courant utilise `font.family.sans`, compact mais respirant. La marque « œil » est un emblème custom ; les icônes d’interface sont **Lucide, outline**, avec les tokens `icon.size.*` et `icon.stroke.*`. Aucun emoji ne sert d’icône UI.

Les correspondances relevées et leurs contrastes estimés sont :

| Premier plan | Fond | Usage observé | Contraste | Verdict |
| --- | --- | --- | --- | --- |
| `color.neutral.900` | `color.brand.primary` | titres sur surlignage jaune | ~16:1 | AA |
| `color.neutral.900` | `color.semantic.background` | titres et corps sur papier | ~19:1 | AA |
| `color.neutral.50` | `color.neutral.900` | texte et titres en panneau sombre | ~19:1 | AA |
| `color.brand.primary` | `color.neutral.900` | étiquettes/titres verts sur sombre | ~17:1 | AA |

Les valeurs sont un brouillon issu d’images compressées, à confirmer avant figeage ; `tokens.json` est la source de vérité.

## Responsive strategy

Le cœur mobile est une colonne de lecture : libellé de chapitre en haut, titre, chapo, puis sections dans l’ordre documentaire. Les titres gardent leur cartouche jaune mais peuvent passer à plusieurs lignes ; les éléments décoratifs ne doivent jamais recouvrir le texte.

À `breakpoint.md`, une gouttière de métadonnées verticale peut apparaître sur le bord de page. À `breakpoint.lg`, les pages éditoriales passent à une grille de deux colonnes équilibrées séparées par une règle très fine ; un bloc d’appel peut occuper une colonne complète. À `breakpoint.xl`, les héroïnes illustrées et les bandes glitch peuvent déborder du conteneur de lecture, tandis que le texte reste limité à `size.container.reading` par colonne. Les seuls breakpoints constatables sont la composition en colonnes des captures larges ; les seuils numériques sont donc des hypothèses par défaut, en mobile-first.

## Component inventory

Cet inventaire est une **prose candidate et malléable**, non un manifeste. `design:adjust` le promouvra vers le manifeste ; la règle canonique du vocabulaire alors ouvert est `skills/adjust/references/manifest-schema.md § Invariant 1`.

| Candidat | Rôle et variantes apparentes | Fonds | Avant-plans | Divergence responsive | Futur fichier de spec |
| --- | --- | --- | --- | --- | --- |
| Cartouche de titre | Titre de section ; `light` et `dark` | `color.brand.primary` | `color.neutral.900` | largeur intrinsèque sur mobile ; reste ancré à la colonne sur large | `design/components/section-label.md` |
| En-tête de chapitre | emblème, sur-titre, display title ; `paper` / `night` | `color.semantic.background`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` | illustration et ampleur du display s’enrichissent à `lg` | `design/components/chapter-header.md` |
| Chapo éditorial | paragraphe d’ouverture fortement agrandi | `color.semantic.background`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` | une colonne mobile, une demi-colonne large | `design/components/lead.md` |
| Section de lecture | titre, corps, séparateur ; `paper` / `night` | `color.semantic.background`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` | passe dans la grille deux colonnes à `lg` | `design/components/editorial-section.md` |
| Encadré thématique | callout avec contour technique et bande glitch facultative | `color.semantic.surface`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` | pleine largeur mobile ; peut occuper une seule colonne large | `design/components/thematic-callout.md` |
| Carte de thème | fiche PJ à type explicite : `self`, `mythos`, `noise` ou `crew` ; titre, tags, quête et pistes | `color.semantic.surface` | `color.semantic.text`, `color.theme.self`, `color.theme.mythos`, `color.theme.noise` | deux colonnes de tags sur large, une seule colonne étroite | `design/components/theme-card.md` |
| Rail de folio | titre d’ouvrage, chapitre, numéro de page, orientation verticale | `color.semantic.background`, `color.neutral.900` | `color.neutral.700`, `color.neutral.200` | intégré horizontalement au flux mobile ; rail vertical à `md` | `design/components/folio-rail.md` |
| Média illustré | illustration/personnage, cadre doux, légende facultative | `color.semantic.surface` | `color.neutral.900` | plein conteneur mobile ; grille de deux médias à `lg` | `design/components/illustration-panel.md` |
| Séparateur glitch | rupture de chapitre ; `quiet` / `signal` | `color.semantic.background`, `color.neutral.900` | `color.brand.signal`, `color.brand.cyan` | décoratif : peut être simplifié au mobile | `design/components/glitch-divider.md` |

## Open questions

- Les familles exactes ne sont pas embarquées dans la référence ; Barlow/Barlow Condensed sont des substituts proches à valider contre les fontes sous licence du jeu.
- Les captures ne démontrent ni les états interactifs, ni le focus, ni la motion ; les tokens de motion sont supposés et aucun effet glitch ne doit être requis pour comprendre le contenu.
- [non résolu au figeage — à traiter] Le mécanisme de sélection thème/variante côté Handbook reste à confirmer avec le consommateur réel.
- La texture de papier, la grille nocturne, les scans et les illustrations sont des ressources éditoriales, pas des tokens de couleur ; leurs règles de licence, de chargement et d’accessibilité restent à décider.
- Le profil optionnel mobile-first/accessibilité/sans emoji a été présenté mais n’a pas été activé ni persisté dans les instructions du projet.
