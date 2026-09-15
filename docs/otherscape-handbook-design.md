# Otherscape Handbook design

The canonical design source is `schemas/otherscape/design/`. It is scoped to :Otherscape and must not be shared with the other game schemas.

`metro/light` is evidenced by `page.jpg`, `chapter-title.jpg`, `light-chapo.jpg`, and `description.jpg`; `metro/dark` by `dark.jpg` and `dark-chapo.jpg`. Cairo and Tokyo are outside this projection.

Change tokens and `handbook-projection.json`, then run:

```powershell
npm.cmd run generate:otherscape-design
npm.cmd run validate:otherscape-design
npm.cmd run validate:handbook-packs
```

The generated stylesheet and Metro style branches are checked outputs. Reference captures are evidence only: do not copy their art, logos, or fonts into the pack without an explicit redistribution decision.
