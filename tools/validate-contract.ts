import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Ajv, type AnySchema } from "ajv";
import addFormats from "ajv-formats";
import IarnaToml from "@iarna/toml";
import { parse as parseToml } from "smol-toml";
import {
  MIST_ENGINE_CODECS,
  TARGETS,
  type MistDocumentCodec,
  type MistEngineDocumentTarget,
} from "../src/index.js";
import type { z } from "zod";

type ContractCase = {
  id: string;
  target: MistEngineDocumentTarget;
  file: string;
  canonical: "accept" | "reject";
  lantern: "round-trip" | "reject";
  handbook: "render" | "degraded" | "null";
};

const root = path.resolve("corpus/contract");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "cases.json"), "utf8"),
) as { version?: unknown; cases?: unknown };

assert.equal(manifest.version, 1, "Unsupported corpus manifest version");
assert.ok(Array.isArray(manifest.cases), "Corpus cases must be an array");
const cases = manifest.cases as ContractCase[];
const ids = new Set<string>();
const coverage = new Map<string, Set<string>>();
const targetKeys = new Set(TARGETS.map(({ key }) => key));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validators = new Map<string, ReturnType<typeof ajv.compile>>();

for (const target of TARGETS) {
  const schemaPath = path.join(
    "schemas/v1",
    target.game.folder,
    `${target.name}.schema.json`,
  );
  validators.set(
    target.key,
    ajv.compile(JSON.parse(fs.readFileSync(schemaPath, "utf8")) as AnySchema),
  );
}

for (const entry of cases) {
  assert.equal(typeof entry.id, "string");
  assert.ok(!ids.has(entry.id), `Duplicate corpus case id: ${entry.id}`);
  ids.add(entry.id);
  assert.ok(targetKeys.has(entry.target), `Unknown target: ${entry.target}`);
  assert.ok(["accept", "reject"].includes(entry.canonical));
  assert.ok(["round-trip", "reject"].includes(entry.lantern));
  assert.ok(["render", "degraded", "null"].includes(entry.handbook));

  const file = path.resolve(root, entry.file);
  assert.ok(file.startsWith(`${root}${path.sep}`), `Unsafe corpus path: ${entry.file}`);
  assert.ok(fs.statSync(file).isFile(), `Missing corpus file: ${entry.file}`);
  const source = fs.readFileSync(file, "utf8");
  const smolValue = parseToml(source);
  const iarnaValue = IarnaToml.parse(source);
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(smolValue)),
    JSON.parse(JSON.stringify(iarnaValue)),
    `${entry.id}: TOML parsers disagree`,
  );

  const codec = MIST_ENGINE_CODECS[entry.target] as MistDocumentCodec<z.ZodType>;
  const zodResult = codec.schema.safeParse(smolValue);
  const jsonSchemaResult = validators.get(entry.target)!(smolValue);
  assert.equal(
    zodResult.success,
    entry.canonical === "accept",
    `${entry.id}: unexpected canonical decision`,
  );
  assert.equal(
    jsonSchemaResult,
    zodResult.success,
    `${entry.id}: Zod and JSON Schema disagree`,
  );

  if (zodResult.success) {
    const reparsed = codec.parseToml(codec.stringifyToml(zodResult.data));
    assert.deepStrictEqual(reparsed, zodResult.data, `${entry.id}: round-trip lost data`);
  }

  const expectations = coverage.get(entry.target) ?? new Set<string>();
  expectations.add(entry.canonical);
  coverage.set(entry.target, expectations);
}

for (const target of targetKeys) {
  assert.deepStrictEqual(
    coverage.get(target),
    new Set(["accept", "reject"]),
    `${target} needs at least one accepted and one rejected case`,
  );
}

console.log(`Validated ${cases.length} shared contract cases across 14 targets.`);
