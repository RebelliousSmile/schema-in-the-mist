# Deprecated compatibility paths

The canonical game-pack schema lives in Handbook:

<https://github.com/RebelliousSmile/obsidian-handbook/blob/main/schemas/appearance/game-pack.schema.json>

It moved there on 2026-09-15. The intermediate `RebelliousSmile/schema-appearance`
repository, canonical for five days before that, no longer exists: its raw URL is
gone and must not be resolved.

This repository keeps two identical, self-contained snapshots for existing
consumers:

- `appearance/game-pack.schema.json`
- `schemas/appearance/game-pack.schema.json`

They are frozen at the extraction contract, require no remote `$ref` resolver,
and are deprecated. Their removal requires a separately approved breaking
release.
