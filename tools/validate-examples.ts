import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  MIST_ENGINE_CODECS,
  TARGETS,
  type MistDocumentCodec,
  type MistEngineDocumentTarget,
} from "../src/index.js";
import type { z } from "zod";

let checkedFiles = 0;

for (const target of TARGETS) {
  const codec = MIST_ENGINE_CODECS[
    target.key as MistEngineDocumentTarget
  ] as MistDocumentCodec<z.ZodType>;
  const directory = path.join("examples", target.game.folder, target.name);
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json") || file.endsWith(".toml"));
  const normalizedByStem = new Map<string, Map<string, unknown>>();

  for (const file of files) {
    const text = fs.readFileSync(path.join(directory, file), "utf8");
    const extension = path.extname(file);
    const stem = path.basename(file, extension);
    const parsed = extension === ".toml" ? codec.parseToml(text) : codec.parseJson(text);
    const reparsed =
      extension === ".toml"
        ? codec.parseToml(codec.stringifyToml(parsed))
        : codec.parseJson(codec.stringifyJson(parsed));

    assert.deepStrictEqual(reparsed, parsed, `${target.key}/${file} did not round-trip`);
    const pair = normalizedByStem.get(stem) ?? new Map<string, unknown>();
    pair.set(extension, parsed);
    normalizedByStem.set(stem, pair);
    checkedFiles += 1;
  }

  for (const [stem, pair] of normalizedByStem) {
    if (pair.has(".json") && pair.has(".toml")) {
      assert.deepStrictEqual(
        pair.get(".json"),
        pair.get(".toml"),
        `${target.key}/${stem} differs between JSON and TOML`,
      );
    }
  }
}

assert.equal(Object.keys(MIST_ENGINE_CODECS).length, 14);
console.log(`Validated ${checkedFiles} example files through 14 public codecs.`);
