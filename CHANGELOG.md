# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
