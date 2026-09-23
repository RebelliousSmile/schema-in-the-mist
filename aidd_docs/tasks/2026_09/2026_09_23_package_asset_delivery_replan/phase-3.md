---
status: completed
---

# Instruction: Measure the complete published and installed result

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
├── tools/validate-package.ts ✏️ assert tarball contents and size budget
├── handbook/README.md ✏️ publish measured package and delivery evidence
└── aidd_docs/tasks/2026_09/2026_09_23_package_asset_delivery_replan/phase-3.md ✏️ record completed evidence
```

## User Journey

```mermaid
flowchart TD
  A[npm pack --dry-run] --> B[Tarball budget passes]
  B --> C[Handbook install or resolution]
  C --> D[Cards and typeface render]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    final package and consumer assertion => immutable test inputs exist: 5: cli
  section Happy path
    measure tarball and run installed render path => size budget and visual resources pass: 5: cli
```

## Tasks to do

### `1)` Enforce the chosen budget

> Prove the package and end-user installation meet the selected acceptance criteria.

1. `npm pack --dry-run --json` measured 531,209 compressed bytes and 1,129,481 unpacked bytes on 2026-09-23; the package validator enforces the 538,582-byte (one-fifth) ceiling.
2. Run Handbook’s real asset/render assertion at its pinned consumer commit.
3. Make the package validator fail when the selected budget or delivery proof regresses.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | -------------------------------- |
| 1 | The tarball meets the agreed budget and the consumer renders every declared asset through the selected path. |
