import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mist-release-train-promotion-test-"));
const archive = path.join(temporary, "schema-in-the-mist-1.3.5.tgz");
const bytes = Buffer.from("immutable candidate fixture\n");
fs.writeFileSync(archive, bytes);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
const candidate = {
  packageName: "schema-in-the-mist",
  releaseUrl: "https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/v1.3.5-rc.1/schema-in-the-mist-1.3.5.tgz",
  sha256,
  integrity,
  stagingTag: "v1.3.5-rc.1",
  finalTag: "v1.3.5",
  providerCommit: "0123456789abcdef0123456789abcdef01234567",
};
const consumers = [
  { role: "lantern", repository: "RebelliousSmile/lantern", ref: "1111111111111111111111111111111111111111", path: "lantern", proof: { interface: "npm-run-release-train-assert", manifest: "release-train/schema-in-the-mist.json" } },
  { role: "handbook", repository: "RebelliousSmile/obsidian-handbook", ref: "2222222222222222222222222222222222222222", path: "handbook", proof: { interface: "npm-run-release-train-assert", manifest: "release-train/schema-in-the-mist.json" } },
];
const manifest = path.join(temporary, "v1.3.5.json");
const evidence = path.join(temporary, "provenance.json");
fs.writeFileSync(manifest, JSON.stringify({ candidate, consumers }));
fs.writeFileSync(evidence, JSON.stringify({ protocol: 1, candidate, consumers: consumers.map((consumer) => ({ status: "passed", artifact: { releaseUrl: candidate.releaseUrl, sha256, integrity }, consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref } })) }));
function promote(evidencePath = evidence, archivePath = archive) {
  return spawnSync(process.execPath, [path.resolve("node_modules/tsx/dist/cli.mjs"), "tools/release-train-promote.ts", manifest, "--evidence", evidencePath, "--archive", archivePath, "--dry-run"], { encoding: "utf8", cwd: process.cwd() });
}
try {
  const passed = promote(); assert.equal(passed.status, 0, passed.stderr); assert.match(passed.stdout, /no release was created/);
  fs.writeFileSync(archive, Buffer.from("altered candidate fixture\n"));
  const altered = promote(); assert.notEqual(altered.status, 0, "promotion accepted altered candidate bytes");
  fs.writeFileSync(archive, bytes);
  const forgedEvidence = path.join(temporary, "forged.json");
  fs.writeFileSync(forgedEvidence, JSON.stringify({ protocol: 1, candidate, consumers: [{ status: "passed", artifact: { releaseUrl: candidate.releaseUrl, sha256: "f".repeat(64), integrity }, consumer: { role: "lantern", repository: "RebelliousSmile/lantern", ref: consumers[0].ref } }, ...JSON.parse(fs.readFileSync(evidence, "utf8")).consumers.slice(1)] }));
  const forged = promote(forgedEvidence); assert.notEqual(forged.status, 0, "promotion accepted forged consumer evidence");
  console.log("✓ release-train promotion dry-run rejects altered bytes and forged evidence.");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
