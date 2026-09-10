import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

const EXPECTED_REPOSITORY = "RebelliousSmile/schema-in-the-mist";
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CAPABILITY = /^(?:block|style):[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROOT_FIELDS = new Set(["manifestVersion", "repository", "name", "description", "author", "packs"]);
const ENTRY_FIELDS = new Set(["id", "version", "path", "label", "description"]);
const MANIFEST_FIELDS = new Set(["manifestVersion", "version", "minimumHandbookVersion", "requires", "variants", "defaultVariantId", "pack"]);
const VARIANT_FIELDS = new Set(["id", "label", "style", "polarities"]);

type RecordValue = Record<string, unknown>;

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function record(value: unknown, file: string, field: string): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(file, `${field} must be an object`);
  return value as RecordValue;
}

function text(value: unknown, file: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) fail(file, `${field} must be a non-empty string`);
  return value;
}

function fields(value: RecordValue, allowed: Set<string>, file: string, field: string): void {
  const unknown = Object.keys(value).filter((name) => !allowed.has(name));
  if (unknown.length > 0) fail(file, `${field} has unknown fields: ${unknown.join(", ")}`);
}

function safeRelative(value: unknown, file: string, field: string): string {
  const raw = text(value, file, field);
  const clean = raw.replace(/\\/g, "/");
  if (clean.startsWith("/") || /^[A-Za-z]:/.test(clean) || clean.split("/").some((part) => part === "" || part === "." || part === "..")) {
    fail(file, `${field} must be a safe relative path`);
  }
  return clean;
}

function semver(value: unknown, file: string, field: string): string {
  const result = text(value, file, field);
  const match = SEMVER.exec(result);
  if (!match || [match[1], match[2], match[3]].some((part) => !Number.isSafeInteger(Number(part))) || match[4]?.split(".").some((part) => /^0\d+$/.test(part))) {
    fail(file, `${field} is not valid SemVer`);
  }
  return result;
}

function uniqueStrings(value: unknown, file: string, field: string, pattern?: RegExp): string[] {
  if (!Array.isArray(value)) fail(file, `${field} must be an array`);
  const values = value.map((entry, index) => text(entry, file, `${field}[${index}]`));
  if (new Set(values).size !== values.length) fail(file, `${field} must contain unique values`);
  if (pattern && values.some((entry) => !pattern.test(entry))) fail(file, `${field} contains an invalid value`);
  return values;
}

function json(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(file, `cannot be read as JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function listFiles(root: string, base = root): string[] {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(child, base) : [path.relative(base, child).replace(/\\/g, "/")];
  });
}

const schemaFile = "schemas/appearance/game-pack.schema.json";
const validatePack = new Ajv({ allErrors: true, strict: false }).compile(json(schemaFile));
const catalogueFile = "handbook.json";
const catalogue = record(json(catalogueFile), catalogueFile, "root");
fields(catalogue, ROOT_FIELDS, catalogueFile, "root");
if (catalogue.manifestVersion !== 1) fail(catalogueFile, `unsupported manifestVersion ${String(catalogue.manifestVersion)}`);
if (text(catalogue.repository, catalogueFile, "repository") !== EXPECTED_REPOSITORY) fail(catalogueFile, `repository must be ${EXPECTED_REPOSITORY}`);
if (!Array.isArray(catalogue.packs) || catalogue.packs.length === 0) fail(catalogueFile, "packs must be a non-empty array");

const ids = new Set<string>();
const manifestPaths = new Set<string>();
for (let index = 0; index < catalogue.packs.length; index++) {
  const entryField = `packs[${index}]`;
  const entry = record(catalogue.packs[index], catalogueFile, entryField);
  fields(entry, ENTRY_FIELDS, catalogueFile, entryField);
  const id = text(entry.id, catalogueFile, `${entryField}.id`);
  if (!ID.test(id)) fail(catalogueFile, `${entryField}.id is invalid`);
  const version = semver(entry.version, catalogueFile, `${entryField}.version`);
  const manifestFile = safeRelative(entry.path, catalogueFile, `${entryField}.path`);
  if (ids.has(id)) fail(catalogueFile, `${entryField}.id duplicates ${id}`);
  if (manifestPaths.has(manifestFile)) fail(catalogueFile, `${entryField}.path duplicates ${manifestFile}`);
  ids.add(id);
  manifestPaths.add(manifestFile);
  if (!fs.existsSync(manifestFile)) fail(catalogueFile, `${entryField}.path does not exist: ${manifestFile}`);

  const manifest = record(json(manifestFile), manifestFile, "root");
  fields(manifest, MANIFEST_FIELDS, manifestFile, "root");
  if (manifest.manifestVersion !== 1) fail(manifestFile, `unsupported manifestVersion ${String(manifest.manifestVersion)}`);
  if (semver(manifest.version, manifestFile, "version") !== version) fail(manifestFile, `version does not match ${catalogueFile}`);
  semver(manifest.minimumHandbookVersion, manifestFile, "minimumHandbookVersion");
  uniqueStrings(manifest.requires, manifestFile, "requires", CAPABILITY);

  const pack = record(manifest.pack, manifestFile, "pack");
  if (!validatePack(pack)) fail(manifestFile, `pack fails ${schemaFile}: ${JSON.stringify(validatePack.errors)}`);
  if (pack.id !== id) fail(manifestFile, `pack.id does not match ${catalogueFile}`);

  const variants: RecordValue[] = [];
  if (manifest.variants !== undefined) {
    if (!Array.isArray(manifest.variants)) fail(manifestFile, "variants must be an array");
    const variantIds = new Set<string>();
    for (let variantIndex = 0; variantIndex < manifest.variants.length; variantIndex++) {
      const field = `variants[${variantIndex}]`;
      const variant = record(manifest.variants[variantIndex], manifestFile, field);
      fields(variant, VARIANT_FIELDS, manifestFile, field);
      const variantId = text(variant.id, manifestFile, `${field}.id`);
      if (!ID.test(variantId) || variantIds.has(variantId)) fail(manifestFile, `${field}.id is invalid or duplicated`);
      variantIds.add(variantId);
      text(variant.label, manifestFile, `${field}.label`);
      const polarities = uniqueStrings(variant.polarities, manifestFile, `${field}.polarities`);
      if (polarities.length === 0 || polarities.some((polarity) => polarity !== "light" && polarity !== "dark")) fail(manifestFile, `${field}.polarities is invalid`);
      const variantPack = { id: variantId, label: variant.label, style: variant.style };
      if (!validatePack(variantPack)) fail(manifestFile, `${field} style is invalid: ${JSON.stringify(validatePack.errors)}`);
      variants.push(variant);
    }
  }
  if (manifest.defaultVariantId !== undefined && (typeof manifest.defaultVariantId !== "string" || !variants.some((variant) => variant.id === manifest.defaultVariantId))) {
    fail(manifestFile, "defaultVariantId does not name a declared variant");
  }

  const assets = pack.assets === undefined ? {} : record(pack.assets, manifestFile, "pack.assets");
  const assetRoot = safeRelative(assets.root ?? "assets", manifestFile, "pack.assets.root");
  const manifestDir = path.dirname(manifestFile);
  const root = path.resolve(manifestDir, assetRoot);
  const declared = new Set<string>();
  const images = assets.images === undefined ? {} : record(assets.images, manifestFile, "pack.assets.images");
  for (const [role, value] of Object.entries(images)) declared.add(safeRelative(value, manifestFile, `pack.assets.images.${role}`));
  const fonts = assets.fonts === undefined ? {} : record(assets.fonts, manifestFile, "pack.assets.fonts");
  for (const [family, value] of Object.entries(fonts)) {
    const file = typeof value === "string" ? value : record(value, manifestFile, `pack.assets.fonts.${family}`).file;
    declared.add(safeRelative(file, manifestFile, `pack.assets.fonts.${family}.file`));
  }
  for (const asset of declared) {
    const resolved = path.resolve(root, asset);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) fail(manifestFile, `asset escapes its root: ${asset}`);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) fail(manifestFile, `declared asset does not exist: ${asset}`);
  }
  for (const asset of listFiles(root)) if (!declared.has(asset)) fail(manifestFile, `asset is not declared: ${asset}`);
}

for (const required of ["handbook/README.md", "handbook/LICENSES/SonOfOak.LICENSE.txt", "handbook/LICENSES/PragRoman.LICENSE.txt"]) {
  if (!fs.existsSync(required)) fail(required, "required Handbook documentation is missing");
}

console.log(`✓ ${catalogue.packs.length} Handbook packs and their declared assets are valid.`);
