---
objective: "A staged schema-in-the-mist archive can be proven by pinned Lantern and Handbook consumers, then attached byte-for-byte to the immutable final tag without rebuilding."
status: blocked
---

# Plan: Adopt immutable candidate promotion proof

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Add a manifest-led release train beside the daily provider-contract gate, requiring precommitted consumer adoption and proof before final promotion. |
| **Source** | GitHub issue [RebelliousSmile/schema-in-the-mist#23](https://github.com/RebelliousSmile/schema-in-the-mist/issues/23) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Define and validate the immutable train contract | [phase-1.md](./phase-1.md) |
| 2 | Orchestrate pinned consumer evidence | [phase-2.md](./phase-2.md) |
| 3 | Gate byte-identical final promotion | [phase-3.md](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #23](https://github.com/RebelliousSmile/schema-in-the-mist/issues/23) | Requires a committed manifest, fixed consumer evidence, SHA-verified attachment without rebuilding, and retention of the daily baseline. |
| [Mist #23 contract](https://github.com/RebelliousSmile/schema-in-the-mist/issues/23#issuecomment-5785353621) | Defines the provider-neutral v1 manifest: candidate URL, SHA-256, SHA-512 SRI, immutable provider/consumer commits, detached read-only runner, structured evidence, and no-rebuild promotion. |
| [Lantern #24](https://github.com/RebelliousSmile/lantern/issues/24) | Tracks Mist-specific frozen adoption, SRI validation, detached proof, machine-readable evidence, and production Vite verification. It is the current Lantern dependency blocking phase 2. |
| [Handbook #53](https://github.com/RebelliousSmile/obsidian-handbook/issues/53) | Tracks Mist-specific frozen adoption, SRI validation, detached proof, machine-readable evidence, and real pack install/render verification. It is the current Handbook dependency blocking phase 2. |
| [GitHub release asset API](https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28) | Release assets expose a download URL and SHA-256 digest and can be downloaded as binary content for independent verification. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep candidate manifests as committed, declarative repository files; never accept shell fragments or consumer commands from them. | The manifest pins URL, SHA-256 and SHA-512 SRI while consumer-owned commits pin their own frozen dependency graphs; neither surface is executable configuration. |
| Retain the existing daily provider-contract gate unchanged. | Its fixed shared matrix detects baseline drift, while the train proves one release candidate adopted by the selected immutable consumer commits. |
| Promote the already SHA-verified candidate download rather than running `release:prepare` again. | A second build could produce different bytes and would not prove what the consumers installed. |
| Keep Lantern and Handbook runtime adapters and proof internals consumer-owned. | This package owns its schema, provider descriptor, packs, and provenance only, as required by the cross-repository contract rule. |
| Record the SRI-aware contract and consumer tickets in the task folder. | `issue-23-contract.md`, `lantern-issue.md`, and `handbook-issue.md` preserve the exact material published externally; commits `e48abb2`, `3813b28`, and `ba0184b` preserve the provider work. |
