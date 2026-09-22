import fs from "node:fs";
import path from "node:path";
import { readReleaseTrainManifest } from "./release-train-manifest.js";

const directory = path.join(process.cwd(), "release-trains");
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
for (const file of files) readReleaseTrainManifest(path.join(directory, file));
console.log(`✓ ${files.length} release train manifest${files.length === 1 ? "" : "s"} validated.`);
