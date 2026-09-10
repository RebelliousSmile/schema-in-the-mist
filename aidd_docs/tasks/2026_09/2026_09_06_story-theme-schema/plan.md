---
objective: "CONTRIBUTING points at the real constants path, and issue #1 carries a public answer to its three design questions that matches the schema as shipped. Closing the issue stays a human call."
status: implemented
---

# Plan: Legend in the Mist - Story Theme (answering issue #1)

## Overview

| Field      | Value                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**   | Finish the work around the already-committed Story Theme schema: fix the stale path in CONTRIBUTING, answer issue #1's three design questions |
| **Source** | Issue [RebelliousSmile/schema-in-the-mist#1](https://github.com/RebelliousSmile/schema-in-the-mist/issues/1)                              |

## Context

Issue #1 opened the design discussion for a Legend in the Mist **Story Theme** schema, per CONTRIBUTING's issue-then-discuss-then-PR rule. The schema itself already landed on `feat/story-theme-schema` (commit `2bedba4`): `src/zod/legend-in-the-mist/story-theme.ts`, its `TARGETS` entry, the generated `schemas/legend-in-the-mist/story-theme.schema.json`, and a JSON + TOML example. `gen` reproduces the committed schema byte-for-byte and `validate` passes on all six example files, so no schema work remains.

Two things are still open. The issue states "everything but `title_tag` is optional, so a document holding only what an existing tool can produce still validates", but the generated schema lists `required: ["title_tag", "level"]` — `.default()` combined with Zod's default `io: "output"` makes every defaulted field required. That is the established house pattern (`challenge` requires `name` + `rating`, `danger` the same), so the code stays and the issue's wording is what gets corrected. And CONTRIBUTING tells contributors to register a new target in `src/constants.ts`, a file that does not exist — it is `src/zod/constants.ts`.

Out of scope, deliberately: pushing the branch, opening a PR, closing the issue, and revisiting `io: "output"` across all three targets (that would change the contract for `challenge` and `danger` consumers and belongs in its own issue).

Neither phase commits. `CLAUDE.md` forbids committing or pushing without an explicit ask, and phase 1 edits a tracked file — leave the change in the working tree.

## Phases

| #   | Phase                        | File                         |
| --- | ---------------------------- | ---------------------------- |
| 1   | Fix the CONTRIBUTING path    | [`phase-1.md`](./phase-1.md) |
| 2   | Answer the design questions  | [`phase-2.md`](./phase-2.md) |

## Resources

| Source                                                             | Verified                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| https://github.com/RebelliousSmile/schema-in-the-mist/issues/1      | The proposed field table and the three questions the plan has to answer               |

## Decisions

| Decision                                                                 | Why                                                                                                                                                                              |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep `level` defaulted, so `required` is `["title_tag", "level"]`         | `challenge` and `danger` already turn every defaulted field into a required one. Diverging on `story-theme` alone would break the consistency of the three targets for no gain.    |
| Do not switch `gen-schemas.ts` to `io: "input"` here                      | It would drop `name` and `rating` from `challenge` and `danger`'s `required` lists — a contract change for existing consumers, far wider than issue #1.                            |
