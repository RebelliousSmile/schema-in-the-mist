---
status: done
---

# Instruction: Answer issue #3

## Architecture projection

> No repository file changes. The deliverable is a comment on issue #3.

```txt
.
```

## Tasks to do

### `1)` Post the design answer on issue #3

> One comment, answering all four questions against the shape that phase 1 actually shipped.

1. Target the fork explicitly, with `gh issue comment 3 --repo RebelliousSmile/schema-in-the-mist --body-file <file>`, run through `rtk proxy`. Two traps, both hit on issues #1 and #2: without `--repo`, `gh` resolves to `4rtamis/schema-in-the-mist`, where this issue does not exist; and rtk's `gh` filter swallows the output, so `rtk proxy` is what shows whether the call worked.
2. **Question 1** — `type` is required with no default. Lead with the measurement, because it reframes the question: an enum with neither `.default()` nor `.optional()` already lands in `required`, and so does one with a `.default()`. The two options produce the same `required` list. What differs is a `"default"` key in the generated JSON Schema and, on the Zod side, whether parsing an object with no `type` fails or silently yields a type nobody wrote.
   - Address the `story-theme` precedent the question invokes head-on rather than dismissing it: `level` earned its `.default("origin")` because `origin` is where a Story Theme *starts*. No journey type is where a Journey starts, so there is nothing to pick that is not arbitrary among three values that each mean something. The issue already says this in its own words — "the default is not obvious the way `origin` was" — so agree with it explicitly.
   - Disclose the cost, measured, rather than letting a consumer find it: `challenge`, `story-theme`, `theme-kit` and `danger` all accept `.parse({})` and hand back their defaults; `journey` is the first target that throws on `{}`. State that this is knowingly accepted, and that the alternative is a schema which accepts an empty object and returns a Journey type nobody wrote.
   - Anticipate the obvious rebuttal — `name` keeps `.default("Untitled Journey")` in the very same file. Give the criterion that separates them: a default is warranted when the value it invents is the only one it could be, refused when it picks among meaningful alternatives. `Untitled Journey` asserts nothing about the Journey; `landscape` would assert something false about two thirds of them.
3. **Question 2** — one string. `challenge.description` and `story-theme.quest` are both plain optional strings; an array would make `journey` the only target where prose is a list. Newlines carry the paragraph breaks the plugin's `:` lines preserve, so nothing is lost on export.
4. **Question 3** — prose, at both levels, and say that this is not a new judgement: `ThreatSchema.consequences` in `challenge.ts` is already an array of prose strings whose examples carry parenthesised effects inline. Splitting text from effect would invent a shape no producer emits.
5. **Question 4** — `vignettes` is optional, as the issue leaned. Add the part the question did not cover: `vignettes[].consequences` is required and non-empty, mirroring `threats[].consequences` in `challenge`. A Journey with no vignette is a short Journey; a vignette with no consequence is an empty row.
6. State plainly which claims in the answer rest on the Obsidian plugin's behaviour as **reported in the issue** rather than verified — the plugin is in another repository and was not read. Every decision above rests on in-repo precedent or on a measurement, not on the plugin.
7. Give the two `consequences` fields their distinction explicitly: the root list applies anywhere in the Journey, a vignette's list belongs to that vignette. Say plainly that this diverges from the sibling: `challenge` faced the same pair and renamed the root one `general_consequences` to keep it unambiguous. The issue's table says `consequences`, so the table was followed and the disambiguation lives in the two `description` strings instead of the field names. Offer `general_consequences` as the fallback if the author would rather match the sibling — it is a rename, not a redesign.
8. State that the generated root `required` is exactly `["name", "type"]`, that `vignettes` items require `name` and `consequences`, and that `meta` — when present — requires `publication_type`, that last one a consequence of `.default()` under the output view.
9. Note the two fields the issue's table omits and that were therefore left out: no `level` and no `rating` on a Journey. Ask whether a Journey should carry a tier, the same question left open on `theme-kit`.
10. Note that `tags` is bare rather than `power_tags` or `tags_and_statuses`, and why: a Journey has no weakness axis to oppose its tags to.
11. Ask about `trigger` — the one field in the target with no sibling to copy. `ThreatSchema` has no equivalent, and `SpecialFeatureSchema` folds the trigger into its prose description instead. Quote the `description` text that actually shipped and ask whether it matches what the plugin's blocks mean by it, since that text is the entire contract. Mention that its structural counterpart, `ThreatSchema.description`, is required and capped at 100 characters, whereas `trigger` is optional and uncapped, following the issue's `trigger?`.
12. Do not close the issue. Closing is a human call.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | ------------------- |
| 1 | Issue #3 on `RebelliousSmile/schema-in-the-mist` carries one comment answering all four questions, showing that question 1's two options yield the same `required` list, disclosing that the Obsidian plugin was not read, distinguishing the root and vignette `consequences`, raising the absent `level` and `rating`, and the issue is still open. |
| 1 | The comment holds nothing a reader can turn back on it: it states that `journey` is the first target to reject `.parse({})`, gives the criterion that lets `name` keep a default while `type` does not, names the `general_consequences` rename it chose not to follow, and asks the author to confirm `trigger`. |
