# Handbook game packs

This directory publishes the game packs installed by Handbook's Mist Engine starter kit.

Pack assets can also declare ordered stylesheet resources. Handbook installs only declared files; the consumer validates and activates a pack stylesheet only for its owning game. Font files referenced by a stylesheet are listed in `assets.resources`, which installs the files without adding one font-family entry per face.

The public pack contract is shipped at `schema-in-the-mist/schemas/appearance/game-pack.schema.json` so consumers can validate the same resource declarations as this repository.

| Pack | Manifest | Third-party assets |
| --- | --- | --- |
| City of Mist | [`city-of-mist/pack.json`](./city-of-mist/pack.json) | Images listed in [`SonOfOak.LICENSE.txt`](./LICENSES/SonOfOak.LICENSE.txt); font faces under `assets/styles/fonts/` with licenses below |
| Legend in the Mist | [`legend-in-the-mist/pack.json`](./legend-in-the-mist/pack.json) | Original replacement WebP card art, and OFL-licensed font faces under `assets/styles/fonts/` |
| :Otherscape | [`otherscape/pack.json`](./otherscape/pack.json) | Generated Metro stylesheet and OFL-licensed font faces under `assets/styles/fonts/` |

Every published pack now uses exactly two locally installed WOFF2 faces: IM Fell English Roman (400) for text and Averia Serif Libre (700) for display. Both are distributed under SIL Open Font License 1.1; their upstream notices are [`IMFellEnglish.LICENSE.txt`](./LICENSES/IMFellEnglish.LICENSE.txt) and [`Averia.LICENSE.txt`](./LICENSES/Averia.LICENSE.txt). Historical notices remain for provenance but their former font files are not published.

## Provenance and redistribution status

The project maintainer identifies the Son of Oak images as material taken or adapted from the free Cauldron of Mist community assets. Their historical presence in Handbook, their availability from Cauldron, and the absence of a complaint do not by themselves establish permission to redistribute them from this public repository. The upstream notice is preserved verbatim and still records the unresolved status.

The former Son of Oak PNG theme cards and PragRoman font are no longer published. The pack uses original replacement WebP card art and the two published OFL WOFF2 faces instead. This is the package's explicit redistribution decision: disputed source media are not part of the npm distribution.

The 2026-09-23 package dry-run measured 531,209 compressed bytes and 1,129,481 unpacked bytes. `npm run validate:package` enforces a 538,582-byte archive ceiling: one fifth of the 2,692,910-byte audit baseline.

These notices record provenance and upstream terms; they are not a representation that redistribution rights have been secured and are not legal advice.
