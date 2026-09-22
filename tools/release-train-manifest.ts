import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export type ReleaseTrainManifest = {
  version: 1;
  provider: { commit: string; finalTag: string; archiveUrl: string; sha256: string; integrity: string };
  consumers: { lantern: { commit: string }; handbook: { commit: string } };
};

const commit = /^[0-9a-f]{40}$/;
const digest = /^[0-9a-f]{64}$/;
const tag = /^v(\d+)\.(\d+)\.(\d+)$/;
const expectedKeys = ["version", "provider", "consumers"];

function record(value: unknown, name: string): Record<string, unknown> {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value), `${name} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: string[], name: string): void {
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), `${name} has unexpected or missing fields`);
}

function string(value: unknown, name: string): string {
  assert.equal(typeof value, "string", `${name} must be a string`);
  return value as string;
}

export function parseReleaseTrainManifest(value: unknown): ReleaseTrainManifest {
  const root = record(value, "manifest");
  exactKeys(root, expectedKeys, "manifest");
  assert.equal(root.version, 1, "manifest.version must be 1");
  const provider = record(root.provider, "provider");
  exactKeys(provider, ["commit", "finalTag", "archiveUrl", "sha256", "integrity"], "provider");
  const consumers = record(root.consumers, "consumers");
  exactKeys(consumers, ["lantern", "handbook"], "consumers");
  const lantern = record(consumers.lantern, "consumers.lantern");
  const handbook = record(consumers.handbook, "consumers.handbook");
  exactKeys(lantern, ["commit"], "consumers.lantern");
  exactKeys(handbook, ["commit"], "consumers.handbook");
  const providerCommit = string(provider.commit, "provider.commit");
  const finalTag = string(provider.finalTag, "provider.finalTag");
  const archiveUrl = string(provider.archiveUrl, "provider.archiveUrl");
  const sha256 = string(provider.sha256, "provider.sha256");
  const integrity = string(provider.integrity, "provider.integrity");
  const lanternCommit = string(lantern.commit, "consumers.lantern.commit");
  const handbookCommit = string(handbook.commit, "consumers.handbook.commit");
  assert.match(providerCommit, commit, "provider.commit must be a lowercase full commit");
  assert.match(lanternCommit, commit, "Lantern commit must be a lowercase full commit");
  assert.match(handbookCommit, commit, "Handbook commit must be a lowercase full commit");
  assert.match(sha256, digest, "provider.sha256 must be a lowercase SHA-256");
  assert.match(integrity, /^sha512-[A-Za-z0-9+/]{86}==$/, "provider.integrity must be a SHA-512 SRI");
  const match = finalTag.match(tag);
  assert.ok(match, "provider.finalTag must be vX.Y.Z");
  const filename = `schema-in-the-mist-${match[1]}.${match[2]}.${match[3]}.tgz`;
  const url = new URL(archiveUrl);
  assert.equal(url.protocol, "https:", "provider.archiveUrl must use HTTPS");
  assert.equal(url.hostname, "github.com", "provider.archiveUrl must use github.com");
  assert.match(url.pathname, new RegExp(`^/RebelliousSmile/schema-in-the-mist/releases/download/[^/]+/${filename}$`), "provider.archiveUrl must name this repository's final-version release asset");
  return { version: 1, provider: { commit: providerCommit, finalTag, archiveUrl, sha256, integrity }, consumers: { lantern: { commit: lanternCommit }, handbook: { commit: handbookCommit } } };
}

export function readReleaseTrainManifest(file: string): ReleaseTrainManifest {
  return parseReleaseTrainManifest(JSON.parse(fs.readFileSync(path.resolve(file), "utf8")));
}
