# Handbook game packs

This directory publishes the game packs installed by Handbook's Mist Engine starter kit.

Pack assets can also declare ordered stylesheet resources. Handbook installs only declared files; the consumer validates and activates a pack stylesheet only for its owning game. Font files referenced by a stylesheet are listed in `assets.resources`, which installs the files without adding one font-family entry per face.

The public pack contract is shipped at `schema-in-the-mist/schemas/appearance/game-pack.schema.json` so consumers can validate the same resource declarations as this repository.

| Pack | Manifest | Third-party assets |
| --- | --- | --- |
| City of Mist | [`city-of-mist/pack.json`](./city-of-mist/pack.json) | Original replacement SVG symbols and OFL-licensed font faces under `assets/styles/fonts/` |
| Legend in the Mist | [`legend-in-the-mist/pack.json`](./legend-in-the-mist/pack.json) | Original replacement SVG/WebP art and OFL-licensed font faces under `assets/styles/fonts/` |
| :Otherscape | [`otherscape/pack.json`](./otherscape/pack.json) | Generated Metro stylesheet and OFL-licensed font faces under `assets/styles/fonts/` |

Every published pack now uses exactly two locally installed WOFF2 faces: IM Fell English Roman (400) for text and Averia Serif Libre (700) for display. Both are distributed under SIL Open Font License 1.1; their upstream notices are [`IMFellEnglish.LICENSE.txt`](./LICENSES/IMFellEnglish.LICENSE.txt) and [`Averia.LICENSE.txt`](./LICENSES/Averia.LICENSE.txt). Historical notices remain for provenance but their former font files are not published.

## Provenance and redistribution status

The project maintainer identified the former Son of Oak artwork as material for which this repository could not establish redistribution permission. All of the corresponding City of Mist and Legend in the Mist SVGs and cards have been replaced with original artwork; PragRoman has likewise been removed. The historical upstream notices are preserved verbatim for provenance only, not as a licence for any published asset.

This is the package's explicit redistribution decision: the npm distribution contains original replacement art plus the two published OFL WOFF2 faces, and no disputed source media.

The 2026-09-23 package dry-run measured 531,209 compressed bytes and 1,129,481 unpacked bytes. `npm run validate:package` enforces a 538,582-byte archive ceiling: one fifth of the 2,692,910-byte audit baseline.

These notices record provenance and upstream terms; they are not a representation that redistribution rights have been secured and are not legal advice.
