# Deprecated compatibility paths

The canonical game-pack schema now lives in
[`RebelliousSmile/schema-appearance`](https://github.com/RebelliousSmile/schema-appearance):

<https://raw.githubusercontent.com/RebelliousSmile/schema-appearance/main/schemas/appearance/game-pack.schema.json>

This repository keeps two identical, self-contained snapshots for existing
consumers:

- `appearance/game-pack.schema.json`
- `schemas/appearance/game-pack.schema.json`

They are frozen at the extraction contract, require no remote `$ref` resolver,
and are deprecated. Their removal requires a separately approved breaking
release.
