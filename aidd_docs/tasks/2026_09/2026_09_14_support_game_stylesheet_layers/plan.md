---
objective: "A Handbook game pack may declare safely installed stylesheet resources that Handbook applies only for its active game, after its shared stylesheet, without affecting existing token-only packs."
status: implemented
---

# Plan: Support game stylesheet layers in schema packs

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Extend the canonical appearance-pack contract and Handbook pack pipeline so game-owned CSS is safely distributed, scoped, applied, and removed with the active pack. |
| **Source** | GitHub ticket [RebelliousSmile/schema-in-the-mist#11](https://github.com/RebelliousSmile/schema-in-the-mist/issues/11) |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Release the pack stylesheet contract | [phase-1.md](./phase-1.md) |
| 2 | Consume and activate the released contract in Handbook | [phase-2.md](./phase-2.md) |
| 3 | Move City of Mist structural typography into its pack | [phase-3.md](./phase-3.md) |

## Resources

| Source | Verified |
| --- | --- |
| [Issue #11](https://github.com/RebelliousSmile/schema-in-the-mist/issues/11) | Requires declared game stylesheet resources, safe installed-source loading, active-pack lifecycle cleanup, game scope, token compatibility, and compatibility with token-only packs. |
| [Canonical `game-pack` schema](https://github.com/RebelliousSmile/schema-appearance/blob/main/schemas/appearance/game-pack.schema.json) | Canonical commit `22367691ef8fb5890bf08cc8fcdc0f422eee66d3` defines `assets.stylesheets` with normalized forward-slash paths; the frozen local copies must match its content after newline normalization. |
| [Handbook source installer](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/src/games/sourceInstaller.ts) | Installation downloads only declared images and fonts after safe-relative-path checks; stylesheet resources need the same staging and byte-limit protections. |
| [Handbook pack types](https://github.com/RebelliousSmile/obsidian-handbook/blob/main/src/games/types.ts) | The consumer currently documents that packs never contain CSS and must gain an explicit stylesheet representation and lifecycle. |
| [Handbook styles](https://github.com/RebelliousSmile/obsidian-handbook/tree/main/src/styles/city-of-mist) | City of Mist structural selectors and typography remain in consumer SCSS, providing the concrete migration target requested by the ticket. |
| Local repository state | `main` at `fdcdc4c` synchronizes the two frozen schemas with canonical content; the only platform difference is the working-tree line ending managed by Git. |

## Decisions

| Decision | Why |
| --- | --- |
| Declare an ordered optional `assets.stylesheets` list of safe paths relative to the existing pack asset root. | It follows the installed-resource model already used for fonts/images, supports one or more layers, gives token-only packs an unchanged empty default, and lets the producer validator reject undeclared or escaping files. |
| Keep selector and polarity enforcement in Handbook, not in JSON Schema. | JSON Schema can validate resource declarations but cannot reliably prove CSS selector nesting or theme semantics; the executable consumer owns the DOM classes and must reject unsafe CSS before injection. |
| Extend the existing per-document `GameStyleWriter` with a distinct pack-CSS element, placed after both the compiled generic stylesheet and the generated token element. | It preserves its proven detached-window tracking and cleanup while keeping pack CSS later than generic and token declarations; replacing the complete text makes game changes atomic. |
| Resolve stylesheet `url(...)` references only to already declared local pack assets and rewrite them to vault resource URLs before injection. | An inline style element has no stylesheet-file base URL; this preserves valid asset rendering while forbidding network, data, absolute, escaping, and undeclared resource loads. |
| Deliver the contract change first in `schema-appearance`, then synchronize this repository's frozen compatibility copies. | The README establishes `schema-appearance` as canonical; changing only deprecated copies would create a divergent contract. |
| Implement consumer behavior only from a writable `obsidian-handbook` worktree. | This repository publishes the pack contract and assets; it cannot safely contain a duplicate consumer implementation. |
| Publish the additive contract as the immutable repository tag and release `v1.1.0` before Handbook consumes it. | The tag freezes the GitHub source tree that contains `handbook/`; the npm tarball remains the codecs-only distribution and is not the pack installer’s input. |
| Ship the first City stylesheet in a follow-up `v1.2.0` repository release. | The v1.1.0 contract release enables the consumer; the City resource itself is a producer change, not a prerequisite that it could wait for. |
