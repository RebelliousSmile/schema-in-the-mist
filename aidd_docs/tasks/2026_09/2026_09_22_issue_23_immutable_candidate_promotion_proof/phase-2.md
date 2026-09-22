---
status: pending
---

# Instruction: Orchestrate pinned consumer evidence

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-in-the-mist/
├── ✅ tools/release-train-assert.ts               downloads, verifies, and coordinates the candidate proof
├── ✅ tools/release-train-consumers.ts            materializes exact consumer commits and parses their evidence
├── ✅ test/fixtures/release-train-evidence/*.json tests accepted and rejected consumer result records
├── ✏️ package.json                                binds the single public assertion command
├── ✏️ README.md                                   distinguishes daily baseline checks from release-train operation
└── ✏️ CONTRIBUTING.md                              directs maintainers to consumer-owned proof and release order
```

## User Journey

```mermaid
flowchart TD
  A[release-train:assert manifest] --> B[Verify downloaded candidate SHA-256]
  B --> C[Checkout Lantern at manifest commit]
  B --> D[Checkout Handbook at manifest commit]
  C --> E[Run fixed Lantern candidate-proof command]
  D --> F[Run fixed Handbook candidate-proof command]
  E --> G[Validate machine-readable evidence]
  F --> G
  G --> H[Write assertion provenance for promotion]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Supply a valid manifest, candidate archive test server, and consumer checkout fixtures at the named commits => deterministic candidate environment is ready: 5: system
  section Happy path
    Run npm run release-train:assert -- manifest => SHA-verified candidate and both fixed consumer proofs produce matching machine-readable provenance: 5: cli
  section Edge case - altered candidate or consumer evidence
    Change the downloaded bytes, resolved archive, lockfile integrity, consumer commit, or result schema => assertion fails and emits no promotable provenance: 5: cli
  section Teardown
    Remove temporary archives and detached consumer checkouts => workspace returns to baseline: 5: system
```

## Tasks to do

### `1)` Assert the candidate bytes before consumer use

> Both consumers must prove the exact archive declared by the manifest, not a similarly named package.

1. Download the manifest archive into an isolated temporary directory, calculate SHA-256 locally, and validate the package with the existing packed-public-API validator before any consumer proof.
2. Materialize each external repository as a detached checkout at its manifest’s full commit, confirm `HEAD` equals that commit, and prohibit fallback to the daily cross-tool configuration or an existing workspace checkout.
3. Copy the already validated manifest into each detached checkout and invoke consumers solely through the fixed `npm run release-train:assert -- <manifest>` protocol, forwarding the verified candidate identity through the protocol's controlled manifest file, never a manifest command.

### `2)` Verify consumer-owned results and preserve provenance

> The provider coordinates evidence but does not duplicate Lantern’s build or Handbook’s renderer.

1. Require each consumer’s machine-readable result to echo its repository, resolved commit, candidate URL, SHA-256, resolved package version, and lockfile integrity, and reject extra/mismatched identities.
2. Require the Lantern result to attest its production build/install path and the Handbook result to attest its package-pin/source-install and install/render path; retain their detailed assertions in their repositories.
3. Emit one normalized local assertion record that binds the verified archive, manifest digest, provider commit/tag, consumer commits, and validated result digests for the promotion workflow.
4. Document the command, expected ownership boundaries, and release sequence without moving consumer adapters, renderer semantics, or user data into this package.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | `npm run release-train:assert -- <manifest>` only uses the declared archive after local SHA verification and only materializes consumer commits equal to the full hashes in that manifest. |
| 2 | A train passes only when both consumer-owned proofs return structurally valid, identity-matching evidence; changed bytes, commits, archive URLs, lock metadata, or missing build/render proof block promotion. |
