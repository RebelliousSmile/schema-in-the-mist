import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Ajv, type AnySchema } from "ajv";
import addFormatsModule from "ajv-formats/dist/index.js";
import IarnaToml from "@iarna/toml";
import { parse as parseToml } from "smol-toml";
import {
  MIST_ENGINE_CODECS,
  OTHERSCAPE_CHARACTER_PAGES,
  SESSION_NOTES_CAPACITY,
  TARGETS,
  type MistDocumentCodec,
  type MistEngineDocumentTarget,
  type OtherscapeCharacterPage,
} from "../src/index.js";
import { OtherscapeCharacterSchema } from "../src/zod/otherscape/character.js";
import type { z } from "zod";

type ContractCase = {
  id: string;
  target: MistEngineDocumentTarget;
  file: string;
  canonical: "accept" | "reject";
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
/* ajv-formats publishes CommonJS runtime with a default-plugin declaration. */
const addFormats = addFormatsModule as unknown as (instance: Ajv) => void;
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

/* The pages of the character sheet: published by presentation.ts, checked against the schema. */
{
  const shape = OtherscapeCharacterSchema.shape as Record<string, unknown>;
  const pages = OTHERSCAPE_CHARACTER_PAGES as readonly OtherscapeCharacterPage[];
  assert.ok(pages.length > 0, "The character sheet declares no page");
  assert.equal(new Set(pages.map((page) => page.id)).size, pages.length, "Duplicate page id");
  const notesPages = pages.filter((page) => page.notes_field !== undefined);
  assert.equal(notesPages.length, 1, "Exactly one notes page is expected");
  assert.equal(pages[pages.length - 1], notesPages[0], "The notes page must be the last one");
  const printed = new Set<string>();
  for (const page of pages) {
    assert.ok(/^[a-z0-9-]+$/.test(page.id), `Page id ${page.id} must be a lowercase slug`);
    assert.ok(page.label.fr && page.label.en, `Page ${page.id} needs a French and an English label`);
    assert.ok(
      (page.fields === undefined) !== (page.notes_field === undefined),
      `Page ${page.id} prints fields or is the notes page, never both`,
    );
    for (const field of page.fields ?? []) {
      assert.ok(field in shape, `Page ${page.id} prints an unknown field: ${field}`);
      assert.ok(!printed.has(field), `Field ${field} is printed on two pages`);
      printed.add(field);
    }
  }
  const notesField = notesPages[0]!.notes_field!;
  assert.ok(notesField in shape, `The notes field ${notesField} is not in the schema`);
  for (const field of Object.keys(shape)) {
    if (field === "meta" || field === notesField) continue;
    assert.ok(printed.has(field), `Field ${field} is printed on no page`);
  }
  const published = validators.get("otherscape/character");
  assert.ok(published, "The character target is not compiled");
  const characterSchema = JSON.parse(
    fs.readFileSync("schemas/v1/otherscape/character.schema.json", "utf8"),
  ) as { properties: Record<string, { maxLength?: number }> };
  assert.equal(
    characterSchema.properties[notesField]?.maxLength,
    SESSION_NOTES_CAPACITY,
    "The published capacity differs from SESSION_NOTES_CAPACITY",
  );
  const overCapacity = parseToml(
    fs.readFileSync(
      path.join(root, "invalid/otherscape--character-session-notes-over-capacity.toml"),
      "utf8",
    ),
  ) as Record<string, unknown>;
  assert.equal(
    String(overCapacity[notesField]).length,
    SESSION_NOTES_CAPACITY + 1,
    "The refused notes must be one character over the capacity",
  );
}

console.log(`Validated ${cases.length} shared contract cases across ${TARGETS.length} targets.`);
