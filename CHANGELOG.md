# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
