import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this validator through npm so npm_execpath is available");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mist-package-"));

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
      "handbook/legend-in-the-mist/assets/fonts/pragroman.ttf",
      "handbook/otherscape/pack.json",
      "handbook/otherscape/assets/styles/otherscape.css",
    ]) {
      assert.ok(paths.some((path) => path === file), `missing packaged ${file}`);
    }
    assert.equal(paths.filter((file) => file.endsWith(".schema.json") && file.startsWith("schemas/v1/")).length, 14);
    assert.ok(paths.every((file) => !file.startsWith("tools/") && !file.startsWith("handbook-packs/")));
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
    if (CONTRACT_VERSION !== 1 || Object.keys(MIST_ENGINE_CODECS).length !== 14) throw new Error("public API");
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
      "handbook/legend-in-the-mist/assets/fonts/pragroman.ttf",
      "handbook/otherscape/assets/styles/otherscape.css",
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
