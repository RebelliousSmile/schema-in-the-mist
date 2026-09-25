import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { verifyArchiveBytes } from "./release-train-converge.js";
import { parseReleaseTrainCompletion, readReleaseTrainCompletion } from "./release-train-completion.js";
import { parseReleaseTrainManifest, readReleaseTrainManifest } from "./release-train-manifest.js";

const bytes = Buffer.from("published final archive fixture\n");
const sha256 = createHash("sha256").update(bytes).digest("hex");
const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
const source = JSON.parse(fs.readFileSync("test/fixtures/release-trains/valid.json", "utf8"));
source.status = "completed";
source.candidate.sha256 = sha256;
source.candidate.integrity = integrity;
source.final = {
  releaseUrl: "https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/v1.3.5/schema-in-the-mist-1.3.5.tgz",
  sha256,
  integrity,
  consumers: source.consumers.map(({ role, repository, ref }: { role: string; repository: string; ref: string }) => ({ role, repository, ref })),
};
const manifest = parseReleaseTrainManifest(source);
verifyArchiveBytes(bytes, bytes, manifest);
assert.throws(() => verifyArchiveBytes(bytes, Buffer.from("changed final archive\n"), manifest), /final archive SHA-256/);
assert.throws(() => verifyArchiveBytes(Buffer.from("changed candidate archive\n"), bytes, manifest), /candidate archive SHA-256/);

const committed = readReleaseTrainManifest("release-trains/v1.3.5.json");
const completion = JSON.parse(fs.readFileSync("release-trains/v1.3.5.convergence.json", "utf8"));
assert.equal(readReleaseTrainCompletion("release-trains/v1.3.5.convergence.json", committed).consumers.length, 2);
assert.throws(() => readReleaseTrainCompletion("release-trains/v1.3.5.missing.json", committed), /ENOENT/);
const pending = parseReleaseTrainManifest({ status: "pending", candidate: committed.candidate, consumers: committed.consumers });
assert.throws(() => parseReleaseTrainCompletion(completion, pending), /not complete/);
const changedRef = structuredClone(completion);
changedRef.consumers[0].consumer.ref = "f".repeat(40);
assert.throws(() => parseReleaseTrainCompletion(changedRef, committed), /commit differs/);
console.log("✓ committed release-train convergence and failure paths passed.");
