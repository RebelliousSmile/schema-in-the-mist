# Handbook game packs

This directory publishes the game packs installed by Handbook's Mist Engine starter kit.

Pack assets can also declare ordered stylesheet resources. Handbook installs only declared files; the consumer validates and activates a pack stylesheet only for its owning game. Font files referenced by a stylesheet are listed in `assets.resources`, which installs the files without adding one font-family entry per face.

The public pack contract is shipped at `schema-in-the-mist/schemas/appearance/game-pack.schema.json` so consumers can validate the same resource declarations as this repository.

| Pack | Manifest | Third-party assets |
| --- | --- | --- |
| City of Mist | [`city-of-mist/pack.json`](./city-of-mist/pack.json) | Images listed in [`SonOfOak.LICENSE.txt`](./LICENSES/SonOfOak.LICENSE.txt); font faces under `assets/styles/fonts/` with licenses below |
| Legend in the Mist | [`legend-in-the-mist/pack.json`](./legend-in-the-mist/pack.json) | Images listed in [`SonOfOak.LICENSE.txt`](./LICENSES/SonOfOak.LICENSE.txt), [`assets/fonts/pragroman.ttf`](./legend-in-the-mist/assets/fonts/pragroman.ttf) under [`PragRoman.LICENSE.txt`](./LICENSES/PragRoman.LICENSE.txt), and font faces under `assets/styles/fonts/` with licenses below |
| :Otherscape | [`otherscape/pack.json`](./otherscape/pack.json) | Generated Metro stylesheet and Fira Sans Extra Condensed faces under `assets/styles/fonts/` |

The WOFF2 faces were extracted from Handbook's previous embedded stylesheet without changing their CSS family, weight, style or Unicode ranges. The respective upstream notices are in `LICENSES/`: Averia, Bebas Neue, Caveat, Courier Prime, Fira, IM Fell English, IM Fell Great Primer, Labrada, ParaType (PT Serif), and Roboto. The PragRoman status described below is unchanged.

## Provenance and redistribution status

The project maintainer identifies the Son of Oak images as material taken or adapted from the free Cauldron of Mist community assets. Their historical presence in Handbook, their availability from Cauldron, and the absence of a complaint do not by themselves establish permission to redistribute them from this public repository. The upstream notice is preserved verbatim and still records the unresolved status.

PragRoman was carried over from the former Handbook/Brumes bundle to preserve the original visual design. Its upstream notice permits several kinds of use but restricts inclusion in products unless prior permission is granted. No such permission has been established for this repository. The maintainer has explicitly chosen to retain the font with that risk documented rather than substitute a visually different typeface.

These notices record provenance and upstream terms; they are not a representation that redistribution rights have been secured and are not legal advice.
