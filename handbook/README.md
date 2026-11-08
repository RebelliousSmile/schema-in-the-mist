# Handbook game packs

This directory publishes the game packs installed by Handbook's Mist Engine starter kit.

Pack assets can also declare ordered stylesheet resources. Handbook installs only declared files; the consumer validates and activates a pack stylesheet only for its owning game. Font files referenced by a stylesheet are listed in `assets.resources`, which installs the files without adding one font-family entry per face.

The public pack contract is shipped at `schema-in-the-mist/schemas/appearance/game-pack.schema.json` so consumers can validate the same resource declarations as this repository.

| Pack | Manifest | Third-party assets |
| --- | --- | --- |
| City of Mist | [`city-of-mist/pack.json`](./city-of-mist/pack.json) | Original replacement SVG symbols and OFL-licensed font faces under `assets/styles/fonts/` |
| Legend in the Mist | [`legend-in-the-mist/pack.json`](./legend-in-the-mist/pack.json) | Original replacement SVG/WebP art and OFL-licensed font faces under `assets/styles/fonts/` |
| :Otherscape | [`otherscape/pack.json`](./otherscape/pack.json) | Generated stylesheet and one OFL-licensed face per typographic role under `assets/styles/fonts/` |

Every City of Mist and Legend in the Mist pack uses exactly two locally installed WOFF2 faces: IM Fell English Roman (400) for text and Averia Serif Libre (700) for display. Both are distributed under SIL Open Font License 1.1; their upstream notices are [`IMFellEnglish.LICENSE.txt`](./LICENSES/IMFellEnglish.LICENSE.txt) and [`Averia.LICENSE.txt`](./LICENSES/Averia.LICENSE.txt). Historical notices remain for provenance but their former font files are not published.

:Otherscape stands outside that contract. Its books set a condensed sans-serif per role, which neither serif face can render, so `schemas/otherscape/design/tokens.json` declares one font stack per role: the book's commercial face first, for a reader who has it installed, then a published SIL OFL 1.1 face. The pack publishes ten WOFF2 faces: Sofia Sans Semi Condensed 400, 400 italic and 700 for running text and intertitles (stand-in for Isotonic, [`SofiaSans.LICENSE.txt`](./LICENSES/SofiaSans.LICENSE.txt)); Fira Sans Extra Condensed 800 for titles (stand-in for NeoTokyo, [`Fira.LICENSE.txt`](./LICENSES/Fira.LICENSE.txt)); Familjen Grotesk 500 for leads (stand-in for PP Fraktion Sans, [`FamiljenGrotesk.LICENSE.txt`](./LICENSES/FamiljenGrotesk.LICENSE.txt)); Space Mono 400 for read-aloud passages (stand-in for PP Fraktion Mono, [`SpaceMono.LICENSE.txt`](./LICENSES/SpaceMono.LICENSE.txt)); Barlow Condensed 300 for numbered lists ([`BarlowCondensed.LICENSE.txt`](./LICENSES/BarlowCondensed.LICENSE.txt)); IBM Plex Sans Condensed 400, 400 italic and 700 for sidebars and renvois ([`IBMPlexSansCondensed.LICENSE.txt`](./LICENSES/IBMPlexSansCondensed.LICENSE.txt)). All but Plex are latin subsets; Plex is shipped unmodified because "Plex" is a Reserved Font Name. `tools/validate-package.ts` holds the list of these faces.

## Provenance and redistribution status

The project maintainer identified the former Son of Oak artwork as material for which this repository could not establish redistribution permission. All of the corresponding City of Mist and Legend in the Mist SVGs and cards have been replaced with original artwork; PragRoman has likewise been removed. The historical upstream notices are preserved verbatim for provenance only, not as a licence for any published asset.

This is the package's explicit redistribution decision: the npm distribution contains original replacement art plus the published OFL WOFF2 faces, and no disputed source media.

The 2026-09-23 package dry-run measured 531,209 compressed bytes and 1,129,481 unpacked bytes. `npm run validate:package` enforces a 538,582-byte archive ceiling: one fifth of the 2,692,910-byte audit baseline. Otherscape's role faces, added on 2026-11-08, raise that ceiling by their exact WOFF2 size (227,132 bytes), which compression cannot reduce.

These notices record provenance and upstream terms; they are not a representation that redistribution rights have been secured and are not legal advice.
