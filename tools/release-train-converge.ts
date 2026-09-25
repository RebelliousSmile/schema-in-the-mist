import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseReleaseTrainCompletion } from "./release-train-completion.js";
import { parseReleaseTrainEvidence, readReleaseTrainManifest, type ReleaseTrainManifest } from "./release-train-manifest.js";

type FinalIdentity = NonNullable<ReleaseTrainManifest["final"]>;

function hash(bytes: Buffer, algorithm: "sha256" | "sha512"): string {
  return createHash(algorithm).update(bytes).digest(algorithm === "sha256" ? "hex" : "base64");
}

export function verifyArchiveBytes(candidate: Buffer, final: Buffer, manifest: ReleaseTrainManifest): void {
  assert.ok(manifest.final, "release train has no final artifact");
  assert.equal(hash(candidate, "sha256"), manifest.candidate.sha256, "candidate archive SHA-256 differs from manifest");
  assert.equal(`sha512-${hash(candidate, "sha512")}`, manifest.candidate.integrity, "candidate archive SRI differs from manifest");
  assert.equal(hash(final, "sha256"), manifest.final.sha256, "final archive SHA-256 differs from candidate");
  assert.equal(`sha512-${hash(final, "sha512")}`, manifest.final.integrity, "final archive SRI differs from candidate");
  assert.ok(candidate.equals(final), "candidate and final archive bytes differ");
}

function run(command: string, args: string[], cwd: string): string {
  const executable = process.platform === "win32" && command === "gh" ? "gh.exe" : command;
  const result = spawnSync(executable, args, { cwd, encoding: "utf8", stdio: "pipe", shell: process.platform === "win32" && ["npm", "pnpm"].includes(command) });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed: ${result.error || result.stderr || result.stdout}`);
  return result.stdout.trim();
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  assert.ok(response.ok, `${url} download failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function verifyReleaseMetadata(manifest: ReleaseTrainManifest, final: FinalIdentity): void {
  const response = JSON.parse(run("gh", ["api", `repos/RebelliousSmile/schema-in-the-mist/releases/tags/${manifest.candidate.finalTag}`], process.cwd()));
  assert.equal(response.tag_name, manifest.candidate.finalTag, "final release tag differs");
  assert.equal(response.draft, false, "final release is a draft");
  assert.equal(response.prerelease, false, "final release is a prerelease");
  assert.equal(response.immutable, true, "final release is not immutable");
  const archiveName = `schema-in-the-mist-${manifest.candidate.finalTag.slice(1)}.tgz`;
  const assets = response.assets as Array<{ name: string; digest: string }>;
  assert.deepEqual(assets.map(({ name }) => name).sort(), [archiveName, `${archiveName}.sha256`].sort(), "final release asset set differs");
  assert.equal(assets.find(({ name }) => name === archiveName)?.digest, `sha256:${final.sha256}`, "GitHub final archive digest differs");
}

function checkout(repository: string, ref: string, target: string, localSource?: string): void {
  fs.mkdirSync(target, { recursive: true });
  if (localSource) {
    assert.equal(run("git", ["rev-parse", "HEAD"], localSource), ref, `${repository} local HEAD differs from declared SHA`);
    const origin = run("git", ["remote", "get-url", "origin"], localSource);
    assert.ok(origin === `https://github.com/${repository}.git` || origin === `git@github.com:${repository}.git`, `${repository} local origin differs`);
  }
  run("git", ["init", "--quiet"], target);
  run("git", ["remote", "add", "origin", localSource ?? `https://github.com/${repository}.git`], target);
  run("git", ["fetch", "--depth", "1", "origin", ref], target);
  run("git", ["checkout", "--force", "--detach", ref], target);
  assert.equal(run("git", ["rev-parse", "HEAD"], target), ref, `${repository} checkout differs from declared final SHA`);
}

function normalizeEvidence(raw: unknown, identity: FinalIdentity["consumers"][number], final: FinalIdentity, version: string) {
  assert.ok(raw && typeof raw === "object" && !Array.isArray(raw), "consumer evidence must be an object");
  const evidence = raw as Record<string, unknown>;
  assert.deepEqual(Object.keys(evidence).sort(), ["protocol", "status", "artifact", "consumer", "lock", "journey"].sort(), "consumer evidence envelope differs");
  assert.equal(evidence.protocol, 2, "consumer evidence protocol differs");
  assert.equal(evidence.status, "passed", "consumer proof did not pass");
  assert.deepEqual(evidence.consumer, identity, "consumer evidence commit differs");
  const artifact = { releaseUrl: final.releaseUrl, sha256: final.sha256, integrity: final.integrity, version };
  assert.deepEqual(evidence.artifact, artifact, "consumer evidence artifact differs");
  const lock = evidence.lock as Record<string, unknown>;
  assert.ok(lock && typeof lock === "object", "consumer lock evidence is missing");
  assert.equal(lock.file, "pnpm-lock.yaml", "consumer did not verify the active pnpm lockfile");
  assert.equal(lock.releaseUrl, final.releaseUrl, "consumer lockfile URL differs");
  assert.equal(lock.integrity, final.integrity, "consumer lockfile SRI differs");
  const journey = evidence.journey as Record<string, unknown>;
  assert.ok(journey && typeof journey === "object", "consumer journey evidence is missing");
  assert.equal(journey.status, "passed", "consumer production journey did not pass");
  assert.equal(typeof journey.id, "string", "consumer journey id is missing");
  assert.ok(Array.isArray(journey.checks), "consumer journey checks are missing");
  return { status: "passed", artifact, consumer: identity, checks: journey.checks };
}

function disposeWorkspace(workspace: string): void {
  const relative = path.relative(os.tmpdir(), workspace);
  assert.ok(relative && relative !== ".." && !relative.startsWith(`..${path.sep}`), "convergence workspace is outside the temporary directory");
  fs.rmSync(workspace, { recursive: true, force: true });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((value) => value !== "--");
  const source = args[0]; assert.ok(source && !source.startsWith("--"), "convergence requires a committed manifest path");
  function option(name: string): string | undefined { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; }
  const candidatePath = option("--candidate-evidence"); assert.ok(candidatePath, "convergence requires --candidate-evidence");
  const localLantern = option("--local-lantern"); const localHandbook = option("--local-handbook");
  assert.equal(Boolean(localLantern), Boolean(localHandbook), "local preflight requires both consumer sources");
  const manifest = readReleaseTrainManifest(source);
  assert.equal(manifest.status, "completed", "convergence requires a completed manifest with both final SHAs");
  assert.ok(manifest.final, "completed manifest has no final artifact");
  const candidateEvidence = parseReleaseTrainEvidence(JSON.parse(fs.readFileSync(path.resolve(candidatePath), "utf8")), manifest);
  verifyReleaseMetadata(manifest, manifest.final);
  const [candidateBytes, finalBytes, checksumBytes] = await Promise.all([
    download(manifest.candidate.releaseUrl), download(manifest.final.releaseUrl), download(`${manifest.final.releaseUrl}.sha256`),
  ]);
  verifyArchiveBytes(candidateBytes, finalBytes, manifest);
  assert.equal(checksumBytes.toString("utf8"), `${manifest.final.sha256}  schema-in-the-mist-${manifest.candidate.finalTag.slice(1)}.tgz\n`, "published final checksum differs");
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "mist-final-convergence-"));
  try {
    const version = manifest.candidate.finalTag.slice(1);
    const evidence = [];
    for (const identity of manifest.final.consumers) {
      const consumer = manifest.consumers.find(({ role }) => role === identity.role);
      assert.ok(consumer, `candidate manifest lacks ${identity.role}`);
      const root = path.join(workspace, consumer.path);
      const localSource = identity.role === "lantern" ? localLantern : localHandbook;
      checkout(identity.repository, identity.ref, root, localSource && path.resolve(localSource));
      run("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts"], root);
      const consumerManifest = path.join(root, consumer.proof.manifest);
      fs.mkdirSync(path.dirname(consumerManifest), { recursive: true });
      fs.writeFileSync(consumerManifest, `${JSON.stringify({ protocol: 2, artifact: { provider: "schema-in-the-mist", releaseUrl: manifest.final.releaseUrl, sha256: manifest.final.sha256, integrity: manifest.final.integrity, version }, consumers: manifest.final.consumers }, null, 2)}\n`);
      run("npm", ["run", "release-train:assert", "--", consumer.proof.manifest], root);
      const resultPath = `${consumerManifest}.evidence.json`;
      assert.ok(fs.existsSync(resultPath), `${identity.role} wrote no final evidence`);
      evidence.push(normalizeEvidence(JSON.parse(fs.readFileSync(resultPath, "utf8")), identity, manifest.final, version));
    }
    const completion = { protocol: 2, candidateEvidence, final: { releaseUrl: manifest.final.releaseUrl, sha256: manifest.final.sha256, integrity: manifest.final.integrity }, consumers: evidence };
    parseReleaseTrainCompletion(completion, manifest);
    if (localLantern) { console.log("✓ local detached convergence preflight passed; no completion record was written"); return; }
    const output = path.resolve(option("--output") ?? path.resolve(source).replace(/\.json$/, ".convergence.json"));
    fs.writeFileSync(output, `${JSON.stringify(completion, null, 2)}\n`);
    console.log(`✓ release train complete; final consumer evidence written to ${output}`);
  } finally {
    disposeWorkspace(workspace);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
