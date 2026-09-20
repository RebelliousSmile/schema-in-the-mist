import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Provider = {
  providerVersion?: unknown;
  packManifest?: unknown;
  commands?: { validatePack?: unknown };
};

const root = process.cwd();
const provider = JSON.parse(fs.readFileSync(path.join(root, "cross-tool-provider.json"), "utf8")) as Provider;
assert.equal(provider.providerVersion, 1, "unsupported cross-tool provider");
const command = provider.commands?.validatePack;
assert.ok(Array.isArray(command) && command.every((part) => typeof part === "string"), "missing validatePack command");

/* The descriptor owns the layout: reading it here keeps this loop and the cross-tool matrix on the same paths. */
const declared = provider.packManifest;
assert.ok(typeof declared === "string", "provider declares no packManifest");
const [directory, manifestName, ...rest] = declared.split("/*/");
assert.ok(directory && manifestName && rest.length === 0, `packManifest must read <directory>/*/<file>: ${declared}`);

let validated = 0;
for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifest = path.join(directory, entry.name, manifestName);
  if (!fs.existsSync(path.join(root, manifest))) continue;
  execFileSync(command[0], [...command.slice(1), manifest], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  validated += 1;
}

/* A run that matched no manifest proves nothing, so it must not exit green. */
assert.ok(validated > 0, `packManifest ${declared} matched no manifest`);
console.log(`✓ ${validated} pack manifest${validated === 1 ? "" : "s"} validated.`);
