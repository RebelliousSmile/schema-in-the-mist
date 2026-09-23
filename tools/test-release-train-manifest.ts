import assert from "node:assert/strict";
import fs from "node:fs";
import { parseReleaseTrainEvidence, parseReleaseTrainManifest } from "./release-train-manifest.js";

const valid = JSON.parse(fs.readFileSync("test/fixtures/release-trains/valid.json", "utf8")) as Record<string, unknown>;
const manifest = parseReleaseTrainManifest(valid); assert.equal(manifest.candidate.finalTag, "v1.3.5");
for (const mutate of [(value: any) => { value.candidate.providerCommit = "main"; }, (value: any) => { value.candidate.releaseUrl = "file:///tmp/candidate.tgz"; }, (value: any) => { value.command = ["powershell"]; }, (value: any) => { value.candidate.sha256 = "ABC"; }, (value: any) => { value.candidate.integrity = "sha512-not-sri"; }, (value: any) => { value.consumers[0].ref = "main"; }]) { const copy = structuredClone(valid); mutate(copy); assert.throws(() => parseReleaseTrainManifest(copy)); }
const evidence = { protocol: 1, candidate: manifest.candidate, consumers: manifest.consumers.map((consumer) => ({ status: "passed", artifact: { releaseUrl: manifest.candidate.releaseUrl, sha256: manifest.candidate.sha256, integrity: manifest.candidate.integrity }, consumer: { role: consumer.role, repository: consumer.repository, ref: consumer.ref } })) };
assert.equal(parseReleaseTrainEvidence(evidence, manifest).consumers.length, 2);
for (const mutate of [(value: any) => { value.consumers[0].artifact.sha256 = "f".repeat(64); }, (value: any) => { value.consumers[0].consumer.ref = "f".repeat(40); }, (value: any) => { value.consumers.pop(); }]) { const copy = structuredClone(evidence); mutate(copy); assert.throws(() => parseReleaseTrainEvidence(copy, manifest)); }
console.log("✓ release-train manifest and evidence fixtures passed.");
