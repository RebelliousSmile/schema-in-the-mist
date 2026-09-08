import fs from "node:fs";
import { z } from "zod";
import { TARGETS } from "../src/zod/constants";

for (const t of TARGETS) {
  const json = z.toJSONSchema(t.zod, { target: "draft-7" });
  // `appearance` is not a played game but the cross-game presentation
  // vocabulary a game pack is written in. It publishes at the repository
  // root (`appearance/<name>.schema.json`), matching the path a game pack
  // document already points at, rather than nested under `schemas/`.
  const outDir = t.game.folder === "appearance" ? "appearance" : `schemas/${t.game.folder}`;
  const outPath = `${outDir}/${t.name}.schema.json`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log("Wrote", outPath);
}
