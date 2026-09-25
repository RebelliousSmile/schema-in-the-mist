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
async function download(url: string, destination: string): Promise<void> { const response = await fetch(url); assert.ok(response.ok, `candidate download failed: ${response.status}`); fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer())); }
function gh(arguments_: string[]): void { const result = spawnSync("gh", arguments_, { stdio: "inherit", shell: false }); assert.equal(result.status, 0, `gh ${arguments_.join(" ")} failed`); }
function release(tag: string): Record<string, any> | undefined {
  const result = spawnSync("gh", ["api", `repos/RebelliousSmile/schema-in-the-mist/releases/tags/${tag}`], { encoding: "utf8", shell: false });
  if (result.status === 0) return JSON.parse(result.stdout);
  assert.match(result.stderr, /HTTP 404/, `could not query final release: ${result.stderr}`);
  return undefined;
}

const manifest = readReleaseTrainManifest(source);
const evidenceFile = option("--evidence"); assert.ok(evidenceFile, "promotion requires --evidence from release-train:assert");
parseReleaseTrainEvidence(JSON.parse(fs.readFileSync(path.resolve(evidenceFile), "utf8")), manifest);
const archive = option("--archive") ? path.resolve(option("--archive")!) : path.join(fs.mkdtempSync(path.join(os.tmpdir(), "mist-release-promote-")), `schema-in-the-mist-${manifest.candidate.finalTag.slice(1)}.tgz`);
if (!option("--archive")) await download(manifest.candidate.releaseUrl, archive);
assert.equal(sha256(archive), manifest.candidate.sha256, "candidate archive SHA-256 differs from manifest");
const checksum = `${archive}.sha256`; fs.writeFileSync(checksum, `${manifest.candidate.sha256}  ${path.basename(archive)}\n`);
async function verifyPublished(published: Record<string, any>): Promise<void> {
  assert.equal(published.tag_name, manifest.candidate.finalTag, "final release tag differs");
  assert.equal(published.draft, false, "final release is draft"); assert.equal(published.prerelease, false, "final release is prerelease");
  assert.equal(published.immutable, true, "final release is not immutable");
  const name = `schema-in-the-mist-${manifest.candidate.finalTag.slice(1)}.tgz`;
  assert.deepEqual(published.assets.map((asset: { name: string }) => asset.name).sort(), [name, `${name}.sha256`].sort(), "final release assets differ");
  assert.equal(published.assets.find((asset: { name: string }) => asset.name === name)?.digest, `sha256:${manifest.candidate.sha256}`, "published digest differs from candidate");
  const finalUrl = `https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/${manifest.candidate.finalTag}/${name}`;
  const finalArchive = await fetch(finalUrl); assert.ok(finalArchive.ok, `final archive download failed: ${finalArchive.status}`);
  const finalBytes = Buffer.from(await finalArchive.arrayBuffer());
  assert.equal(createHash("sha256").update(finalBytes).digest("hex"), manifest.candidate.sha256, "final archive SHA-256 differs from candidate");
  assert.equal(`sha512-${createHash("sha512").update(finalBytes).digest("base64")}`, manifest.candidate.integrity, "final archive SRI differs from candidate");
  assert.ok(finalBytes.equals(fs.readFileSync(archive)), "candidate and final archive bytes differ");
  const finalChecksum = await fetch(`${finalUrl}.sha256`); assert.ok(finalChecksum.ok, `final checksum download failed: ${finalChecksum.status}`);
  assert.equal(await finalChecksum.text(), `${manifest.candidate.sha256}  ${name}\n`, "published checksum differs from candidate");
}
if (args.includes("--dry-run")) { console.log(`✓ promotion inputs verify for ${manifest.candidate.finalTag}; no release was created`); process.exit(0); }
const ancestry = spawnSync("git", ["merge-base", "--is-ancestor", manifest.candidate.providerCommit, "HEAD"]); assert.equal(ancestry.status, 0, "promotion checkout must contain the manifest provider commit");
const existing = release(manifest.candidate.finalTag);
if (existing) {
  await verifyPublished(existing);
  console.log(`✓ existing immutable ${manifest.candidate.finalTag} matches candidate bytes; no release was changed`);
} else {
  const tag = spawnSync("gh", ["api", `repos/RebelliousSmile/schema-in-the-mist/git/ref/tags/${manifest.candidate.finalTag}`], { encoding: "utf8", shell: false });
  assert.notEqual(tag.status, 0, "final tag already exists without a release");
  assert.match(tag.stderr, /HTTP 404/, `could not query final tag: ${tag.stderr}`);
  gh(["release", "create", manifest.candidate.finalTag, "--target", manifest.candidate.providerCommit, "--draft", "--title", `schema-in-the-mist ${manifest.candidate.finalTag.slice(1)}`]);
  gh(["release", "upload", manifest.candidate.finalTag, archive, checksum]);
  gh(["release", "edit", manifest.candidate.finalTag, "--draft=false"]);
  const published = release(manifest.candidate.finalTag); assert.ok(published, "published final release is missing");
  await verifyPublished(published);
  console.log(`✓ promoted byte-identical ${manifest.candidate.finalTag} without rebuilding`);
}
