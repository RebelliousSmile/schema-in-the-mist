import fs from "node:fs";
import path from "node:path";
import { readReleaseTrainManifest } from "./release-train-manifest.js";
import { readReleaseTrainCompletion } from "./release-train-completion.js";

const directory = path.join(process.cwd(), "release-trains");
const files = fs.readdirSync(directory).filter((file) => /^v\d+\.\d+\.\d+\.json$/.test(file)).sort();
for (const file of files) {
  const manifest = readReleaseTrainManifest(path.join(directory, file));
  if (manifest.status === "completed") readReleaseTrainCompletion(path.join(directory, file.replace(/\.json$/, ".convergence.json")), manifest);
}
const required = process.argv[2] === "--require-complete" ? process.argv[3] : undefined;
if (required) {
  const file = `${required}.json`;
  if (!files.includes(file)) throw new Error(`required committed train is missing: ${file}`);
  if (readReleaseTrainManifest(path.join(directory, file)).status !== "completed") throw new Error(`required committed train is pending: ${file}`);
}
console.log(`✓ ${files.length} release train manifest${files.length === 1 ? "" : "s"} validated.`);
