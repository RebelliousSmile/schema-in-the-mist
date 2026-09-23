# Schema in the Mist

Open, versioned data schemas for **Mist Engine** games (**City of Mist**, **:Otherscape**, and **Legend in the Mist**) so VTTs, builders, and other digital tools can **share the same data**.

The aim is an ecosystem of interoperable digital tools where they can exchange structured JSON/TOML, validate it with one canonical contract, and leverage it for their specific needs.

## Install and use

Stable builds are distributed as immutable GitHub Release assets rather than through the npm registry. Pin `https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/v1.3.4/schema-in-the-mist-1.3.4.tgz` in the consumer's `package.json`, commit the lockfile integrity, and verify the archive with the adjacent `.sha256` asset. Then import only the public package entry point:

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

### Editor-adapter boundary

`schema-in-the-mist` currently publishes no presentation metadata or
editor-adapter key. Its TOML documents, Zod schemas, JSON Schemas, and shared
corpus describe exchangeable game data only. In particular, they do not name
React components, import paths, CSS classes, editor descriptors, or executable
consumer configuration.

A consumer such as Lantern owns its editor registry, adapters, form state, and
the explicit error it reports for an unsupported editor key. If a producer later
publishes editor descriptors, that producer must first publish a finite,
versioned vocabulary of declarative keys; Lantern can then require its closed
registry to match that vocabulary in both directions. Do not add those keys to
document data or `meta` in this package merely to configure one consumer.

### Concise or raw source conversion

For six of the fourteen targets — `legend-in-the-mist/{story-theme,challenge,journey,theme-kit}` and `city-of-mist/{theme-card,danger}` — `MIST_SOURCE_CONVERSION_CODECS` converts a validated TOML document into the source it should be declared with: a concise canonical form when the conversion is proven lossless, or the raw input verbatim when it is not (an unrecognized key at any depth, a value a schema transform would change, or a `#` comment).

```ts
import { MIST_SOURCE_CONVERSION_CODECS } from "schema-in-the-mist";

const rawToml = `
name = "Boggart"
rating = 2
`;

const codec = MIST_SOURCE_CONVERSION_CODECS["city-of-mist/danger"];
const result = codec.convertToSource(rawToml);
// result.kind === "concise" | "raw", result.source is the text to declare
console.log(result.kind, result.source);
```

## What’s in here

- `src/zod/` contains the source Zod v4 definitions
- `dist/` contains the generated ESM library and declarations
- `schemas/` contains the generated JSON Schemas
- `examples/` contains JSON/TOML examples per schema
- `tools/` provides generation and validation scripts

## Versioning

Package version `1.x` implements contract major `1`. Backwards-compatible fields and new document targets require a minor release; corrections that do not change accepted data require a patch. Removing, renaming, or tightening an accepted business value requires a new contract and package major. JSON Schema `$id` values are tied to their immutable release tag.

### Manual release train

Releases are not triggered by pushing a tag. First, dispatch **Publish candidate archive** from the intended commit on `main`, with a tag exactly matching `vX.Y.Z-rc.N` and whose base version matches `package.json`. The workflow runs on Ubuntu/Node 20, verifies the provider checks and two-pack reproducibility, and publishes exactly `schema-in-the-mist-X.Y.Z.tgz` plus its `.sha256` checksum as an immutable GitHub prerelease tied to that dispatched commit. It rejects stable tags, divergent versions, commits outside `main`, and any pre-existing tag or release state that does not name those exact bytes.

Record the candidate archive's immutable URL, SHA-256, SHA-512 SRI, candidate tag, final tag, and provider commit with the two consumer adoption commits in `release-trains/<final-tag>.json`. A rerun never uploads replacement assets: it only verifies a complete immutable candidate. Then run:

```sh
npm run release-train:assert -- release-trains/<final-tag>.json
npm run release-train:promote -- release-trains/<final-tag>.json --evidence <provenance.json>
```

The assertion hashes the candidate before checking out pinned Lantern and Handbook commits in a disposable workspace. It invokes only their fixed `npm run release-train:assert -- <manifest>` interface. Promotion rechecks that evidence and transports the already-proven bytes to the final immutable release; it never rebuilds the package. Use `--dry-run` to validate promotion inputs without changing GitHub. Candidate publication does not create, edit, or publish a stable release.

### Content schemas and appearance packs

The game folders — `city-of-mist/`, `legend-in-the-mist/`, `otherscape/` —
describe **what is played**: Dangers, Challenges, Journeys, Theme Kits. They are
written by a Narrator and read by any tool that shows them.

The cross-game `game-pack` appearance contract belongs to
[`RebelliousSmile/obsidian-handbook`](https://github.com/RebelliousSmile/obsidian-handbook)
since 2026-09-15. New consumers must read its [canonical Draft 7 schema](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/schemas/appearance/game-pack.schema.json),
which Handbook validates on every build. The intermediate `schema-appearance`
repository held it between 2026-09-10 and 2026-09-15 and no longer exists.

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

- **Handbook assets:** [`handbook/`](./handbook/README.md) records the local font notices and original artwork provenance shipped in each pack.

- This product was created under license. City of Mist, :Otherscape, Legend in the Mist and their logos are trademarks of Son of Oak Game Studio LLC. All City of Mist, :Otherscape and Legend in the Mist setting material, art, and trade dress are the property of Son of Oak Game Studio LLC.

  This work contains material that is copyright of Son of Oak Game Studio LLC and/or other authors. Such material is used with permission under the Community Content Agreement for The Cauldron of Mist.
