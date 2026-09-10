---
objective: "A `theme-kit` target ships for Legend in the Mist — Zod source, registered target, generated JSON Schema and a JSON + TOML example — and issue #2 carries a public answer to its four design questions."
status: implemented
---

# Plan: Legend in the Mist - Theme Kit (issue #2)

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | Add the `theme-kit` schema target and answer the four questions issue #2 asks. |
| **Source** | Issue `RebelliousSmile/schema-in-the-mist#2` — "Add a Legend in the Mist Theme Kit schema" |

## Phases

| #   | Phase        | File                         |
| --- | ------------ | ---------------------------- |
| 1   | Ship the `theme-kit` target | [`phase-1.md`](./phase-1.md) |
| 2   | Answer issue #2 | [`phase-2.md`](./phase-2.md) |

Phase 1 ships before phase 2 answers, so the comment can point at the shape that actually landed rather than at an intention. The four questions are settled inside phase 1 by the Decisions below; phase 2 records them publicly, which is what `CONTRIBUTING.md` step 2 asks for.

## Resources

| Source | Verified |
| ------ | -------- |
| `RebelliousSmile/schema-in-the-mist#2` | Field list, the "copy rather than map" naming constraint, and the scope boundary: schema only, Lantern rendering and the Obsidian export are other repositories. |
| `README.md` | Two verified facts. It describes directories rather than individual targets, so adding one needs no README change. And its JSON snippet shows a `"$schema"` key that the generated schemas actually reject, since they carry `"additionalProperties": false`; the examples must not copy it. Fixing the README is a separate issue. |

## Decisions

| Decision | Why |
| -------- | --- |
| Root identity field is `name`, not `title_tag` | A kit's name is a label, not a tag a Hero plays. `challenge` and `danger` already use `name` at the root; only `story-theme` uses `title_tag`, and it does so because that field genuinely is an invokable tag. Two of three targets agree with `name`. |
| `improvements` is an array of `{ name, effect? }` | Not settled by any source in this repository, and the published kits are not something this plan can check. Decided on asymmetry instead: an array of length one represents a single improvement losslessly, whereas a scalar cannot represent a kit with two. The array is wrong only by being permissive; the scalar would be wrong by being unable. |
| Tags are stored bare, without braces | Same reasoning as #1, unchanged here: every entry is a tag, the field name says which kind, and a renderer adds the braces. Keeps the two Legend in the Mist schemas consistent. |
| `PublicationTypeEnum` and `MetaSchema` stay duplicated in `theme-kit.ts` | All three existing targets define their own copies. One self-contained file per target is the repository's convention, not an oversight — factoring it out is a repo-wide refactor that belongs in its own issue. |
| `name` is the only **root** field carrying `.default()` | In this repo `z.toJSONSchema` runs in the output view, so any `.default()` field lands in `required`. `.default("Untitled Theme Kit")` therefore yields exactly `"required": ["name"]` at the root, matching the issue's table; every other root field uses `.optional()`. This says nothing about subschemas: `MetaSchema.publication_type` keeps its `.default("homebrew")`, as in all three existing targets, so `meta` — when present — requires `publication_type`. |
| `level` is not added | `story-theme` has it and a themebook plausibly targets a tier, but the issue's table omits it. Naming the gap in the phase-2 comment is in scope; inventing the field is not. |
| `improve`, `abandon` and `milestone` are not carried over | They hold a Hero's track state on a filled-in Story Theme. A kit is the blank, so it has none. Their absence is the reason `improvements` — the options a kit offers — must not be read as the plural of `improve`. |
