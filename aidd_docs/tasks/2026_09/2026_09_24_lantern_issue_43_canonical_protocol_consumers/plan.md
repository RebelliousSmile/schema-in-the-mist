---
objective: "Lantern accepts the canonical protocol-1 consumer envelope while schema-pbta retains orchestration-only metadata outside consumer manifests."
status: implemented
---

# Plan: Accept canonical protocol-1 consumers in Lantern

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Remove Lantern's dependency on schema-pbta runner metadata from the protocol-1 consumer manifest. |
| **Source** | [RebelliousSmile/lantern#43](https://github.com/RebelliousSmile/lantern/issues/43) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Canonical consumer parser | [phase-1.md](./phase-1.md) |
| 2 | Canonical-envelope regression | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Lantern #43](https://github.com/RebelliousSmile/lantern/issues/43) | The current parser requires orchestration-only `path` and `proof` keys. |
| [schema-pbta run 35926263328](https://github.com/RebelliousSmile/schema-pbta/actions/runs/35926263328) | The train reaches Lantern, then Handbook rejects those extra consumer keys. |

## Decisions

| Decision | Why |
| --- | --- |
| Treat `{ role, repository, ref }` as the complete consumer-owned protocol-1 identity. | Workspace paths and assertion invocation details belong only to the schema-pbta orchestrator. |
| Keep proof evidence unchanged. | The evidence already exposes only the canonical consumer identity plus resolved candidate facts. |
