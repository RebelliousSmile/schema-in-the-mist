import fs from "node:fs";
import {
  MIST_ENGINE_CODECS,
  type MistDocumentCodec,
  type MistEngineDocumentTarget,
} from "../src/index.js";
import type { z } from "zod";

const [target, input, output] = process.argv.slice(2);
if (!target || !input || !output || !(target in MIST_ENGINE_CODECS)) {
  throw new Error(
    "Usage: npm run toml:one -- <game/document-type> <input.toml> <output.json>",
  );
}

const codec = MIST_ENGINE_CODECS[
  target as MistEngineDocumentTarget
] as MistDocumentCodec<z.ZodType>;
const value = codec.parseToml(fs.readFileSync(input, "utf8"));
fs.writeFileSync(output, codec.stringifyJson(value));
console.log(`Converted ${input} -> ${output} as ${target}`);
