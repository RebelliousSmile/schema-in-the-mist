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
    import { createRequire } from "node:module";
    import { CONTRACT_VERSION, MIST_ENGINE_CODECS } from "schema-in-the-mist";
    if (CONTRACT_VERSION !== 1 || Object.keys(MIST_ENGINE_CODECS).length !== 14) throw new Error("public API");
    const require = createRequire(import.meta.url);
    JSON.parse(fs.readFileSync(require.resolve("schema-in-the-mist/schemas/v1/city-of-mist/danger.schema.json"), "utf8"));
    JSON.parse(fs.readFileSync(require.resolve("schema-in-the-mist/corpus/contract/cases.json"), "utf8"));
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
