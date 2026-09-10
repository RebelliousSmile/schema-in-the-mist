# Schema in the Mist

Open, versioned data schemas for **Mist Engine** games (**City of Mist**, **:Otherscape**, and **Legend in the Mist**) so VTTs, builders, and other digital tools can **share the same data**.

The aim is an ecosystem of interoperable digital tools where they can exchange structured JSON/TOML, validate it via schemas (e.g., using Zod), and leverage it for their specific needs.

## What’s in here

- `src/zod/` contains the source Zod v4 definitions
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `tools/` provides generation and validation scripts

### Content and appearance

The game folders — `city-of-mist/`, `legend-in-the-mist/`, `otherscape/` —
describe **what is played**: Dangers, Challenges, Journeys, Theme Kits. They are
written by a Narrator and read by any tool that shows them.

`appearance/` is a sibling space describing **how a game dresses a reader**: its
identifier, the CSS custom properties it writes by theme variant, and the paths
of the illustrations and typefaces it draws with. It is transverse to the three
games, which is why it is not filed under any of them, and it shares no field
with the content schemas — not even the `meta` attribution block they all carry.
A tool that renders no pages has no use for it, and a tool that renders pages
needs nothing from the content schemas to do so.

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

- This product was created under license. City of Mist, :Otherscape, Legend in the Mist and their logos are trademarks of Son of Oak Game Studio LLC. All City of Mist, :Otherscape and Legend in the Mist setting material, art, and trade dress are the property of Son of Oak Game Studio LLC.

  This work contains material that is copyright of Son of Oak Game Studio LLC and/or other authors. Such material is used with permission under the Community Content Agreement for The Cauldron of Mist.
