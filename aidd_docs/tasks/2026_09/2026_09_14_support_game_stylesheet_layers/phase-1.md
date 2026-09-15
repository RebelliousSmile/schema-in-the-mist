---
status: done
---

# Instruction: Declare and publish stylesheet resources

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-in-the-mist/
├── ✏️ appearance/game-pack.schema.json            synchronized frozen compatibility copy
├── ✏️ schemas/appearance/game-pack.schema.json    synchronized frozen compatibility copy
├── ✏️ tools/validate-handbook-packs.ts             validates declared CSS paths and closure
└── ✏️ tools/validate-appearance-compat.ts          proves the copies accept a stylesheet declaration

Aucun fichier supprimé.
```

## User Journey

```mermaid
flowchart TD
  A[Pack author adds a CSS file] --> B[Manifest declares it under assets.stylesheets]
  B --> C[Producer validation runs]
  C -->|safe and present| D[Pack is publishable]
  C -->|missing or unsafe| E[Actionable validation failure]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Start from the published Handbook catalogue and compatibility schemas => baseline pack set is available: 5: cli
  section Happy path
    Declare an ordered relative stylesheet path and add its file under the City pack asset root => canonical schema and local validator accept the pack: 5: cli
    Run the complete producer check => generated and frozen schemas remain identical where required and every declared resource exists: 5: cli
  section Edge case - Token-only pack
    Validate a pack with no stylesheets field => existing pack remains accepted unchanged: 1: cli
  section Edge case - Unsafe or orphan stylesheet
    Declare a traversing path or leave a CSS file undeclared => validator rejects the manifest with its field or file path: 1: cli
```

## Tasks to do

### `1)` Verify the published canonical pack contract

> Make a stylesheet an explicit optional pack resource, rather than an untyped manifest extension.

1. Verify canonical commit `22367691ef8fb5890bf08cc8fcdc0f422eee66d3` remains the source of truth for `assets.stylesheets`: an ordered array of normalized forward-slash, non-empty relative paths.
2. Verify its contract preserves existing optional images and font forms, and accepts a manifest without stylesheets.

### `2)` Synchronize and validate the distributed Mist packs

> Keep the two explicitly frozen compatibility paths usable offline while making published resources closed and safe.

1. Keep both compatibility schemas content-identical to canonical commit `22367691ef8fb5890bf08cc8fcdc0f422eee66d3`; ignore only CRLF-versus-LF conversion performed by the local Git worktree.
2. Extend `tools/validate-appearance-compat.ts` with a valid stylesheet probe and an invalid unknown-field/path probe while retaining its self-contained and equality checks.
3. Extend `tools/validate-handbook-packs.ts` so stylesheets use the existing normalized safe-relative-path rules, must exist below `pack.assets.root`, count as declared assets, and participate in the no-orphan inventory.
4. Keep all published packs token-only in this phase; phase 3 introduces City of Mist's first non-empty declared resource after the consumer can load it.
5. Update Handbook-pack documentation to identify stylesheets as installable pack resources and their ownership boundary.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | The published canonical schema accepts ordered normalized stylesheet paths and still accepts every existing token-only pack. |
| 1 | Empty, duplicate, malformed, or unsafe stylesheet declarations are rejected by the canonical contract or producer validation with a precise cause. |
| 2 | Both legacy schema copies have canonical-equivalent content after newline normalization, are self-contained, and accept the new declaration without external resolution. |
| 2 | `npm run check` accepts every published pack and fails if a declared stylesheet is missing, escapes the asset root, or is an undeclared delivered file. |
| 2 | All currently published packs remain valid without a `stylesheets` field; the validator is ready to reject missing, escaping, or orphan stylesheet resources when a pack begins declaring them. |
