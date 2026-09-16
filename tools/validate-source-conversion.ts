import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { MIST_SOURCE_CONVERSION_CODECS, type MistSourceConversionTarget } from "../src/index.js";

type SourceConversionCase = {
  id: string;
  target: MistSourceConversionTarget;
  file: string;
  expectedKind: "concise" | "raw";
};

const root = path.resolve("corpus/contract");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "source-conversion-cases.json"), "utf8"),
) as { version?: unknown; cases?: unknown };

assert.equal(manifest.version, 1, "Unsupported source conversion manifest version");
assert.ok(Array.isArray(manifest.cases), "Source conversion cases must be an array");
const cases = manifest.cases as SourceConversionCase[];
const ids = new Set<string>();
const coverage = new Map<string, Set<string>>();
const targetKeys = new Set(Object.keys(MIST_SOURCE_CONVERSION_CODECS));

for (const entry of cases) {
  assert.equal(typeof entry.id, "string");
  assert.ok(!ids.has(entry.id), `Duplicate source conversion case id: ${entry.id}`);
  ids.add(entry.id);
  assert.ok(targetKeys.has(entry.target), `Unknown source conversion target: ${entry.target}`);
  assert.ok(["concise", "raw"].includes(entry.expectedKind));

  const file = path.resolve(root, "source-conversion", entry.file);
  const base = path.join(root, "source-conversion");
  assert.ok(file.startsWith(`${base}${path.sep}`), `Unsafe corpus path: ${entry.file}`);
  assert.ok(fs.statSync(file).isFile(), `Missing corpus file: ${entry.file}`);
  const source = fs.readFileSync(file, "utf8");

  const codec = MIST_SOURCE_CONVERSION_CODECS[entry.target];
  const result = codec.convertToSource(source);
  assert.equal(result.kind, entry.expectedKind, `${entry.id}: unexpected conversion kind`);

  const expectations = coverage.get(entry.target) ?? new Set<string>();
  expectations.add(entry.expectedKind);
  coverage.set(entry.target, expectations);
}

for (const target of targetKeys) {
  assert.deepStrictEqual(
    coverage.get(target),
    new Set(["concise", "raw"]),
    `${target} needs at least one concise and one raw source conversion case`,
  );
}

console.log(`Validated ${cases.length} source conversion cases across ${targetKeys.size} targets.`);
