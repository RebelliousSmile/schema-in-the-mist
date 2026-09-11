# Contributing

Thanks for helping make Mist Engine tools interoperate!

## How to propose a change

1. **Open an issue** describing the change (new field, new schema, clarification).
2. **Discuss** design/compat with maintainers and other tool authors.
3. **Submit a PR** that includes:

   - Zod v4 source updates in `src/zod/...`
   - New target in `src/zod/constants.ts` like:

     ```ts
     {
        key: "legend-in-the-mist/challenge",
        zod: LegendInTheMistChallengeSchema,
        game: GAMES.litm,
        name: "challenge",
     }
     ```

   - Re-generated JSON Schema in `schemas/...`
     ```sh
        npm run gen
     ```
   - At least **one example** in `examples/<game>/<object>/...`
   - Passing validation
     ```sh
       npm run check
     ```

## Ground rules

- **Canonical source is Zod** (we generate JSON Schema from it).
- **Backward compatibility:** accepted business values cannot be removed or tightened within contract major 1.
- **Corpus:** every target needs an accepted and rejected case in `corpus/contract/cases.json`; consumers execute these same files.
- **Metadata:** add concise descriptions and examples to your fields. With Zod, make use of `.meta({ description, examples })`

## Dev commands

```bash
npm ci
npm run gen            # generate JSON Schemas
npm run validate       # validate example files
npm run validate:contract # validate the shared cross-consumer corpus
npm run validate:package  # install and import the packed public API
npm run check          # generate + validate
```
