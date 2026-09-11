# Schema in the Mist

Open, versioned data schemas for **Mist Engine** games (**City of Mist**, **:Otherscape**, and **Legend in the Mist**) so VTTs, builders, and other digital tools can **share the same data**.

The aim is an ecosystem of interoperable digital tools where they can exchange structured JSON/TOML, validate it with one canonical contract, and leverage it for their specific needs.

## Install and use

Stable builds are distributed as immutable GitHub Release assets rather than through the npm registry. Pin the exact `v1.0.0` asset URL in the consumer's `package.json`, then import only the public package entry point:

```ts
import {
  MIST_ENGINE_CODECS,
  type CityOfMistDanger,
} from "schema-in-the-mist";

const codec = MIST_ENGINE_CODECS["city-of-mist/danger"];
const danger: CityOfMistDanger = codec.parseToml(source);
const normalizedToml = codec.stringifyToml(danger);
```

The package exposes the 14 qualified codecs, their Zod schemas and inferred document types, the contract version constants, versioned JSON Schema files, and the shared conformance corpus. UI form coercion, rendering, styles, and warnings remain consumer concerns.

## What’s in here

- `src/zod/` contains the source Zod v4 definitions
- `dist/` contains the generated ESM library and declarations
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `tools/` provides generation and validation scripts

## Versioning

Package version `1.x` implements contract major `1`. Backwards-compatible fields and new document targets require a minor release; corrections that do not change accepted data require a patch. Removing, renaming, or tightening an accepted business value requires a new contract and package major. JSON Schema `$id` values are tied to their immutable release tag.

### Content schemas and appearance packs

The game folders — `city-of-mist/`, `legend-in-the-mist/`, `otherscape/` —
describe **what is played**: Dangers, Challenges, Journeys, Theme Kits. They are
written by a Narrator and read by any tool that shows them.

The cross-game `game-pack` appearance contract now lives in
[`RebelliousSmile/schema-appearance`](https://github.com/RebelliousSmile/schema-appearance).
New consumers should read its [canonical Draft 7 schema](https://raw.githubusercontent.com/RebelliousSmile/schema-appearance/main/schemas/appearance/game-pack.schema.json).

For compatibility, this repository retains frozen, self-contained copies at
[`appearance/game-pack.schema.json`](./appearance/game-pack.schema.json) and
[`schemas/appearance/game-pack.schema.json`](./schemas/appearance/game-pack.schema.json).
They require no network-aware `$ref` resolver, but they are deprecated and will
not receive future contract changes. Their removal requires a separately
approved breaking release.

## Using the schemas in your tool

### Use Zod directly (TS apps)

If you use TypeScript and Zod parsing, you can copy/paste the provided Zod schemas:

```ts
import { LegendInTheMistChallengeSchema } from "./src/zod/legend-in-the-mist/challenge";
const parsed = LegendInTheMistChallengeSchema.parse(userInputJson);
```

### Validate data (language-agnostic)

Use any JSON Schema validator (AJV, Python jsonschema, Rust jsonschema). Example with AJV:

```ts
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  fs.readFileSync("schemas/legend-in-the-mist/challenge.schema.json", "utf8")
);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync("path/to/challenge.json", "utf8"));
if (!validate(data)) console.error(validate.errors);
```

### Editor autocomplete for JSON and TOML

Depending on your code editor, you can configure custom JSON Schemas for both JSON and TOML files. For JSON specifically, you can also put a `$schema` hint at the top:

```json
{
  "$schema": "./schemas/legend-in-the-mist/challenge.schema.json",
  "name": "Boggart",
  "rating": 2
}
```

## License

- **Code & Schemas:** MIT (see [here](./LICENSES/CODE-LICENSE.md))

- **Docs:** CC BY 4.0 (see [here](./LICENSES/DOCS-LICENSE.md))

- **Third-party game-pack assets:** the MIT and CC BY 4.0 licenses above do not cover the images or fonts published under [`handbook/`](./handbook/README.md). See the per-pack inventory and upstream notices there, including the documented unresolved redistribution status.

- This product was created under license. City of Mist, :Otherscape, Legend in the Mist and their logos are trademarks of Son of Oak Game Studio LLC. All City of Mist, :Otherscape and Legend in the Mist setting material, art, and trade dress are the property of Son of Oak Game Studio LLC.

  This work contains material that is copyright of Son of Oak Game Studio LLC and/or other authors. Such material is used with permission under the Community Content Agreement for The Cauldron of Mist.
