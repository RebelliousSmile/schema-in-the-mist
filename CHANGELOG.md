# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.5.1] - 2026-09-10

### Added

- Document the provenance and upstream notices for the third-party assets shipped by the Handbook packs, including their unresolved redistribution status.
- Validate the Handbook repository catalogue, manifests, appearance payloads and complete declared asset set as part of `npm run check`.

## [v0.5.0] - 2026-09-10

### Added

- Publish installable Handbook packs for City of Mist, Legend in the Mist, and :Otherscape, including their manifests, fonts, illustrations, and repository catalog.
- **City of Mist** gains three targets beside `danger`: `custom-move`, `theme-kit` and `theme-card`. Each carries its Zod source, its generated JSON Schema, and a JSON + TOML example pair.
- City of Mist **Custom Move** — a standalone move: `trigger` plus `outcomes[]`, where the Danger's nested `custom_moves` squash both into one description string. Keeping them apart is what lets a move be rolled: `roll` is optional because most custom moves are diceless, and each outcome names the `tier` that produces it (`miss` / `hit` / `7-9` / `10+` / `12+`). `options` and `pick_count` sit on the tier, not on the list, because the same list serves several tiers with a different count each.
- `template` on Custom Move records which of the MC Toolkit's five templates the move was written from (`active_shield`, `countdown_outcome`, `starting_status`, `status_filter`, `status_payload`, or `freeform`). It is a record, not a storage format: the prose the template produced lives in `trigger` and `outcomes`, and editing it afterwards does not invalidate the value.
- City of Mist **Theme Kit** — the blank themebook, and **Theme Card** — the same questionnaire answered. They are two targets rather than one because a card can be read without the book that produced it, and a book ships with no card at all. `theme_type` (`mythos` / `logos` / `extra` / `crew`) is required without a default on both, on the same reasoning as Journey's `type` and :Otherscape's: it decides the banner, the motivation's grammar and the erosion track.
- The question `letter` travels from kit to card. On Theme Kit it is required and matched by `/^[A-Z]$/`; on Theme Card it is optional, because a homebrew tag answers no question.
- Theme Kit constrains `improvements` to **exactly five**: every themebook the books print carries five, no more and no fewer. Theme Card leaves the array free, since a card lists only the improvements it needs to.
- Theme Card's erosion track is `fade` on a Mythos theme and `crack` on a Logos one, the books' own names; a corpus elsewhere calls the same track `deterioration`. Extra and Crew cards carry no erosion track at all.
- Both card tracks refine `filled <= maximum` and report the issue on `filled` rather than on the track, so a consumer can name the field that is out of range. Note that the constraint is a Zod refinement and does not survive into the generated JSON Schema: an Ajv-only consumer will accept `{ filled: 4, maximum: 3 }`.
- There is no Mist theme type in City of Mist. The root descriptions of both new targets say so, because the notion belongs to Legend in the Mist and the two vocabularies are otherwise close enough to be confused.

### Changed

- Move canonical ownership of the cross-game `appearance/game-pack` contract to `RebelliousSmile/schema-appearance`, reconciling the `9535e94` contract with the `polarities` and `shapes` work from `00669b8`.

### Deprecated

- Keep complete, frozen compatibility schemas at both `appearance/game-pack.schema.json` and `schemas/appearance/game-pack.schema.json`. New consumers should use the canonical schema-appearance URL; removing either legacy path requires a separately approved breaking release.

## [v0.4.0] - 2026-09-07

### Added

- **:Otherscape** joins Legend in the Mist and City of Mist as a third game, with six targets shipped at once: `challenge`, `power-set`, `theme-kit`, `theme`, `character-trope` and `loadout-item`. Each carries its Zod source, its generated JSON Schema, and a JSON + TOML example pair.
- :Otherscape **Challenge** — the counterpart of the Legend in the Mist target, deliberately thinner: `threats[].consequences` is optional, and there is no `rating`, no `mights`, no `roles` and no `is_immune`. The books do not print them.
- :Otherscape **Power Set** and **Theme Kit** — the two blank forms a character is built from. `theme_type` (`self` / `mythos` / `noise` / `crew`) is required without a default, on the same reasoning as Journey's `type`: no value is the obvious one.
- :Otherscape **Theme** — the played theme, the counterpart of Legend in the Mist's Story Theme. It is named `theme`, not `story-theme`, because that is the word the three :Otherscape books use throughout. Kit and theme share `title_tag`, `theme_type`, `category`, `power_tags`, `weakness_tags` and `quest` field for field, so a tool turns one into the other without a mapping table — where the Legend in the Mist pair still needs `name` → `title_tag`.
- The two Theme tracks are `upgrade` and `decay`, non-negative integers capped at **3**: three boxes reset the track, and the fourth box does not exist. They count what Story Theme calls `improve` and `abandon`; the spelling follows the :Otherscape sheet.
- Theme carries **no `level` and no `milestone`**. The absence is measured, not pending: :Otherscape has no theme tiers and no milestone track anywhere in the three books. This is the sharpest divergence from Story Theme, which carries both.
- :Otherscape **Character Trope** — a starting package: `theme_kits` and `choices` both hold `{ title_tag, category }` references, and `loadout` is a list of plain strings that deliberately does *not* resolve against `loadout-item`.
- :Otherscape **Loadout Item** — a Street Catalog entry. `weakness_tag` is a single optional string rather than an array, because the catalog prints exactly one per specific item; the first entry of `feature_tags` is the item's own name.
- `category` now carries three unrelated meanings across the targets, each documented on its own field: a themebook name on Theme Kit and Theme, a Street Catalog rubric on Loadout Item, and a printing heading on Character Trope. It stays a free string everywhere so homebrew remains expressible.

### Fixed

- `npm run gen` now creates the game subdirectory under `schemas/` instead of failing when it does not already exist.

## [v0.3.0] - 2026-09-07

### Added

- Legend in the Mist **Journey** schema: Zod source, generated JSON Schema, and a JSON + TOML example (`the-long-road-to-blackmere`). It is the first target with a nested list of objects — `vignettes`, each `{ name, trigger?, consequences[] }` — where a vignette that exists carries at least one consequence.
- `type` on Journey (`landscape` / `occasion` / `undertaking`) is **required without a default**. Consumers should note the consequence: `journey` is the first target whose schema rejects an empty object, where the other four parse `{}` and return their defaults. A default would have invented a Journey type nobody wrote.
- Journey carries two `consequences` lists: one at the root, applying anywhere along the Journey, and one per vignette. Challenge draws the same distinction under the name `general_consequences`; Journey keeps a single name at both levels and disambiguates through the field descriptions.

## [v0.2.0] - 2026-09-07

### Added

- Legend in the Mist **Theme Kit** schema: Zod source, generated JSON Schema, and a JSON + TOML example (`the-hedge-witch`). It shares `category`, `power_tags`, `weakness_tags`, `quest` and `meta` verbatim with Story Theme, so a Story Theme can be filled from a kit by copying those fields; `name` is the one field a tool has to map, onto `title_tag`.
- `improvements` on Theme Kit: an array of `{ name, effect? }` listing the improvement options a kit offers. Unrelated to Story Theme's `improve`, which counts the Improve marks currently on a track.

## [v0.1.0] - 2026-09-06

### Added

- Legend in the Mist **Story Theme** schema: Zod source, generated JSON Schema, and a JSON + TOML example (`the-village-i-left-behind`).
- City of Mist **Danger** schema.
- Project structure and the Legend in the Mist **Challenge** schema, with the Zod-to-JSON-Schema generation and AJV validation pipeline.

### Fixed

- `CONTRIBUTING.md` now points at the real constants path, `src/zod/constants.ts`.
- Corrected the accent on "Raphaël".
- Cleaned up the Zod structure and added `CONTRIBUTING.md` and `README.md`.
