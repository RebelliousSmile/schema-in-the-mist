---
status: done
---

# Instruction: Answer issue #2

## Architecture projection

> No repository file changes. The deliverable is a comment on issue #2.

```txt
.
```

## Tasks to do

### `1)` Post the design answer on issue #2

> One comment, answering all four questions against the shape that phase 1 actually shipped.

1. Target the fork explicitly: `rtk proxy gh issue comment 2 --repo RebelliousSmile/schema-in-the-mist --body-file <file>`. Two traps, both hit while handling issue #1: without `--repo`, `gh` resolves to `4rtamis/schema-in-the-mist`, where this issue does not exist; and rtk's `gh` filter swallows the output, so `rtk proxy` is what shows whether the call worked.
2. **Question 1** — `name`, as the issue leaned. Give the reason: `challenge` and `danger` already carry `name` at the root, and `story-theme` uses `title_tag` only because that field is a tag a Hero invokes. One mapped field is the accepted cost.
3. **Question 2** — array, and say plainly that this was *not* settled by knowing the published kits. State the actual reasoning: an array of one is lossless for the plugin's single `improvement:` line, whereas a scalar cannot hold a two-improvement kit. Invite anyone who knows the published material to contradict it, and note that narrowing to a scalar later would be a breaking change.
4. **Question 3** — bare, unchanged from #1.
5. **Question 4** — kept duplicated, because all three existing targets already define their own `PublicationTypeEnum` and `MetaSchema`. Factoring them out is a repo-wide change and belongs in its own issue.
6. Flag the naming collision the issue did not raise: `theme-kit.improvements` lists the options a kit offers, while `story-theme.improve` counts marks on a track. Near-homonyms, unrelated meanings, in sibling schemas.
7. Note that the "copy rather than map" promise holds for `category`, `power_tags`, `weakness_tags`, `quest` and `meta` — five fields spelled identically — that `name` maps to `title_tag`, and that `improvements` has no `story-theme` counterpart at all. Five copy, one maps, one is new.
8. Note that `level` was deliberately left out because the issue's table omits it, and ask whether a kit should carry a tier.
9. State that the generated schema's root `required` is exactly `["name"]`, and that `meta` — when present — requires `publication_type`, both consequences of `.default()` under the output view.
10. Do not close the issue. Closing is a human call.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | ------------------- |
| 1 | Issue #2 on `RebelliousSmile/schema-in-the-mist` carries one comment answering all four questions, disclosing that question 2 was decided by reasoning rather than by knowledge of the published kits, raising the `improvements` / `improve` collision and the missing `level`, and the issue is still open. |
