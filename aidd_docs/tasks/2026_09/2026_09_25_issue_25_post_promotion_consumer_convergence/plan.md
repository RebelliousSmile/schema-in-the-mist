---
objective: "A Mist release train completes only after byte-identical final promotion and verified Lantern and Handbook commits pinning the same canonical final archive and published SRI."
status: in-progress
---

# Plan: Require post-promotion consumer convergence

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Add a distinct final-consumer proof after immutable promotion, record both final commit SHAs, and gate train completion and CI on the committed train record. |
| **Source** | GitHub issue [RebelliousSmile/schema-in-the-mist#25](https://github.com/RebelliousSmile/schema-in-the-mist/issues/25) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Model candidate proof and final convergence separately | [phase-1.md](./phase-1.md) |
| 2 | Enable Mist proof and commit canonical final pins in both consumers | [phase-2.md](./phase-2.md) |
| 3 | Verify the published final release and record convergence | [phase-3.md](./phase-3.md) |
| 4 | Validate the committed Mist train in routine CI | [phase-4.md](./phase-4.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Mist issue #25](https://github.com/RebelliousSmile/schema-in-the-mist/issues/25) | Requires canonical final URL and published SRI in both lockfiles, two immutable final SHAs, separate candidate byte identity, and committed-manifest CI coverage. |
| [Lantern issue #46](https://github.com/RebelliousSmile/lantern/issues/46) | Owns Lantern's canonical provider pins and default release validation; the current Mist dependency is v1.3.4. |
| [Handbook issue #63](https://github.com/RebelliousSmile/obsidian-handbook/issues/63) | Owns Handbook's final pins and host-artifact gate; the current Mist dependency is v1.3.5-rc.2. |
| [Mist v1.3.5 release](https://github.com/RebelliousSmile/schema-in-the-mist/releases/tag/v1.3.5) | The final archive is already published with the candidate SHA-256 digest; this train needs verification and convergence, not another release creation. |

## Decisions

| Decision | Why |
| --- | --- |
| Keep the candidate adoption commits and evidence as the pre-promotion prerequisite, then record separate final adoption commits and evidence. | Final consumer SHAs cannot exist until the final archive is published; reusing candidate SHAs would falsely report convergence. |
| Derive the canonical final URL from the validated final tag and keep the candidate SHA-256 and SHA-512 SRI as byte-identity constraints. | A final channel must be explicit, while the archive bytes and published SRI must remain identical across promotion. |
| Make promotion and convergence distinct, and verify an already-published matching final release without mutating it. | v1.3.5 already exists; the current `gh release create` path cannot be rerun, and publication alone is not train completion. |
| Verify immutable consumer commits in disposable checkouts and keep their package, lockfile, and runtime assertions consumer-owned. | The cross-repository contract rule requires provider provenance without moving consumer semantics or rewriting their checkouts. |
| Require a committed completion record with final refs and evidence in routine offline CI, plus an online final-release and detached-consumer proof at completion. | Manifest shape alone already runs in `npm run check`; it cannot establish that final consumer pins landed. |
| Keep `release-trains/v1.3.5.json` as the Mist-owned manifest without a `protocol` field; version the candidate and final proof envelopes separately. | The existing manifest is the authoritative train record. `protocol: 1` identifies candidate evidence and `protocol: 2` identifies final evidence. The runner's temporary input in each detached consumer checkout is not another committed release-train manifest. |
