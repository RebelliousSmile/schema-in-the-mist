## Parent

RebelliousSmile/schema-in-the-mist#23

## Goal

Add a `schema-in-the-mist` release-train proof. The central runner must only read a committed Lantern adoption SHA in a detached disposable checkout; it must never rewrite a published Lantern checkout, `package.json`, or `pnpm-lock.yaml`.

## Acceptance criteria

- A dedicated adoption commit pins the exact Mist candidate archive URL in `package.json` and records its SHA-512 SRI in the active `pnpm-lock.yaml`.
- The proof rejects a redirect, absent SRI, URL mismatch, integrity mismatch, version drift, or any transitive dependency change.
- `pnpm install --frozen-lockfile` installs the committed real Lantern graph before the proof runs.
- `npm run release-train:assert -- <manifest>` accepts the generic Mist v1 manifest and emits machine-readable evidence containing consumer repo/commit, candidate URL, SHA-256, SRI, resolved package version, and lockfile integrity.
- The proof executes the production Vite build against the adopted Mist archive and verifies the published Mist provider surface without a consumer-local semantic fallback.
- The command is safe from a detached checkout and makes no repository mutation.

## Ownership

Lantern owns its package manifest, lockfile, Vite proof, adapters, and result details. `schema-in-the-mist` owns the provider manifest and candidate archive only.
