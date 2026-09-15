# Critique — direction de layout Otherscape

- **Date** : 2026-09-15
- **Cible** : `schemas/otherscape/design/tokens.json` + `schemas/otherscape/design/design-system.md`
- **Mode** : entonnoir
- **Score de distinction** : 72/100

## Mesures

- **Couleurs** : 21 feuilles de couleur déclarées (4 marque, 8 neutres, 9 sémantiques), sur deux thèmes. La palette est assez restreinte et ne présente pas de doublon évident.
- **Échelles** : 5 tailles typographiques, 10 pas d’espacement et 4 breakpoints. L’échelle d’espace est cohérente (base 4 px) ; la hiérarchie display/body est franche.
- **Valeurs en dur / doublons / icônes** : aucun rendu, feuille de style ou composant n’existe encore dans ce dépôt ; la densité de valeurs en dur et les doublons de composants ne sont donc pas mesurables. Aucun emoji n’est prescrit comme icône.

## Contrastes mesurés

Mesure exécutée par `adapters/a11y/contrast.py` avec `--allow-unpaired`. Les paires ci-dessous sont des rôles sémantiques déduits par l’adaptateur ; aucun `components.json` n’existe encore.

| Thème | Origine | Avant-plan | Fond | Ratio | AA |
| --- | --- | --- | --- | --- | --- |
| default | rôle | `color.semantic.text` | `color.semantic.background` | 18,52:1 | oui |
| default | rôle | `color.semantic.text` | `color.semantic.surface` | 16,13:1 | oui |
| default | rôle | `color.semantic.text-muted` | `color.semantic.background` | 13,07:1 | oui |
| default | rôle | `color.semantic.text-muted` | `color.semantic.surface` | 11,38:1 | oui |
| dark | rôle | `color.semantic.text` | `color.semantic.background` | 18,52:1 | oui |
| dark | rôle | `color.semantic.text` | `color.semantic.surface` | 17,38:1 | oui |
| dark | rôle | `color.semantic.text-muted` | `color.semantic.background` | 13,10:1 | oui |
| dark | rôle | `color.semantic.text-muted` | `color.semantic.surface` | 12,30:1 | oui |

**Couverture** : 4/21 feuilles couleur appariées par rôle ; 17 non appariées : `brand` 4, `neutral` 8, `semantic` 5. En particulier, les couples emblématiques — cartouche jaune, étiquette acide sur nuit, cyan/rouge de signal — ne sont pas encore contrôlables. Le figeage sera refusé tant que les appariements de composant ne seront pas déclarés.

### Appariements à déclarer

| Composant candidat | Fonds | Avant-plans |
| --- | --- | --- |
| `section-label` | `color.brand.primary` | `color.neutral.900` |
| `chapter-header` | `color.semantic.background`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` |
| `lead` | `color.semantic.background`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` |
| `editorial-section` | `color.semantic.background`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` |
| `thematic-callout` | `color.semantic.surface`, `color.neutral.900` | `color.neutral.900`, `color.neutral.50` |
| `folio-rail` | `color.semantic.background`, `color.neutral.900` | `color.neutral.700`, `color.neutral.200` |
| `illustration-panel` | `color.semantic.surface` | `color.neutral.900` |
| `glitch-divider` | `color.semantic.background`, `color.neutral.900` | `color.brand.signal`, `color.brand.cyan` |

## Critique par lentille

### Générique vs distinctif

Le noyau éditorial — capitales condensées, cartouches jaune acide, alternance papier/nuit — restitue bien les captures. Il est toutefois encore décrit comme un système web générique : la sélection Barlow/Lucide, les trois rayons arrondis et l’ombre douce sont des choix de confort qui pourraient appartenir à n’importe quel site culturel. La direction ne définit pas encore le comportement propre à Otherscape du bruit d’impression, de la grille nocturne, des scans de marge ou de l’interruption glitch ; ces signatures risquent donc de devenir de simples arrière-plans interchangeables.

### Cohérence interne

Le contraste entre une mise en page de manuel technique, nette et anguleuse, et `radius.md`/`radius.lg` avec `shadow.panel` floue n’est pas résolu. Les captures ne montrent pas des cartes flottantes : elles privilégient le filet, le cadre imprimé et la stratification graphique. La variable `font.lineHeight.body` à 1,35 est trop serrée pour de longues colonnes de texte continu ; elle reproduit la densité de l’image mais pas nécessairement sa lisibilité numérique. Enfin, l’inventaire a des éléments éditoriaux forts, mais aucun modèle de grille explicitement nommé (marges, gouttière, largeur de colonne) : les implémentations risquent de diverger avant même de choisir un composant.

### Accessibilité

Les huit paires mesurées sont très sûres, mais le résultat ne valide pas les couleurs de marque et de signal : 17 feuilles restent hors couverture. Les effets de scan, de grille et de glitch doivent demeurer décoratifs, car une hiérarchie obtenue par opacité, voile ou texture ne serait pas mesurée par le contrôle statique. Le rail de folio vertical n’est pas un bon ordre de lecture mobile s’il précède le titre dans le DOM ; sur petit écran, il doit devenir une métadonnée courte après le titre ou avant le contenu, sans rotation nécessaire. Les futurs CTA, liens et champs ne sont pas encore inventoriés : avant le figeage, définir leurs états `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error` et `success`, avec une cible tactile d’au moins 44 × 44 px et un indicateur non exclusivement chromatique.

### Tendances & fraîcheur

Le cyberpunk néon reste expressif lorsqu’il est tenu comme langage éditorial, mais le glitch omniprésent, les lueurs cyan-rouge et les panneaux arrondis peuvent rapidement ramener à une esthétique de jeu vidéo 2010. La partie durable est le contraste papier/archives nocturnes et la typographie de titrage ; le glitch doit rester une ponctuation de passage, pas une animation de fond ni une décoration systématique.

### Divergence d’inspiration

Trois territoires adjacents gardent l’énergie de la référence sans la réduire à « cyberpunk » : le **dossier de renseignement annoté** (marges, codes d’archivage, tampons), la **page de magazine techno-punk des années 1990** (grille stricte, trames, surimpressions limitées), et le **grimoire industriel** (symboles rituels, gravure froide, accent fluorescent parcimonieux). Ils conservent tous le duo papier/nuit, mais donnent une raison différente aux éléments de signal.

### États comportementaux et hiérarchie de lecture

La direction couvre le livre et non encore l’outil numérique. Pour une future interface de consultation, trois pilotes doivent être explicités : une action primaire de navigation, une recherche/filtre, et une carte de résultat cliquable. Leur absence laisse la densité éditoriale dicter par accident la navigation. La lecture mobile doit prioriser `titre → chapo → contenu → métadonnées`, et ne jamais demander de lire du texte vertical ou de traverser une bande glitch pour atteindre le corps. Pour les colonnes longues, viser un interlignage proche de 1,5 et contrôler la mesure réelle en caractères plutôt que d’agrandir seulement le conteneur.

## Pistes d’évolution

- **Dossier de renseignement** — principe : faire des marges une couche d’information (identifiants, niveau de menace, index, repères de source) et réserver le jaune au marquage actif. Effet attendu : une personnalité plus spécifique à la mégacité, sans surcharge néon. Coût contrat : **demande un re-figeage** (nouveaux rôles de métadonnées, modèle de grille et composants de rail).
- **Grimoire industriel** — principe : substituer aux arrondis et à l’ombre douce des cadres anguleux, filets, trames et emblèmes rituels ; employer le cyan et le rouge seulement comme encre de rituel ou d’alerte. Effet attendu : le mythe devient structurel, plutôt qu’une illustration posée sur un site cyberpunk. Coût contrat : **demande un re-figeage** (radius, shadow et sémantique des accents changent).
- **Magazine techno-punk contrôlé** — principe : fixer une grille de page à 12 colonnes, deux largeurs de colonne et trois tailles de marge ; le glitch n’apparaît qu’aux transitions de chapitre. Effet attendu : une densité plus lisible et reproductible, fidèle aux captures sans effet de fond permanent. Coût contrat : **demande un re-figeage** (tokens de grille et de mise en page).
- **Sobriété d’interface, exubérance éditoriale** — principe : conserver le système actuel pour les pages de lecture, mais donner aux composants interactifs une surface unie, des liens soulignés et un focus très net ; aucune animation glitch nécessaire. Effet attendu : les outils numériques restent rapides, accessibles et ne concurrencent pas la page. Coût contrat : **demande un re-figeage** (inventaire des contrôles et états), tandis que la palette et la typographie actuelles restent utilisables.

## Verdict

La piste à plus fort levier est **Magazine techno-punk contrôlé** : formaliser d’abord la grille, les marges et la mesure de lecture donnera aux textures et aux accents néon une fonction, et empêchera la direction de devenir un habillage cyberpunk générique.
