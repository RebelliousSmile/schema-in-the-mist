import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseReleaseTrainEvidence, readReleaseTrainManifest } from "./release-train-manifest.js";

const args = process.argv.slice(2).filter((value) => value !== "--");
const source = args.find((value) => !value.startsWith("--"));
assert.ok(source, "release-train promotion requires one manifest path");
function option(name: string): string | undefined { const index = args.indexOf(name); if (index < 0) return undefined; const value = args[index + 1]; assert.ok(value && !value.startsWith("--"), `${name} requires a value`); return value; }
function sha256(file: string): string { return createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
async function download(url: string, destination: string): Promise<void> { const response = await fetch(url, { redirect: "error" }); assert.ok(response.ok, `candidate download failed: ${response.status}`); fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer())); }
function gh(arguments_: string[]): void { const result = spawnSync("gh", arguments_, { stdio: "inherit", shell: false }); assert.equal(result.status, 0, `gh ${arguments_.join(" ")} failed`); }

const manifest = readReleaseTrainManifest(source);
const evidenceFile = option("--evidence"); assert.ok(evidenceFile, "promotion requires --evidence from release-train:assert");
parseReleaseTrainEvidence(JSON.parse(fs.readFileSync(path.resolve(evidenceFile), "utf8")), manifest);
const archive = option("--archive") ? path.resolve(option("--archive")!) : path.join(fs.mkdtempSync(path.join(os.tmpdir(), "mist-release-promote-")), `schema-in-the-mist-${manifest.candidate.finalTag.slice(1)}.tgz`);
if (!option("--archive")) await download(manifest.candidate.releaseUrl, archive);
assert.equal(sha256(archive), manifest.candidate.sha256, "candidate archive SHA-256 differs from manifest");
const checksum = `${archive}.sha256`; fs.writeFileSync(checksum, `${manifest.candidate.sha256}  ${path.basename(archive)}\n`);
if (args.includes("--dry-run")) { console.log(`✓ promotion inputs verify for ${manifest.candidate.finalTag}; no release was created`); process.exit(0); }
const head = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }); assert.equal(head.stdout.trim(), manifest.candidate.providerCommit, "promotion must run at the manifest provider commit");
gh(["release", "create", manifest.candidate.finalTag, "--target", manifest.candidate.providerCommit, "--draft", "--title", `schema-in-the-mist ${manifest.candidate.finalTag.slice(1)}`]);
gh(["release", "upload", manifest.candidate.finalTag, archive, checksum]);
gh(["release", "edit", manifest.candidate.finalTag, "--draft=false"]);
console.log(`✓ promoted byte-identical ${manifest.candidate.finalTag} without rebuilding`);
