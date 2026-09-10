---
objective: "The reconciled game-pack appearance schema is canonical in a dedicated public repository while both published schema-in-the-mist paths remain self-contained, documented compatibility paths."
status: implemented
---

# Plan: Extract the game appearance schema

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Reconcile and move ownership of `appearance/game-pack` out of the Mist content repository without breaking consumers of either published path. |
| **Source** | GitHub ticket [`RebelliousSmile/schema-in-the-mist#4`](https://github.com/RebelliousSmile/schema-in-the-mist/issues/4) |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Publish the canonical appearance repository | [`phase-1.md`](./phase-1.md) |
| 2   | Migrate Mist to the compatibility path | [`phase-2.md`](./phase-2.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [GitHub: Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository) | A public repository can be created under the authenticated `RebelliousSmile` account with GitHub CLI; the proposed `schema-appearance` name is currently unused by that account. |
| [JSON Schema: Structuring and `$ref`](https://json-schema.org/understanding-json-schema/structuring) | An external `$ref` requires the validator to retrieve another document, so it is not a transparent replacement for consumers that compile a locally loaded schema synchronously. |
| [schema-adrenaline CI](https://github.com/RebelliousSmile/schema-adrenaline/blob/main/.github/workflows/ci.yml) | The sibling schema repository installs with npm, runs its complete check, and rejects uncommitted generated-schema drift in CI. |
| [schema-adrenaline package scripts](https://github.com/RebelliousSmile/schema-adrenaline/blob/main/package.json) | The shared repository chain includes TypeScript checking, Zod generation, Ajv example validation, and npm lockfile-based installs. |
| [Issue #5](https://github.com/RebelliousSmile/schema-in-the-mist/issues/5) | The extracted contract must include declared `polarities` and per-block `shapes`; usage in Handbook preceded publication. |
| [`00669b8` appearance implementation](https://github.com/RebelliousSmile/schema-in-the-mist/commit/00669b8) | The issue-backed branch implementation defines `polarities`, `shapes`, and the originally promised root-level compatibility path. |
| [Adrenaline Handbook pack](https://github.com/RebelliousSmile/schema-adrenaline/blob/main/handbook/adrenaline/pack.json) | A non-Son-of-Oak consumer already emits a `game-pack` carrying `polarities`, so it must be part of the compatibility corpus. |

## Decisions

| Decision | Why |
| -------- | --- |
| Create the public repository `RebelliousSmile/schema-appearance`. | It follows the existing `schema-*` repository family and names the domain, appearance, rather than the potentially ambiguous `game-pack` target. |
| Reconcile the initial canonical schema from both `9535e94` and `00669b8`, preserving documents accepted by the current `main` contract while adding the issue-backed `polarities` and `shapes` vocabulary. | Blindly copying `9535e94` omits already-used fields; blindly copying `00669b8` changes required/defaulted structure. A compatibility union addresses both histories without redesigning unrelated fields. |
| Keep complete frozen copies at both `appearance/game-pack.schema.json` and `schemas/appearance/game-pack.schema.json` in `schema-in-the-mist`. | Ticket #4 promised the first path, while `main@9535e94` published the second. Full copies keep offline and synchronous Ajv consumers working without a remote resolver. |
| Make the new repository canonical before changing `schema-in-the-mist`. | The migration documentation can point to a live, tested destination and never creates a window with no canonical schema. |
| Use both `schema-in-the-mist@9535e94` and `schema-in-the-mist@00669b8` as explicit reconciliation baselines. | They are divergent published histories: the former is on `main`, while the latter is the implementation cited when #5 was closed. |
| Move only the schema source, generated schema, and validation examples; retain `handbook/`, `handbook.json`, packs, and assets in `schema-in-the-mist`. | Those files distribute Mist-specific presentation packs, while ticket #4 concerns ownership of the cross-game schema contract. |
| Retain the old artifact until a separately approved breaking release removes it. | The ticket requires a transition path but defines no safe removal date; a separate decision prevents an accidental time-based break. |
| Publish the canonical artifact at `https://raw.githubusercontent.com/RebelliousSmile/schema-appearance/main/schemas/appearance/game-pack.schema.json`; retain compatibility at both `https://raw.githubusercontent.com/RebelliousSmile/schema-in-the-mist/main/appearance/game-pack.schema.json` and `https://raw.githubusercontent.com/RebelliousSmile/schema-in-the-mist/main/schemas/appearance/game-pack.schema.json`. | Explicit URLs make the handoff testable and cover both the issue-backed and currently published locations. |
| Add a network-free compatibility assertion and CI to `schema-in-the-mist`. | Once the Zod source and examples move out, the frozen files otherwise have no permanent guard against deletion, divergence, conversion to a remote `$ref`, or invalid schema syntax. |
