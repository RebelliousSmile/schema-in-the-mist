import fs from "node:fs";
import path from "node:path";
import { Ajv, type AnySchema } from "ajv";
import { requireAccessibleNoteTokens, requireCompleteLinkStateFamilies, resolveNoteTokens } from "./require-contrast.js";

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

/* Generic families and the system faces a pack may name without publishing them. */
const UNPUBLISHED_FAMILIES = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy", "math", "emoji", "fangsong",
  "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded",
  "-apple-system", "blinkmacsystemfont", "segoe ui", "helvetica neue", "helvetica", "arial", "arial narrow", "courier new", "courier",
  "inherit", "initial", "unset", "revert",
]);
/* The one exception to the two-face OFL contract, recorded with its reason in handbook/README.md. */
const TWO_FACE_EXCEPTIONS: Record<string, RegExp> = { otherscape: /fira\s+sans\s+extra\s+condensed/gi };
const FONT_TOKEN = /^--(?:font-[a-z-]*-theme|[a-z0-9-]*-font)$/;

function familyNames(value: string): string[] {
  if (/var\(/i.test(value)) return [];
  return value.split(",").map((name) => name.trim().replace(/^(['"])(.*)\1$/, "$2").trim().toLowerCase()).filter(Boolean);
}

function namedFamilies(style: unknown): string[] {
  const names: string[] = [];
  const layers = optionalRecord(style) ?? {};
  for (const layer of Object.values(layers)) {
    for (const part of Object.values(optionalRecord(layer) ?? {})) {
      for (const [token, value] of Object.entries(optionalRecord(part) ?? {})) {
        if (FONT_TOKEN.test(token) && typeof value === "string") names.push(...familyNames(value));
      }
    }
  }
  return names;
}

function optionalRecord(value: unknown): RecordValue | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : undefined;
}

function noteTokens(style: unknown, polarity?: string): RecordValue | undefined {
  const styleRecord = optionalRecord(style);
  const layer = polarity === undefined ? styleRecord?.base : styleRecord?.[polarity];
  return optionalRecord(optionalRecord(layer)?.note);
}

function validateResolvedContrast(pack: RecordValue, manifestFile: string, variant?: RecordValue): void {
  const polarities = variant === undefined
    ? uniqueStrings(pack.polarities ?? [], manifestFile, "pack.polarities")
    : uniqueStrings(variant.polarities, manifestFile, `variant ${String(variant.id)}.polarities`);
  const base = noteTokens(pack.style);
  const variantId = variant === undefined ? undefined : String(variant.id);
  for (const polarity of polarities) {
    const variantLayer = variant === undefined ? undefined : noteTokens(variant.style, polarity);
    if (variantLayer) requireCompleteLinkStateFamilies(resolveNoteTokens(variantLayer), `${manifestFile} variant ${variantId} ${polarity}`);
    const resolved = resolveNoteTokens(base, noteTokens(pack.style, polarity), variantLayer);
    requireAccessibleNoteTokens(resolved, `${manifestFile}${variantId === undefined ? "" : ` variant ${variantId}`} ${polarity}`);
  }
}

const schemaFile = "schemas/appearance/game-pack.schema.json";
const validatePack = new Ajv({ allErrors: true, strict: false }).compile(
  json(schemaFile) as AnySchema,
);
/* Cross-tool callers append the manifest after npm’s own "--" separator; pnpm forwards that separator too. */
const argument = process.argv.slice(2).find((value) => value !== "--");
const requested = argument === undefined ? undefined : argument.split("\\").join("/");
const catalogueFile = "handbook.json";
const catalogue = record(json(catalogueFile), catalogueFile, "root");
fields(catalogue, ROOT_FIELDS, catalogueFile, "root");
if (catalogue.manifestVersion !== 1) fail(catalogueFile, `unsupported manifestVersion ${String(catalogue.manifestVersion)}`);
if (text(catalogue.repository, catalogueFile, "repository") !== EXPECTED_REPOSITORY) fail(catalogueFile, `repository must be ${EXPECTED_REPOSITORY}`);
if (!Array.isArray(catalogue.packs) || catalogue.packs.length === 0) fail(catalogueFile, "packs must be a non-empty array");

const ids = new Set<string>();
const manifestPaths = new Set<string>();
let validated = 0;
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
  /* Cross-tool callers hand one manifest at a time; the catalogue-wide checks above still run for every entry. */
  if (requested !== undefined && manifestFile !== requested) continue;
  validated += 1;

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
  validateResolvedContrast(pack, manifestFile);
  for (const variant of variants) validateResolvedContrast(pack, manifestFile, variant);

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
  const resources = assets.resources === undefined ? [] : uniqueStrings(assets.resources, manifestFile, "pack.assets.resources");
  for (let index = 0; index < resources.length; index++) {
    const resource = safeRelative(resources[index], manifestFile, `pack.assets.resources[${index}]`);
    if (!/\.(?:woff2?|ttf|otf)$/i.test(resource)) fail(manifestFile, `stylesheet resource is not a supported font file: ${resource}`);
    declared.add(resource);
  }
  const published = new Set<string>();
  const named = new Map<string, string>();
  for (const family of namedFamilies(pack.style)) named.set(family, "pack.style");
  for (const variant of variants) for (const family of namedFamilies(variant.style)) named.set(family, `variant ${String(variant.id)}`);
  if (assets.stylesheets !== undefined) {
    const stylesheets = uniqueStrings(assets.stylesheets, manifestFile, "pack.assets.stylesheets");
    for (let index = 0; index < stylesheets.length; index++) {
      const stylesheet = safeRelative(stylesheets[index], manifestFile, `pack.assets.stylesheets[${index}]`);
      declared.add(stylesheet);
      const stylesheetPath = path.resolve(root, stylesheet);
      if (!fs.existsSync(stylesheetPath)) fail(manifestFile, `declared stylesheet does not exist: ${stylesheet}`);
      const css = fs.readFileSync(stylesheetPath, "utf8");
      const exception = TWO_FACE_EXCEPTIONS[id];
      const contractCss = exception === undefined ? css : css.replace(exception, "");
      if (/\b(?:labrada|fira\s+sans(?:\s+extra\s+condensed)?|courier\s+prime|pt\s+serif|roboto(?:\s+condensed)?|bebas\s+neue|caveat|barlow(?:\s+condensed)?|ibm\s+plex\s+mono)\b/i.test(contractCss)) {
        fail(manifestFile, `stylesheet refers to a font family that is not published by the two-face OFL contract: ${stylesheet}`);
      }
      for (const face of css.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
        const family = /font-family\s*:\s*([^;]+);/i.exec(face[1]);
        if (family) for (const name of familyNames(family[1])) published.add(name);
      }
      for (const rule of css.replace(/@font-face\s*\{[^}]*\}/gi, "").matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
        for (const name of familyNames(rule[1])) named.set(name, stylesheet);
      }
      for (const match of css.matchAll(/url\(\s*(['"]?)([^'"\s)]+)\1\s*\)/gi)) {
        const url = match[2];
        if (/^(?:[a-z][a-z0-9+.-]*:|\/|\\|\/\/)/i.test(url)) fail(manifestFile, `stylesheet has unsafe URL: ${url}`);
        const relative = path.posix.join(path.posix.dirname(stylesheet), url);
        if (!declared.has(relative)) {
          fail(manifestFile, `stylesheet URL is not a declared asset: ${relative}`);
        }
      }
    }
  }
  /* A family the pack names must be one it publishes, or one every reader already has. */
  for (const [family, where] of named) {
    if (!published.has(family) && !UNPUBLISHED_FAMILIES.has(family)) {
      fail(manifestFile, `${where} names the font family "${family}", which no published @font-face declares`);
    }
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

/* A manifest nobody in the catalogue declares must not pass as a green run. */
if (requested !== undefined && validated === 0) fail(catalogueFile, `no catalogue entry declares ${requested}`);
console.log(validated === 1 ? `✓ 1 Handbook pack and its declared assets are valid.` : `✓ ${validated} Handbook packs and their declared assets are valid.`);
