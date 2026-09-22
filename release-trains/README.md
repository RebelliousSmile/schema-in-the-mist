# Release trains

Each final release is promoted from a committed JSON manifest in this directory.
Create the candidate first with `npm run release-train:stage -- <provider-commit> <final-tag>`; commit a manifest only after its URL, SHA-256, SHA-512 SRI, and both consumer adoption commits are known. Consumers commit their own package manifest and frozen lockfile before the train runs; the runner only checks out those commits detached and disposable. The manifest is declarative: it never contains commands, paths, or environment values.

`npm run release-train:validate` checks every committed manifest. `npm run release-train:assert -- <manifest>` is the only provider entry point permitted to invoke consumer proof commands.
