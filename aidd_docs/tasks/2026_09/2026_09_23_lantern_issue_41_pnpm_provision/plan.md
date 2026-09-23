---
objective: "Lantern release-train assertions perform their isolated frozen install with a provisioned pnpm version and prove that no global pnpm binary is required."
status: implemented
---

# Plan: Provision pnpm for Lantern release-train assertions

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Make the consumer-owned frozen installation reproducible on GitHub Actions, then rerun exactly one schema-pbta train after the Lantern fix merges. |
| **Source** | [RebelliousSmile/lantern#41](https://github.com/RebelliousSmile/lantern/issues/41) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Deterministic isolated installation | [phase-1.md](./phase-1.md) |
| 2 | Global-pnpm regression proof | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Lantern #41](https://github.com/RebelliousSmile/lantern/issues/41) | The PbtA runner provisions `pnpm@10`; Lantern's nested assertion currently invokes an unavailable global `pnpm`. |
| `schema-pbta` run `35911161997` | The canonical protocol-1 manifest reaches Lantern; failure is only the missing `pnpm` executable in its isolated assertion. |

## Decisions

| Decision | Why |
| --- | --- |
| Provision the same pinned pnpm major through `npx --yes pnpm@10` inside Lantern. | The consumer proof remains self-contained and matches the orchestrator's supported installation path. |
| Test command construction without running an install. | The regression can prove the absence of a global-pnpm dependency without downloading the candidate or relying on PATH. |
