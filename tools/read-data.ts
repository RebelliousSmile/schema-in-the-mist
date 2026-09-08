import fs from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";

/**
 * Reading data files, shared by the two validation passes.
 *
 * Both `validate-examples.ts` and `validate-references.ts` walk the same
 * corpus; the reading lives here so the second pass does not restate it.
 */

export function isJson(p: string) {
  return p.toLowerCase().endsWith(".json");
}

export function isToml(p: string) {
  return p.toLowerCase().endsWith(".toml");
}

export function isDataFile(p: string) {
  return isJson(p) || isToml(p);
}

export function loadData(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf8");
  if (isJson(filePath)) return JSON.parse(raw);
  if (isToml(filePath)) return TOML.parse(raw);
  throw new Error(`Unsupported file type: ${filePath}`);
}

/**
 * Files of one example directory.
 *
 * Flat on purpose: a file dropped in a subdirectory is not read, here as in
 * the first pass.
 */
export function listDataFiles(baseDir: string): string[] {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir)
    .map((name) => path.join(baseDir, name))
    .filter((p) => fs.statSync(p).isFile())
    .filter(isDataFile);
}

/**
 * One file per logical example, for a pass that reads *content* rather than
 * re-checking every serialization of it.
 *
 * Every example in this repository ships as a `.toml` source and a `.json`
 * derivative `tools/toml2json.ts` produces from it — same document, same
 * basename, two files. `validate-examples.ts` rightly checks both, since a
 * broken derivative is its own bug; a pass that compares examples against
 * *each other* (identity uniqueness, cross-file references) would otherwise
 * see every example as its own duplicate. `.toml` wins when both exist,
 * because it is the source.
 */
export function listCanonicalDataFiles(baseDir: string): string[] {
  const byStem = new Map<string, string>();
  for (const file of listDataFiles(baseDir)) {
    const stem = file.slice(0, -path.extname(file).length);
    if (isToml(file) || !byStem.has(stem)) {
      byStem.set(stem, file);
    }
  }
  return [...byStem.values()];
}
