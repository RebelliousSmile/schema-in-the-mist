# Release trains

Each final release is promoted from a committed JSON manifest in this directory.
Create the candidate first with `npm run release-train:stage -- <provider-commit> <final-tag>`; commit a manifest only after its output and both consumer commits are known. The manifest is declarative: it never contains commands, paths, or environment values.

`npm run release-train:validate` checks every committed manifest. `npm run release-train:assert -- <manifest>` is the only provider entry point permitted to invoke consumer proof commands.
