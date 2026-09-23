import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseReleaseTrainEvidence, readReleaseTrainManifest } from "./release-train-manifest.js";

const root = process.cwd();
const args = process.argv.slice(2).filter((value) => value !== "--");
const source = args.find((value) => !value.startsWith("--"));
assert.ok(source, "release-train assertion requires one manifest path");
function option(name: string): string | undefined { const index = args.indexOf(name); if (index < 0) return undefined; const value = args[index + 1]; assert.ok(value && !value.startsWith("--"), `${name} requires a value`); return value; }
function run(command: string, commandArgs: string[], cwd: string): void { const result = spawnSync(command, commandArgs, { cwd, encoding: "utf8", stdio: "inherit", shell: process.platform === "win32" }); assert.equal(result.status, 0, `${command} ${commandArgs.join(" ")} failed`); }
function hash(file: string, algorithm: "sha256" | "sha512"): string { return createHash(algorithm).update(fs.readFileSync(file)).digest(algorithm === "sha256" ? "hex" : "base64"); }
async function download(url: string, destination: string): Promise<void> { const response = await fetch(url); assert.ok(response.ok, `candidate download failed: ${response.status}`); fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer())); }
function checkout(repository: string, ref: string, target: string): void { run("git", ["init", "--quiet"], target); run("git", ["remote", "add", "origin", `https://github.com/${repository}.git`], target); run("git", ["fetch", "--depth", "1", "origin", ref], target); run("git", ["checkout", "--force", "--detach", ref], target); const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: target, encoding: "utf8" }); assert.equal(result.stdout.trim(), ref, `${repository} checkout differs from declared commit`); }
function installFrozen(consumerRoot: string): void { assert.ok(fs.existsSync(path.join(consumerRoot, "pnpm-lock.yaml")), `consumer at ${consumerRoot} has no pnpm lockfile`); run("pnpm", ["install", "--frozen-lockfile"], consumerRoot); }

const manifest = readReleaseTrainManifest(source);
const workspace = path.resolve(option("--workspace") ?? fs.mkdtempSync(path.join(os.tmpdir(), "mist-release-train-")));
const output = path.resolve(option("--output") ?? path.join(workspace, "release-train.provenance.json"));
const suppliedArchive = option("--archive");
fs.mkdirSync(workspace, { recursive: true });
const archive = suppliedArchive ? path.resolve(suppliedArchive) : path.join(workspace, `schema-in-the-mist-${manifest.candidate.finalTag.slice(1)}.tgz`);
if (!suppliedArchive) await download(manifest.candidate.releaseUrl, archive);
assert.ok(fs.statSync(archive).isFile(), `candidate archive is missing: ${archive}`);
assert.equal(hash(archive, "sha256"), manifest.candidate.sha256, "candidate archive SHA-256 differs from manifest");
assert.equal(`sha512-${hash(archive, "sha512")}`, manifest.candidate.integrity, "candidate archive integrity differs from manifest");
run("npm", ["run", "validate:package", "--", archive], root);
const evidence = [];
for (const consumer of manifest.consumers) {
  const consumerRoot = path.join(workspace, consumer.path); fs.mkdirSync(consumerRoot, { recursive: true }); checkout(consumer.repository, consumer.ref, consumerRoot); installFrozen(consumerRoot);
  const consumerManifest = path.join(consumerRoot, consumer.proof.manifest); fs.mkdirSync(path.dirname(consumerManifest), { recursive: true });
  fs.writeFileSync(consumerManifest, `${JSON.stringify({ candidate: { packageName: manifest.candidate.packageName, releaseUrl: manifest.candidate.releaseUrl, finalTag: manifest.candidate.finalTag, sha256: manifest.candidate.sha256, integrity: manifest.candidate.integrity }, consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref } }, null, 2)}\n`);
  run("npm", ["run", "release-train:assert", "--", consumer.proof.manifest], consumerRoot);
  const evidencePath = `${consumerManifest}.evidence.json`; assert.ok(fs.existsSync(evidencePath), `${consumer.role} proof wrote no machine-readable evidence`);
  evidence.push(JSON.parse(fs.readFileSync(evidencePath, "utf8")));
}
const provenance = parseReleaseTrainEvidence({ protocol: 1, candidate: manifest.candidate, consumers: evidence }, manifest);
fs.writeFileSync(output, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(`✓ release-train proof written to ${output}`);
