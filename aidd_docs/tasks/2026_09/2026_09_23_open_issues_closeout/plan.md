---
objective: "Resolve every open schema-in-the-mist issue with local proof, and expose the remaining consumer-owned release-train proofs as explicit upstream dependencies."
status: blocked
---

# Plan: Close the open issue set

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Make the package type-safe, license-correct, asset-efficient, contract-explicit, contrast-verified, de-duplicated, and release-train ready. |
| **Source** | GitHub issues #15 through #21 and #23 in `RebelliousSmile/schema-in-the-mist` |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Establish local quality, dependency, and publication baselines | [phase-1.md](./phase-1.md) |
| 2 | Replace publishable Handbook media and state its license boundary | [phase-2.md](./phase-2.md) |
| 3 | Extract shared schemas without changing generated contracts | [phase-3.md](./phase-3.md) |
| 4 | Make corpus responsibilities and Handbook contrast executable | [phase-4.md](./phase-4.md) |
| 5 | Complete and prove the immutable provider release train | [phase-5.md](./phase-5.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #15](https://github.com/RebelliousSmile/schema-in-the-mist/issues/15) | Requires an explicit redistribution decision and a tarball that matches it. |
| [Issue #16](https://github.com/RebelliousSmile/schema-in-the-mist/issues/16) | Requires WebP cards, a WOFF2 typeface, and no PNG or TTF beneath `handbook/`. |
| [Issue #17](https://github.com/RebelliousSmile/schema-in-the-mist/issues/17) | Requires one shared definition of the Zod metadata primitives and byte-accounted generated schemas. |
| [Issue #18](https://github.com/RebelliousSmile/schema-in-the-mist/issues/18) | Requires `tsc --noEmit` in both `check` and CI. |
| [Issue #19](https://github.com/RebelliousSmile/schema-in-the-mist/issues/19) | Requires inherited variant/polarity contrast and state-family validation before palette fixes. |
| [Issue #20](https://github.com/RebelliousSmile/schema-in-the-mist/issues/20) | Requires consumer axes either to execute or to be explicitly declarative, and requires removal or divergence of the redundant Lantern axis. |
| [Issue #21](https://github.com/RebelliousSmile/schema-in-the-mist/issues/21) | Requires both dependency advisories fixed and both root licence texts packed. |
| [Issue #23](https://github.com/RebelliousSmile/schema-in-the-mist/issues/23) | Requires an immutable candidate manifest, pinned consumer proof, and byte-identical promotion. |

## Decisions

| Decision | Why |
| --- | --- |
| Substitute freely redistributable Handbook media rather than retain, convert, or repackage disputed third-party media. | Conversion does not establish redistribution permission; removal of the source media eliminates the unlicensed bytes while maintaining a locally renderable published pack. |
| Treat Lantern and Handbook corpus outcomes as declarative metadata in this provider and remove the redundant Lantern axis. | Consumer adapters and renderers are consumer-owned under the cross-repository contract; this package can verify canonical data but must not present consumer behavior as its own execution result. |
| Keep schema output byte-identical for the shared-primitive refactor. | The refactor addresses source drift without silently changing the published contract. |
| Keep release-train execution declarative and provider-owned, while collecting consumer evidence only through their fixed assertion interfaces. | It preserves ownership boundaries and prevents manifest-provided shell execution. |
