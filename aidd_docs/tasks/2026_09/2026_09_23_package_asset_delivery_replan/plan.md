---
objective: "Reach the #16 package-size target by consolidating every Handbook pack on the two proven redistributable Monsterhearts WOFF2 faces."
status: in-progress
---

# Plan: Replan Handbook asset delivery

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Resolve the measured size gap after replacing Legend in the Mist’s PNG cards and TTF, without external asset delivery. |
| **Source** | Current blocked closeout plan and GitHub issue [#16](https://github.com/RebelliousSmile/schema-in-the-mist/issues/16) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Consolidate pack typography on the Monsterhearts font pair | [phase-1.md](./phase-1.md) |
| 2 | Publish the two-font asset and licence contract | [phase-2.md](./phase-2.md) |
| 3 | Measure the complete published and installed result | [phase-3.md](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #16](https://github.com/RebelliousSmile/schema-in-the-mist/issues/16) | Requires WebP/WOFF2 media, a host that still renders it, and a package around one fifth of its audited size. |
| [schema-pbta Monsterhearts assets](C:/Users/fxgui/Documents/Code/Perso/schema-pbta/packs/monsterhearts/appearance-contract.json) | Uses `im-fell-english-latin-400-normal.woff2` and `averia-serif-libre-latin-700-normal.woff2`, both SIL OFL 1.1 with committed notices. |
| [Cross-repository contract rule](../../../../.codex/rules/00-architecture/0-cross-repo-contract-flow.md) | Requires contracts and presentation semantics to be versioned by the provider, and runtime adapters to remain consumer-owned. |

## Decisions

| Decision | Why |
| --- | --- |
| Retain package-local asset delivery and replace the many pack-specific families with IM Fell English Roman and Averia Serif Libre Bold. | The two `schema-pbta` Monsterhearts WOFF2 files are operational, small, committed with OFL notices, and avoid a consumer adapter change. |
| Preserve the two-font contract in every pack’s asset manifest. | Package validation can verify the identical, complete, redistributable font surface at install time. |
