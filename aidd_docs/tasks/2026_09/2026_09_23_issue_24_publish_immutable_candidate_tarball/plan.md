---
objective: "A maintainer can manually publish a reproducible, immutable prerelease tarball for the current schema-in-the-mist release train without any route to stable publication."
status: in-progress
---

# Plan: Publish an immutable candidate tarball

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Add a guarded manual candidate-release workflow that creates exactly one reproducible tarball and SHA-256 checksum for a valid release-candidate tag. |
| **Source** | GitHub issue [RebelliousSmile/schema-in-the-mist#24](https://github.com/RebelliousSmile/schema-in-the-mist/issues/24) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Publish and verify guarded candidate bytes | [phase-1.md](./phase-1.md) |
| 2 | Document candidate-to-train handoff | [phase-2.md](./phase-2.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #24](https://github.com/RebelliousSmile/schema-in-the-mist/issues/24) | Defines the manual-only candidate workflow, validation and immutability constraints, two-asset contract, and release-train documentation requirement. |
| [Issue #23](https://github.com/RebelliousSmile/schema-in-the-mist/issues/23) | Establishes that the train adopts and proves a candidate archive before byte-identical stable promotion; candidate publication must not perform stable promotion. |
| [Reference release workflow](https://github.com/RebelliousSmile/schema-adrenaline/blob/main/.github/workflows/release.yml) | Demonstrates Linux/Node 20 preparation, GitHub Release asset digest verification, and immutable-release polling through the GitHub API. |
| [GitHub release assets API](https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28) | Confirms release assets expose a SHA-256 digest for post-upload verification. |

## Decisions

| Decision | Why |
| --- | --- |
| Make candidate publication a separate `workflow_dispatch`-only workflow. | A candidate is a provider-owned prerequisite to the existing manifest-led train, while stable promotion remains exclusively in the train flow. |
| Validate and re-verify the release through GitHub API calls in the workflow. | Tag ownership, prerelease state, asset set, server-calculated digest, and immutable state must be proved against GitHub rather than inferred from local command success. |
| Reuse only a candidate release at the dispatched commit and fail closed on every conflicting existing state. | Re-running a request may safely prove the same immutable candidate, but must never replace or repoint bytes, tags, or releases. |
| Separate the new-release upload path from the existing-release verification path. | An existing immutable candidate must be verified without any upload attempt; a partial, mutable, or asset-conflicting release is unsafe to resume. |
