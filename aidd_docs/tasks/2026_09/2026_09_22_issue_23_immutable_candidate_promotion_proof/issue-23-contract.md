## Provider-neutral release-train contract (v1)

`schema-in-the-mist` owns this manifest and candidate provenance. Lantern and Handbook own their adoption commits, frozen dependency graphs, and application-specific proofs.

```json
{
  "version": 1,
  "provider": {
    "repository": "RebelliousSmile/schema-in-the-mist",
    "commit": "<40 lowercase hex>",
    "finalTag": "vX.Y.Z",
    "archiveUrl": "https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/<candidate-tag>/schema-in-the-mist-X.Y.Z.tgz",
    "sha256": "<64 lowercase hex>",
    "integrity": "sha512-<base64>"
  },
  "consumers": {
    "lantern": { "repository": "RebelliousSmile/lantern", "commit": "<40 lowercase hex>" },
    "handbook": { "repository": "RebelliousSmile/obsidian-handbook", "commit": "<40 lowercase hex>" }
  }
}
```

### Invariants

1. The provider stages the archive once from `provider.commit`; its final-version filename, SHA-256 and npm SHA-512 SRI are recorded before either consumer adopts it.
2. Each consumer creates and commits its own adoption branch before the train: `package.json` and the active frozen lockfile must name the exact stable archive URL and SRI. The runner never rewrites a consumer checkout, lockfile, or manifest.
3. The train clones only each declared full consumer SHA into a disposable detached checkout, verifies `HEAD`, runs a frozen install, and invokes only `npm run release-train:assert -- <manifest>`.
4. Each consumer command writes machine-readable evidence containing `status`, consumer repository/commit, archive URL, SHA-256, SRI, resolved package version, and lockfile integrity. Lantern additionally proves its production Vite path; Handbook additionally proves its real install/render path for Mist’s published descriptor, packs, and assets.
5. Promotion validates both evidence records and re-verifies the candidate bytes before attaching those exact bytes and checksum to `provider.finalTag`; promotion never rebuilds the package.
6. The existing daily pinned provider-contract gate remains independent of candidate adoption and promotion.

### Scope

This contract applies to the `schema-in-the-mist` archive, `cross-tool-provider.json`, and the published Handbook packs. It does not move Lantern adapters, Handbook renderer semantics, or consumer user data into this repository.
