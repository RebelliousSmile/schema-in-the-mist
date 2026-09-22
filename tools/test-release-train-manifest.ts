import assert from "node:assert/strict";
import fs from "node:fs";
import { parseReleaseTrainManifest } from "./release-train-manifest.js";

const valid = JSON.parse(fs.readFileSync("test/fixtures/release-trains/valid.json", "utf8")) as Record<string, unknown>;
assert.equal(parseReleaseTrainManifest(valid).provider.finalTag, "v1.3.5");
for (const mutate of [
  (value: any) => { value.provider.commit = "main"; },
  (value: any) => { value.provider.archiveUrl = "file:///tmp/candidate.tgz"; },
  (value: any) => { value.command = ["powershell"]; },
  (value: any) => { value.provider.sha256 = "ABC"; },
  (value: any) => { value.provider.integrity = "sha512-not-sri"; },
]) {
  const copy = structuredClone(valid);
  mutate(copy);
  assert.throws(() => parseReleaseTrainManifest(copy));
}
console.log("✓ release-train manifest fixtures passed.");
