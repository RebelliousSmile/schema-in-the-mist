# Manual immutable release trains

This directory contains only committed, declarative release manifests. A train has one final package version and two pinned consumer proofs: Lantern and Handbook. It cannot contain commands, local paths, branch names, or mutable download URLs.

## Operator flow

1. Dispatch **Publish candidate archive** from the intended provider commit on `main`, with a tag `<final-tag>-rc.N`. It creates exactly one immutable prerelease archive and checksum, or verify-only reuses an already-complete candidate at that same commit.
2. From the immutable candidate, record its archive URL, SHA-256, SHA-512 SRI, staging tag, final tag, provider commit, and full consumer adoption commits in `release-trains/<final-tag>.json`. Derive the SRI from the downloaded candidate bytes; do not rebuild the package to obtain it.
3. Validate the committed shape with `npm run release-train:validate`.
4. Run `npm run release-train:assert -- release-trains/<final-tag>.json`. It verifies candidate bytes first, makes disposable detached consumer checkouts, and invokes only each consumer's fixed `npm run release-train:assert -- <manifest>` command.
5. Promote only its emitted provenance using `npm run release-train:promote -- release-trains/<final-tag>.json --evidence <provenance.json>`. The promoter downloads or receives the candidate archive, hashes it again, and attaches those exact bytes to the final tag. It has no build command.

`--dry-run` on promotion checks a complete evidence/archive pair without creating a GitHub release. There is intentionally no tag-triggered GitHub Actions release workflow: candidate publication is an explicit maintainer action, and stable publication remains the evidence-gated train operation. This repository owns the candidate bytes and manifest; Lantern and Handbook own their pinned adoption and proof details.
