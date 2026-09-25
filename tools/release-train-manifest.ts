import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export const RELEASE_TRAIN_PROOF_INTERFACE = "npm-run-release-train-assert" as const;
export type ReleaseTrainConsumerRole = "lantern" | "handbook";

export type ReleaseTrainManifest = {
  status: "pending" | "completed";
  candidate: { packageName: "schema-in-the-mist"; releaseUrl: string; sha256: string; integrity: string; stagingTag: string; finalTag: string; providerCommit: string };
  consumers: Array<{ role: ReleaseTrainConsumerRole; repository: string; ref: string; path: string; proof: { interface: typeof RELEASE_TRAIN_PROOF_INTERFACE; manifest: string } }>;
  final?: { releaseUrl: string; sha256: string; integrity: string; consumers: Array<{ role: ReleaseTrainConsumerRole; repository: string; ref: string }> };
};
export type ReleaseTrainEvidence = { protocol: 1; candidate: ReleaseTrainManifest["candidate"]; consumers: Array<{ status: "passed"; artifact: { releaseUrl: string; sha256: string; integrity: string; version?: string }; consumer: { role: ReleaseTrainConsumerRole; repository: string; ref: string } }> };

const commit = /^[0-9a-f]{40}$/;
const digest = /^[0-9a-f]{64}$/;
const finalTag = /^v(\d+)\.(\d+)\.(\d+)$/;
const stagingTag = /^v(\d+)\.(\d+)\.(\d+)-rc\.\d+$/;
const roles: ReleaseTrainConsumerRole[] = ["lantern", "handbook"];
const repositories: Record<ReleaseTrainConsumerRole, string> = { lantern: "RebelliousSmile/lantern", handbook: "RebelliousSmile/obsidian-handbook" };

function record(value: unknown, name: string): Record<string, unknown> { assert.ok(value !== null && typeof value === "object" && !Array.isArray(value), `${name} must be an object`); return value as Record<string, unknown>; }
function exactKeys(value: Record<string, unknown>, keys: string[], name: string): void { assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${name} has unexpected or missing fields`); }
function string(value: unknown, name: string): string { assert.equal(typeof value, "string", `${name} must be a string`); return value as string; }
function tagVersion(value: string, expression: RegExp, name: string): string { const match = expression.exec(value); assert.ok(match, `${name} is not a valid release tag`); return `${match[1]}.${match[2]}.${match[3]}`; }

export function parseReleaseTrainManifest(value: unknown): ReleaseTrainManifest {
  const root = record(value, "manifest"); assert.ok(root.status === "pending" || root.status === "completed", "manifest.status must be pending or completed"); exactKeys(root, root.status === "pending" ? ["status", "candidate", "consumers"] : ["status", "candidate", "consumers", "final"], "manifest");
  const candidate = record(root.candidate, "candidate"); exactKeys(candidate, ["packageName", "releaseUrl", "sha256", "integrity", "stagingTag", "finalTag", "providerCommit"], "candidate");
  assert.equal(candidate.packageName, "schema-in-the-mist", "candidate.packageName must be schema-in-the-mist");
  const releaseUrl = string(candidate.releaseUrl, "candidate.releaseUrl"); const sha256 = string(candidate.sha256, "candidate.sha256"); const integrity = string(candidate.integrity, "candidate.integrity"); const staged = string(candidate.stagingTag, "candidate.stagingTag"); const final = string(candidate.finalTag, "candidate.finalTag"); const providerCommit = string(candidate.providerCommit, "candidate.providerCommit");
  assert.match(sha256, digest, "candidate.sha256 must be a lowercase SHA-256"); assert.match(integrity, /^sha512-[A-Za-z0-9+/]{86}==$/, "candidate.integrity must be SHA-512 SRI"); assert.match(providerCommit, commit, "candidate.providerCommit must be a lowercase full commit");
  const version = tagVersion(final, finalTag, "candidate.finalTag"); assert.equal(tagVersion(staged, stagingTag, "candidate.stagingTag"), version, "candidate tags must name one final version");
  const url = new URL(releaseUrl); assert.equal(url.protocol, "https:", "candidate.releaseUrl must use HTTPS"); assert.equal(url.hostname, "github.com", "candidate.releaseUrl must use github.com"); assert.equal(url.pathname, `/RebelliousSmile/schema-in-the-mist/releases/download/${staged}/schema-in-the-mist-${version}.tgz`, "candidate.releaseUrl must name the staged final-version archive"); assert.equal(url.search, "", "candidate.releaseUrl must not contain a query string"); assert.equal(url.hash, "", "candidate.releaseUrl must not contain a fragment");
  assert.ok(Array.isArray(root.consumers), "consumers must be an array"); assert.equal(root.consumers.length, roles.length, "consumers must name Lantern and Handbook exactly once");
  const consumers = root.consumers.map((source, index) => {
    const consumer = record(source, `consumers[${index}]`); exactKeys(consumer, ["role", "repository", "ref", "path", "proof"], `consumers[${index}]`);
    const role = string(consumer.role, `consumers[${index}].role`) as ReleaseTrainConsumerRole; assert.ok(roles.includes(role), `consumers[${index}].role must be lantern or handbook`);
    const repository = string(consumer.repository, `consumers[${index}].repository`); assert.equal(repository, repositories[role], `consumers[${index}] must name canonical ${role} repository`);
    const ref = string(consumer.ref, `consumers[${index}].ref`); assert.match(ref, commit, `consumers[${index}].ref must be a full commit SHA`);
    const consumerPath = string(consumer.path, `consumers[${index}].path`); assert.match(consumerPath, /^[a-z][a-z0-9-]*$/, `consumers[${index}].path must be a safe workspace name`);
    const proof = record(consumer.proof, `consumers[${index}].proof`); exactKeys(proof, ["interface", "manifest"], `consumers[${index}].proof`); assert.equal(proof.interface, RELEASE_TRAIN_PROOF_INTERFACE, `consumers[${index}] uses an unsupported proof interface`);
    const manifest = string(proof.manifest, `consumers[${index}].proof.manifest`); assert.match(manifest, /^[a-z][a-z0-9.-]*(?:\/[a-z][a-z0-9.-]*)*\.json$/, `consumers[${index}].proof.manifest must be a safe JSON path`);
    return { role, repository, ref, path: consumerPath, proof: { interface: RELEASE_TRAIN_PROOF_INTERFACE, manifest } };
  });
  assert.deepEqual(consumers.map(({ role }) => role).sort(), [...roles].sort(), "consumers must name Lantern and Handbook exactly once"); assert.equal(new Set(consumers.map(({ path: consumerPath }) => consumerPath)).size, consumers.length, "consumer paths must be distinct");
  const result: ReleaseTrainManifest = { status: root.status, candidate: { packageName: "schema-in-the-mist", releaseUrl, sha256, integrity, stagingTag: staged, finalTag: final, providerCommit }, consumers };
  if (root.status === "completed") {
    const published = record(root.final, "final"); exactKeys(published, ["releaseUrl", "sha256", "integrity", "consumers"], "final");
    const finalUrl = string(published.releaseUrl, "final.releaseUrl");
    assert.equal(finalUrl, `https://github.com/RebelliousSmile/schema-in-the-mist/releases/download/${final}/schema-in-the-mist-${version}.tgz`, "final.releaseUrl must be the canonical final archive");
    assert.equal(published.sha256, sha256, "final.sha256 differs from candidate"); assert.equal(published.integrity, integrity, "final.integrity differs from candidate");
    assert.ok(Array.isArray(published.consumers), "final.consumers must be an array"); assert.equal(published.consumers.length, roles.length, "final.consumers must name both consumers");
    const finalConsumers = published.consumers.map((raw, index) => {
      const identity = record(raw, `final.consumers[${index}]`); exactKeys(identity, ["role", "repository", "ref"], `final.consumers[${index}]`);
      const role = string(identity.role, `final.consumers[${index}].role`) as ReleaseTrainConsumerRole;
      assert.ok(roles.includes(role), `final.consumers[${index}].role is unknown`);
      const repository = string(identity.repository, `final.consumers[${index}].repository`); assert.equal(repository, repositories[role], `final.consumers[${index}].repository is not canonical`);
      const ref = string(identity.ref, `final.consumers[${index}].ref`); assert.match(ref, commit, `final.consumers[${index}].ref must be a full commit SHA`);
      return { role, repository, ref };
    });
    assert.deepEqual(finalConsumers.map(({ role }) => role).sort(), [...roles].sort(), "final.consumers must name Lantern and Handbook exactly once");
    result.final = { releaseUrl: finalUrl, sha256, integrity, consumers: finalConsumers };
  }
  return result;
}
export function readReleaseTrainManifest(file: string): ReleaseTrainManifest { return parseReleaseTrainManifest(JSON.parse(fs.readFileSync(path.resolve(file), "utf8"))); }

export function parseReleaseTrainEvidence(value: unknown, manifest: ReleaseTrainManifest): ReleaseTrainEvidence {
  const root = record(value, "release-train evidence"); exactKeys(root, ["protocol", "candidate", "consumers"], "release-train evidence"); assert.equal(root.protocol, 1, "release-train evidence.protocol must be 1"); assert.deepEqual(root.candidate, manifest.candidate, "release-train evidence candidate differs from manifest"); assert.ok(Array.isArray(root.consumers), "release-train evidence.consumers must be an array"); assert.equal(root.consumers.length, manifest.consumers.length, "release-train evidence must include both consumers");
  const consumers = root.consumers.map((raw, index) => {
    const evidence = record(raw, `evidence.consumers[${index}]`); exactKeys(evidence, ["status", "artifact", "consumer"], `evidence.consumers[${index}]`); assert.equal(evidence.status, "passed", `evidence.consumers[${index}] did not pass`);
    const artifact = record(evidence.artifact, `evidence.consumers[${index}].artifact`); const artifactKeys = Object.keys(artifact).sort(); assert.ok(JSON.stringify(artifactKeys) === JSON.stringify(["integrity", "releaseUrl", "sha256"]) || JSON.stringify(artifactKeys) === JSON.stringify(["integrity", "releaseUrl", "sha256", "version"]), `evidence.consumers[${index}].artifact has unexpected fields`);
    assert.equal(artifact.releaseUrl, manifest.candidate.releaseUrl, `evidence.consumers[${index}] names another release URL`); assert.equal(artifact.sha256, manifest.candidate.sha256, `evidence.consumers[${index}] names another SHA-256`); assert.equal(artifact.integrity, manifest.candidate.integrity, `evidence.consumers[${index}] names another integrity`); if (artifact.version !== undefined) assert.equal(artifact.version, manifest.candidate.finalTag.slice(1), `evidence.consumers[${index}] names another package version`);
    const consumer = record(evidence.consumer, `evidence.consumers[${index}].consumer`); exactKeys(consumer, ["role", "repository", "ref"], `evidence.consumers[${index}].consumer`); const expected = manifest.consumers.find((item) => item.role === consumer.role); assert.ok(expected, `evidence.consumers[${index}] names an unknown consumer`); assert.equal(consumer.repository, expected.repository, `evidence.consumers[${index}] names another repository`); assert.equal(consumer.ref, expected.ref, `evidence.consumers[${index}] names another consumer commit`);
    return { status: "passed" as const, artifact: { releaseUrl: manifest.candidate.releaseUrl, sha256: manifest.candidate.sha256, integrity: manifest.candidate.integrity, ...(artifact.version === undefined ? {} : { version: manifest.candidate.finalTag.slice(1) }) }, consumer: { role: expected.role, repository: expected.repository, ref: expected.ref } };
  });
  assert.deepEqual(consumers.map(({ consumer }) => consumer.role).sort(), [...roles].sort(), "release-train evidence must name Lantern and Handbook exactly once"); return { protocol: 1, candidate: manifest.candidate, consumers };
}
