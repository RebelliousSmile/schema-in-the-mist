import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { TARGETS } from "../src/zod/constants.js";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this validator through npm so npm_execpath is available");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mist-package-"));
// One fifth of the 2,692,910-byte package audited on 2026-09-20.
const MAX_ARCHIVE_BYTES = 538_582;
/* Otherscape stands outside the two-face contract: one OFL face per role of its books (handbook/README.md). */
const OTHERSCAPE_FACES = [
  "handbook/otherscape/assets/styles/fonts/fira-sans-extra-condensed-latin-800-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/sofia-sans-semi-condensed-latin-400-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/sofia-sans-semi-condensed-latin-400-italic.woff2",
  "handbook/otherscape/assets/styles/fonts/sofia-sans-semi-condensed-latin-700-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/familjen-grotesk-latin-500-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/space-mono-latin-400-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/barlow-condensed-latin-300-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/ibm-plex-sans-condensed-400-normal.woff2",
  "handbook/otherscape/assets/styles/fonts/ibm-plex-sans-condensed-400-italic.woff2",
  "handbook/otherscape/assets/styles/fonts/ibm-plex-sans-condensed-700-normal.woff2",
];
/* The audited budget already carried the title face (the first one); the faces the books' roles added on
   2026-11-08 are WOFF2, which gzip cannot shrink, so the ceiling grows by their exact size and nothing else. */
const ARCHIVE_CEILING = MAX_ARCHIVE_BYTES + OTHERSCAPE_FACES.slice(1).reduce((total, file) => total + fs.statSync(file).size, 0);

function run(command: string, args: string[], cwd = process.cwd()): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed: ${result.error?.message ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  }
  return result.stdout;
}

try {
  let archive = process.argv[2] ? path.resolve(process.argv[2]) : "";
  let files: Array<{ path: string }> = [];
  if (!archive) {
    const packed = JSON.parse(
      run(process.execPath, [npmCli, "pack", "--json", "--pack-destination", temporary]),
    ) as Array<{ filename: string; files: Array<{ path: string }> }>;
    archive = path.join(temporary, packed[0]!.filename);
    files = packed[0]!.files;
  }
  assert.ok(fs.statSync(archive).size <= ARCHIVE_CEILING, `package archive exceeds ${ARCHIVE_CEILING} bytes`);

  if (files.length > 0) {
    const paths = files.map(({ path: file }) => file);
    assert.ok(paths.some((file) => file === "dist/index.js"));
    assert.ok(paths.some((file) => file === "corpus/contract/cases.json"));
    assert.ok(paths.some((file) => file === "cross-tool-provider.json"));
    for (const file of [
      "handbook/README.md",
      "schemas/appearance/game-pack.schema.json",
      "handbook/city-of-mist/pack.json",
      "handbook/city-of-mist/assets/styles/city-of-mist.css",
      "handbook/legend-in-the-mist/pack.json",
      "LICENSES/CODE-LICENSE.md",
      "LICENSES/DOCS-LICENSE.md",
      "handbook/legend-in-the-mist/assets/theme-card.webp",
      "handbook/city-of-mist/assets/styles/fonts/im-fell-english-latin-400-normal.woff2",
      "handbook/city-of-mist/assets/styles/fonts/averia-serif-libre-latin-700-normal.woff2",
      "handbook/legend-in-the-mist/assets/styles/fonts/im-fell-english-latin-400-normal.woff2",
      "handbook/legend-in-the-mist/assets/styles/fonts/averia-serif-libre-latin-700-normal.woff2",
      "handbook/otherscape/pack.json",
      "handbook/otherscape/assets/styles/otherscape.css",
      ...OTHERSCAPE_FACES,
    ]) {
      assert.ok(paths.some((path) => path === file), `missing packaged ${file}`);
    }
    assert.equal(paths.filter((file) => file.endsWith(".schema.json") && file.startsWith("schemas/v1/")).length, TARGETS.length);
    assert.ok(paths.every((file) => !file.startsWith("tools/") && !file.startsWith("handbook-packs/") && !/\.png$|\.ttf$/i.test(file)));
    assert.ok(
      paths.every((file) => !file.endsWith(".woff2") || OTHERSCAPE_FACES.includes(file) || !/(?:labrada|fira-sans-extra-condensed|courier-prime|pt-serif|roboto|bebas-neue|caveat)/i.test(file)),
      "packaged Handbook fonts must use the two-face OFL contract, Otherscape's declared faces aside",
    );
    assert.deepEqual(
      paths.filter((file) => file.startsWith("handbook/otherscape/") && file.endsWith(".woff2")).sort(),
      [...OTHERSCAPE_FACES].sort(),
      "Otherscape must publish exactly its declared faces",
    );
  }

  const consumer = path.join(temporary, "consumer");
  fs.mkdirSync(consumer);
  fs.writeFileSync(
    path.join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run(
    process.execPath,
    [npmCli, "install", archive, "--ignore-scripts", "--no-audit", "--no-fund"],
    consumer,
  );

  const assertion = `
    import fs from "node:fs";
    import { CONTRACT_VERSION, MIST_ENGINE_CODECS, MIST_SOURCE_CONVERSION_CODECS } from "schema-in-the-mist";
    if (CONTRACT_VERSION !== 1 || Object.keys(MIST_ENGINE_CODECS).length !== ${TARGETS.length}) throw new Error("public API");
    if (Object.keys(MIST_SOURCE_CONVERSION_CODECS).length !== 6) throw new Error("source conversion public API");
    const readJson = (subpath) => JSON.parse(fs.readFileSync(new URL(import.meta.resolve("schema-in-the-mist/" + subpath)), "utf8"));
    readJson("schemas/v1/city-of-mist/danger.schema.json");
    const appearance = readJson("schemas/appearance/game-pack.schema.json");
    if (!appearance.properties.assets.properties.resources) throw new Error("published font resource contract");
    readJson("corpus/contract/cases.json");
    const provider = readJson("cross-tool-provider.json");
    if (provider.contractVersion !== CONTRACT_VERSION) throw new Error("provider contract version");
    for (const manifest of [
      "handbook/city-of-mist/pack.json",
      "handbook/legend-in-the-mist/pack.json",
      "handbook/otherscape/pack.json",
    ]) readJson(manifest);
    for (const asset of [
      "handbook/city-of-mist/assets/styles/city-of-mist.css",
      "handbook/legend-in-the-mist/assets/theme-card.webp",
      "handbook/otherscape/assets/styles/otherscape.css",
      "handbook/city-of-mist/assets/styles/fonts/im-fell-english-latin-400-normal.woff2",
      "handbook/city-of-mist/assets/styles/fonts/averia-serif-libre-latin-700-normal.woff2",
      "handbook/legend-in-the-mist/assets/styles/fonts/im-fell-english-latin-400-normal.woff2",
      "handbook/legend-in-the-mist/assets/styles/fonts/averia-serif-libre-latin-700-normal.woff2",
      ${OTHERSCAPE_FACES.map((file) => JSON.stringify(file)).join(", ")},
    ]) fs.statSync(new URL(import.meta.resolve("schema-in-the-mist/" + asset)));
    try {
      await import("schema-in-the-mist/dist/zod/constants.js");
      throw new Error("internal path was exported");
    } catch (error) {
      if (error?.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error;
    }
  `;
  run(process.execPath, ["--input-type=module", "--eval", assertion], consumer);
  console.log(`Package consumer validation passed for ${path.basename(archive)}.`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
