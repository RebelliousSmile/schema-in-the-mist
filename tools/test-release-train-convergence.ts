import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { verifyArchiveBytes } from "./release-train-converge.js";
import { parseReleaseTrainManifest } from "./release-train-manifest.js";

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
console.log("✓ release-train convergence rejects changed candidate and final bytes.");
