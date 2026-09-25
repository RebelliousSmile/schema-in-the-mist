import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseReleaseTrainEvidence, type ReleaseTrainManifest } from "./release-train-manifest.js";

type RecordValue = Record<string, unknown>;

function object(value: unknown, label: string): RecordValue {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value as RecordValue;
}

function keys(value: RecordValue, expected: string[], label: string): void {
  assert.deepEqual(Object.keys(value).sort(), expected.sort(), `${label} has unexpected or missing fields`);
}

export function parseReleaseTrainCompletion(value: unknown, manifest: ReleaseTrainManifest) {
  assert.equal(manifest.status, "completed", "release train is not complete");
  assert.ok(manifest.final, "completed release train has no final identity");
  const root = object(value, "completion evidence");
  keys(root, ["protocol", "candidateEvidence", "final", "consumers"], "completion evidence");
  assert.equal(root.protocol, 2, "completion evidence.protocol must be 2");
  const candidateEvidence = parseReleaseTrainEvidence(root.candidateEvidence, manifest);
  assert.deepEqual(root.final, { releaseUrl: manifest.final.releaseUrl, sha256: manifest.final.sha256, integrity: manifest.final.integrity }, "completion evidence names another final archive");
  assert.ok(Array.isArray(root.consumers), "completion evidence.consumers must be an array");
  assert.equal(root.consumers.length, manifest.final.consumers.length, "completion evidence must include both consumers");
  const seen = new Set<string>();
  for (const [index, raw] of root.consumers.entries()) {
    const evidence = object(raw, `completion evidence.consumers[${index}]`);
    keys(evidence, ["status", "artifact", "consumer", "checks"], `completion evidence.consumers[${index}]`);
    assert.equal(evidence.status, "passed", "final consumer proof did not pass");
    const consumer = object(evidence.consumer, "final consumer identity"); keys(consumer, ["role", "repository", "ref"], "final consumer identity");
    const expected: NonNullable<ReleaseTrainManifest["final"]>["consumers"][number] | undefined = manifest.final.consumers.find(({ role }) => role === consumer.role);
    assert.ok(expected, "final consumer role is unknown"); assert.deepEqual(consumer, expected, "final consumer commit differs from manifest");
    assert.ok(!seen.has(expected.role), "final consumer role is duplicated"); seen.add(expected.role);
    const artifact = object(evidence.artifact, "final consumer artifact"); keys(artifact, ["releaseUrl", "sha256", "integrity", "version"], "final consumer artifact");
    assert.deepEqual(artifact, { ...(root.final as RecordValue), version: manifest.candidate.finalTag.slice(1) }, "final consumer names another archive, channel, version, or SRI");
    assert.ok(Array.isArray(evidence.checks) && evidence.checks.length > 0 && evidence.checks.every((check) => typeof check === "string" && check.length > 0), "final consumer checks are missing");
    const required = expected.role === "lantern" ? "mist-vite-assets" : "obsidian-plugin-load";
    assert.ok(evidence.checks.includes(required), `${expected.role} final proof lacks ${required}`);
  }
  return { protocol: 2 as const, candidateEvidence, final: manifest.final, consumers: root.consumers };
}

export function readReleaseTrainCompletion(file: string, manifest: ReleaseTrainManifest) {
  return parseReleaseTrainCompletion(JSON.parse(fs.readFileSync(path.resolve(file), "utf8")), manifest);
}
