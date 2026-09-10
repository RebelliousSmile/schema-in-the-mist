---
status: done
---

# Instruction: Answer the three design questions on issue #1

## Tasks to do

### `1)` Post the design answers as an issue comment

> The issue asked three questions and proposed a field table; the shipped schema answers all three. Say so publicly, and correct the one claim that no longer holds.

1. Comment on `RebelliousSmile/schema-in-the-mist#1`, in English, covering steps 2 to 8 below.
2. **Q1 — scope of `quest`, the tracks and `milestone`:** included, all optional. A schema that cannot express a Quest cannot describe a Story Theme; optionality keeps documents from today's tools valid.
3. **Q2 — `category`:** free string, with the published themebook names carried as `examples`. A closed enum would reject homebrew themebooks outright.
4. **Q3 — braces on tag fields:** stored bare. Unlike `challenge.tags_and_statuses`, which mixes tags with prose and needs the braces to tell them apart, every entry in `power_tags` / `weakness_tags` is a tag and the field name says which kind. This also matches what the Obsidian parser produces on read.
5. **Correction to the issue body:** the proposed shape said "everything but `title_tag` is optional". The generated JSON Schema requires `title_tag` **and** `level`, because `.default()` under Zod's `io: "output"` makes a defaulted field required — the same rule that already makes `name` and `rating` required on `challenge` and `danger`. State the required pair explicitly so downstream tools are not surprised.
6. **Same trap one level down:** `meta.publication_type` is defaulted too, so it sits in the `meta` object's own `required` list. A tool writing `meta: { "authors": [...] }` without `publication_type` fails validation. Say so in the comment — again matching `challenge` and `danger`.
7. Note that whether `gen-schemas.ts` should emit the input view instead (`io: "input"`, which would empty the `required` list on all three targets) is a separate, repo-wide question and does not belong to this issue.
8. Post the comment only. Editing the issue body instead is the author's call, and closing the issue is not part of this plan.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Issue #1 carries a comment that answers all three questions, names `title_tag` and `level` as the required pair, and flags `meta.publication_type` as required inside `meta` |
