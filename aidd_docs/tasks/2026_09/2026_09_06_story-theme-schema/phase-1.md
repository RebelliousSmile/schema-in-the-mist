---
status: done
---

# Instruction: Fix the CONTRIBUTING path for new targets

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
└── CONTRIBUTING.md   ✏️  "New target in `src/constants.ts`" -> `src/zod/constants.ts`
```

## Tasks to do

### `1)` Point contributors at the real constants file

> A contributor following CONTRIBUTING must land on a file that exists.

1. In `CONTRIBUTING.md` line 12, under "Submit a PR", replace `src/constants.ts` with `src/zod/constants.ts`. It is the only broken path in the repo — every other path quoted in `CONTRIBUTING.md` and `README.md` resolves.
2. Leave the sample target block as is — `LegendInTheMistChallengeSchema` / `GAMES.litm` / `"challenge"` still matches `src/zod/constants.ts`.
3. Do not touch the `npm run gen` / `npm run check` commands: `package.json` declares them and `package-lock.json` is the committed lockfile, so npm stays the documented runner for this repo.
4. Leave the edit uncommitted.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 1    | Every file path quoted in `CONTRIBUTING.md` resolves to a file that exists in the repo                  |
