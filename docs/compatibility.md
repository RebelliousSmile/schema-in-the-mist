# Mist Engine v1 compatibility matrix

`schema-in-the-mist` is the authority for the 14 qualified document targets below. Lantern's schemas and TOML codecs were compared in both directions; they are validation-equivalent unless a decision is recorded here. Handbook is a tolerant rendering consumer: only portable business values are promoted into the strict contract.

| Qualified target | Lantern | Handbook | v1 decision |
| --- | --- | --- | --- |
| `city-of-mist/custom-move` | Equivalent schema and TOML codec | No renderer | Keep the richer canonical descriptions and constraints. |
| `city-of-mist/danger` | Equivalent except Handbook extensions | Renders countdowns, outcomes and untitled custom moves | Promote `spectrums[].is_countdown`, `spectrums[].on_max`, and optional custom-move names. |
| `city-of-mist/theme-card` | Uses `letter` and `is_burnt` | Uses `question` and `burnt` | Accept both portable spellings. The codecs preserve the submitted spelling; consumer adapters map their local model explicitly. |
| `city-of-mist/theme-kit` | Equivalent schema and TOML codec | No renderer | Keep the canonical questionnaire, selection rules, metadata, and public symbols; Lantern #3 guards them during migration. |
| `legend-in-the-mist/challenge` | Equivalent except Handbook extension | Renders labelled and unlabelled secrets | Promote `secrets[]` with optional `label` and required `text`. |
| `legend-in-the-mist/journey` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |
| `legend-in-the-mist/story-theme` | Equivalent schema and TOML codec | Historical corpus name `theme-card` | Keep `story-theme` as the public target; map the Handbook fixture name, not the data shape. |
| `legend-in-the-mist/theme-kit` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |
| `otherscape/challenge` | Equivalent schema and TOML codec | Renders the same business fields | Keep limits, polar/progress flags, consequences, and metadata. |
| `otherscape/character-trope` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |
| `otherscape/loadout-item` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |
| `otherscape/power-set` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |
| `otherscape/theme` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |
| `otherscape/theme-kit` | Equivalent schema and TOML codec | Renders the same business fields | Keep the canonical contract. |

## Boundary decisions

- Canonical objects are strict at every declared object boundary. Unknown form or rendering keys are rejected instead of being silently stripped during a round trip.
- TOML and JSON numbers are validated as numbers. Numeric-string coercion belongs to UI forms, not the exchange contract.
- Required trimmed strings also carry a non-whitespace JSON Schema constraint. Trimming is normalization performed by the TypeScript codec after the raw value has passed the same acceptance rule.
- `0`, `false`, empty lists, and absent optionals remain distinct values. Serializers must test presence rather than truthiness.
- `publication_type = "corpus"` is a fixture marker and is not a domain enum value. Form state, warnings, export preferences, visual zones, pack capabilities, styles, and assets remain consumer-owned.
- Correct canonical metadata, constraints, examples, descriptions, and exports missing from Lantern are retained. [Lantern #3](https://github.com/RebelliousSmile/lantern/issues/3) tracks their preservation during removal of local copies.
