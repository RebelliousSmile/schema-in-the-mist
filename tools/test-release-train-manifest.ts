import assert from "node:assert/strict";
import fs from "node:fs";
import { parseReleaseTrainEvidence, parseReleaseTrainManifest } from "./release-train-manifest.js";
import { parseReleaseTrainCompletion } from "./release-train-completion.js";

const valid = JSON.parse(fs.readFileSync("test/fixtures/release-trains/valid.json", "utf8")) as Record<string, unknown>;
const manifest = parseReleaseTrainManifest(valid); assert.equal(manifest.candidate.finalTag, "v1.3.5");
assert.equal(manifest.status, "pending");
for (const mutate of [(value: any) => { value.candidate.providerCommit = "main"; }, (value: any) => { value.candidate.releaseUrl = "file:///tmp/candidate.tgz"; }, (value: any) => { value.command = ["powershell"]; }, (value: any) => { value.candidate.sha256 = "ABC"; }, (value: any) => { value.candidate.integrity = "sha512-not-sri"; }, (value: any) => { value.consumers[0].ref = "main"; }]) { const copy = structuredClone(valid); mutate(copy); assert.throws(() => parseReleaseTrainManifest(copy)); }
const evidence = { protocol: 1, candidate: manifest.candidate, consumers: manifest.consumers.map((consumer) => ({ status: "passed", artifact: { releaseUrl: manifest.candidate.releaseUrl, sha256: manifest.candidate.sha256, integrity: manifest.candidate.integrity }, consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref } })) };
assert.equal(parseReleaseTrainEvidence(evidence, manifest).consumers.length, 2);
for (const mutate of [(value: any) => { value.consumers[0].artifact.sha256 = "f".repeat(64); }, (value: any) => { value.consumers[0].consumer.ref = "f".repeat(40); }, (value: any) => { value.consumers.pop(); }]) { const copy = structuredClone(evidence); mutate(copy); assert.throws(() => parseReleaseTrainEvidence(copy, manifest)); }
const completed = structuredClone(valid) as any;
completed.status = "completed";
completed.final = {
  releaseUrl: "https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/v1.3.5/schema-in-the-mist-1.3.5.tgz",
  sha256: completed.candidate.sha256,
  integrity: completed.candidate.integrity,
  consumers: completed.consumers.map((consumer: any) => ({ role: consumer.role, repository: consumer.repository, ref: consumer.ref })),
};
const completedManifest = parseReleaseTrainManifest(completed);
const completion = {
  protocol: 2,
  candidateEvidence: evidence,
  final: { releaseUrl: completed.final.releaseUrl, sha256: completed.final.sha256, integrity: completed.final.integrity },
  consumers: completed.final.consumers.map((consumer: any) => ({ status: "passed", consumer, artifact: { releaseUrl: completed.final.releaseUrl, sha256: completed.final.sha256, integrity: completed.final.integrity, version: "1.3.5" }, checks: ["frozen-install", consumer.role === "lantern" ? "mist-vite-assets" : "obsidian-plugin-load"] })),
};
assert.equal(parseReleaseTrainCompletion(completion, completedManifest).consumers.length, 2);
for (const mutate of [
  (value: any) => { value.final.releaseUrl = manifest.candidate.releaseUrl; },
  (value: any) => { value.final.integrity = "sha512-" + "B".repeat(86) + "=="; },
  (value: any) => { value.final.consumers.pop(); },
  (value: any) => { value.final.consumers[0].role = "handbook"; },
  (value: any) => { value.final.consumers[0].ref = "main"; },
]) { const copy = structuredClone(completed); mutate(copy); assert.throws(() => parseReleaseTrainManifest(copy)); }
for (const mutate of [
  (value: any) => { value.consumers[0].artifact.releaseUrl = manifest.candidate.releaseUrl; },
  (value: any) => { value.consumers[0].artifact.version = "1.3.4"; },
  (value: any) => { value.consumers[0].artifact.integrity = "wrong"; },
  (value: any) => { value.consumers[0].consumer.ref = "f".repeat(40); },
  (value: any) => { value.consumers[0].checks = ["frozen-install"]; },
  (value: any) => { value.consumers.pop(); },
  (value: any) => { value.candidateEvidence.consumers.pop(); },
]) { const copy = structuredClone(completion); mutate(copy); assert.throws(() => parseReleaseTrainCompletion(copy, completedManifest)); }
assert.throws(() => parseReleaseTrainCompletion(completion, manifest), /not complete/);
console.log("✓ release-train manifest and evidence fixtures passed.");
