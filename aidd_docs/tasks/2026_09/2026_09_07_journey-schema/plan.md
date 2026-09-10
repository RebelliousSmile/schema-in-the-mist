---
objective: "A `journey` target ships for Legend in the Mist — Zod source, registered target, generated JSON Schema and a JSON + TOML example — and issue #3 carries a public answer to its four design questions."
status: implemented
---

# Plan: Legend in the Mist — Journey schema

## Overview

| Field      | Value                                                                        |
| ---------- | ---------------------------------------------------------------------------- |
| **Goal**   | Add `journey` as the fifth target, with nested vignettes, and answer issue #3 |
| **Source** | Issue #3 on `RebelliousSmile/schema-in-the-mist`                              |

## Phases

| #   | Phase                     | File                         |
| --- | ------------------------- | ---------------------------- |
| 1   | Ship the `journey` target  | [`phase-1.md`](./phase-1.md) |
| 2   | Answer issue #3            | [`phase-2.md`](./phase-2.md) |

Phase 1 ships before phase 2 answers, and the order is load-bearing rather than tidy: phase 2 quotes the `required` lists and the `trigger` description that actually landed, so it cannot be written against an intention. `CONTRIBUTING.md` step 2 asks for the design discussion, which is what phase 2 records.

## Resources

| Source                                                       | Verified                                                                                                                                                                                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue #3, `RebelliousSmile/schema-in-the-mist`                | Field table, the four open questions, and the scope line: schema only, Lantern rendering and Obsidian export are other repositories.                                                                                             |
| Obsidian plugin parsing `litm-journey` blocks                 | **Not consulted — it is not in this repository and was not read.** Every claim about its behaviour in this plan is the issue author's, restated as theirs. No decision here rests on it as verified fact.                        |
| `README.md`                                                   | Describes directories, not individual targets, so a fifth target needs no README entry. Its `$schema` snippet is rejected by the generated schemas' `additionalProperties: false` — measured, an example carrying it fails `✗`. |
| `CONTRIBUTING.md`                                             | Fixes what a new target must ship: Zod source, a `constants.ts` entry, a regenerated schema, at least one example under `examples/<game>/<object>/`, and a passing `npm run check`. Its `.meta({ description, examples })` rule applies to every field. Its step 2 — discuss the design on the issue — is why phase 2 exists at all. |

## Decisions

| Decision                                                                                       | Why                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type` is required **without** a `.default()`                                                   | Measured: an enum with no `.default()` and no `.optional()` already lands in `required`, so both options produce the same `required` list. What differs is a `"default"` key in the JSON Schema and, on the Zod side, a value invented on a parse that omitted the field. The issue reads `story-theme.level` as the precedent, but `level` defaults to `origin` because that is where a Story Theme *starts*; no journey type is where a Journey starts, so there is no non-arbitrary value to pick among three. The issue says as much itself — "the default is not obvious the way `origin` was". |
| `name` keeps `.default("Untitled Journey")` even though `type` gets no default                  | The two rows are not in tension once the criterion is named: a default is warranted when the value it invents is the only one it could be, and refused when it would pick arbitrarily among meaningful alternatives. `Untitled X` is the repository's answer in 4/4 targets and asserts nothing about the Journey; `landscape` would assert something false about the two thirds of Journeys that are an occasion or an undertaking. |
| Journey rejects `.parse({})`, unlike all four existing targets                                    | Measured: `challenge`, `story-theme`, `theme-kit` and `danger` each parse `{}` and return their defaults, because every root `required` field of theirs carries one. A required `type` with no default makes `journey` the first target to throw on `{}`. Accepted knowingly — the alternative is a schema that accepts an empty object and hands back a Journey type nobody wrote — and it is disclosed on the issue rather than left for a consumer to discover. |
| Root `consequences` keeps that name, where `challenge` renamed its root list `general_consequences` | The issue's table says `consequences`, and this plan follows it, so the divergence is deliberate: `challenge.ts:333` chose a distinct name precisely to keep the root list unambiguous against `threats[].consequences`. The disambiguation moves into the two `description` strings instead of the field names, and phase 2 states the split explicitly. Renaming to `general_consequences` remains the fallback if the issue author prefers the sibling's convention. |
| `description` is one string, not a list of lines                                                | `challenge.description` and `story-theme.quest` are both plain optional strings. A list would make `journey` the only target where prose is an array, and newlines carry the same paragraph breaks.                                                                                        |
| Consequences stay prose strings, at both levels                                                 | `ThreatSchema.consequences` is already `z.array(z.string()).min(1)`, prose with parenthesised effects inline. Splitting text from effect would invent a shape no producer emits.                                                                                                           |
| `vignettes` is optional; `vignettes[].consequences` is **required with `.min(1)`**               | Mirrors `challenge`: `threats` is optional, but a Threat that exists must carry at least one Consequence. A vignette with no consequence is not a short Journey, it is an empty row.                                                                                                        |
| `VignetteSchema` is modelled on `ThreatSchema`, not invented                                     | Same shape — a name, a prose line, a non-empty consequence list — and the same TOML encoding as `[[threats]]`, which already validates in this repository. One deliberate divergence: `ThreatSchema.description` is required and capped at 100 characters, while `trigger` is optional and uncapped, because the issue writes it `trigger?`. |
| `PublicationTypeEnum` and `MetaSchema` are duplicated again, not factored out                    | All four existing targets define their own. Factoring them out is a repo-wide change and belongs in its own issue; it was already deferred on issue #2.                                                                                                                                     |
| The field is `tags`, bare, not `power_tags` / `tags_and_statuses`                                | A Journey offers tags to whoever travels it; it has no weakness axis to oppose them to, so `story-theme`'s split does not apply, and `challenge`'s name carries "and statuses", which the issue's table does not claim.                                                                     |
| No `level` and no `rating` on a Journey                                                          | The issue's table omits both. Adding a tier a producer never emits is what makes a schema describe nothing — the same reasoning that kept `level` off `theme-kit`.                                                                                                                          |
