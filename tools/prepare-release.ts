import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run release preparation through npm so npm_execpath is available");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  version: string;
};
const tag = process.argv[2] ?? `v${packageJson.version}`;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mist-release-"));

function run(args: string[]): string {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(
      `npm ${args.join(" ")} failed: ${result.error?.message ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  }
  return result.stdout;
}

try {
  run(["run", "check"]);
  run(["run", "validate:version", "--", tag]);
  const destinations = [path.join(temporary, "first"), path.join(temporary, "second")];
  destinations.forEach((directory) => fs.mkdirSync(directory));
  const packs = destinations.map((directory) =>
    (JSON.parse(run(["pack", "--json", "--pack-destination", directory])) as Array<{
      filename: string;
      shasum: string;
      files: Array<{ path: string; size: number; mode: number }>;
    }>)[0]!,
  );
  if (
    packs[0].shasum !== packs[1].shasum ||
    JSON.stringify(packs[0].files) !== JSON.stringify(packs[1].files)
  ) {
    throw new Error("Two package preparations from the same tree are not reproducible");
  }

  const filename = `schema-in-the-mist-${packageJson.version}.tgz`;
  const source = path.join(destinations[1], packs[1].filename);
  fs.copyFileSync(source, filename);
  const digest = createHash("sha256").update(fs.readFileSync(filename)).digest("hex");
  fs.writeFileSync(`${filename}.sha256`, `${digest}  ${filename}\n`);
  console.log(`${filename}\n${digest}`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
