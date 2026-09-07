# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
