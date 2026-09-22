## Parent

RebelliousSmile/schema-in-the-mist#23

## Goal

Add a `schema-in-the-mist` release-train proof. The central runner must only read a committed Handbook adoption SHA in a detached disposable checkout; it must never rewrite a published Handbook checkout, manifest, or frozen lockfile.

## Acceptance criteria

- A dedicated adoption commit pins the exact Mist candidate archive URL in the package manifest and records its SHA-512 SRI in the active `pnpm-lock.yaml`.
- The proof rejects a redirect, absent SRI, URL mismatch, integrity mismatch, version drift, or any transitive dependency change.
- `pnpm install --frozen-lockfile` installs the committed real Handbook graph before the proof runs.
- `npm run release-train:assert -- <manifest>` accepts the generic Mist v1 manifest and emits machine-readable evidence containing consumer repo/commit, candidate URL, SHA-256, SRI, resolved package version, and lockfile integrity.
- The proof validates the adopted Mist `cross-tool-provider.json`, published pack manifests and declared assets through Handbook’s actual install/render path.
- The command is safe from a detached checkout and makes no repository mutation.

## Ownership

Handbook owns installation, rendering, pack activation, lockfile, and result details. `schema-in-the-mist` owns its provider manifest, schemas, and published packs.
