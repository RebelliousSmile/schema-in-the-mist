# Manual immutable release trains

This directory contains only committed, declarative release manifests. A train has one final package version and two pinned consumer proofs: Lantern and Handbook. It cannot contain commands, local paths, branch names, or mutable download URLs.

## Operator flow

1. At the provider commit, run `npm run release-train:stage -- <full-commit> <final-tag>`.
2. Upload the resulting final-version archive once to a published prerelease tag of the form `<final-tag>-rc.N`. Record its URL, SHA-256, SHA-512 SRI, staging tag, final tag, provider commit, and full consumer adoption commits in `release-trains/<final-tag>.json`.
3. Validate the committed shape with `npm run release-train:validate`.
4. Run `npm run release-train:assert -- release-trains/<final-tag>.json`. It verifies candidate bytes first, makes disposable detached consumer checkouts, and invokes only each consumer's fixed `npm run release-train:assert -- <manifest>` command.
5. Promote only its emitted provenance using `npm run release-train:promote -- release-trains/<final-tag>.json --evidence <provenance.json>`. The promoter downloads or receives the candidate archive, hashes it again, and attaches those exact bytes to the final tag. It has no build command.

`--dry-run` on promotion checks a complete evidence/archive pair without creating a GitHub release. There is intentionally no tag-triggered GitHub Actions release workflow: publication remains an explicit maintainer action.
