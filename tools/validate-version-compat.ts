import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT_VERSION,
  SCHEMA_RELEASE_TAG,
  TARGETS,
  assertCompatiblePackageVersion,
} from "../src/index.js";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  version: string;
};
const requestedTag = process.argv[2] ?? `v${packageJson.version}`;

assertCompatiblePackageVersion(packageJson.version);
if (requestedTag !== `v${packageJson.version}` || requestedTag !== SCHEMA_RELEASE_TAG) {
  throw new Error(
    `Version mismatch: package=${packageJson.version}, requested=${requestedTag}, schema=${SCHEMA_RELEASE_TAG}`,
  );
}
if (Number.parseInt(packageJson.version, 10) !== CONTRACT_VERSION) {
  throw new Error("The stable package major must match the contract major");
}

for (const target of TARGETS) {
  const file = path.join(
    "schemas/v1",
    target.game.folder,
    `${target.name}.schema.json`,
  );
  const schema = JSON.parse(fs.readFileSync(file, "utf8")) as { $id?: string };
  if (!schema.$id?.includes(`/${SCHEMA_RELEASE_TAG}/schemas/v1/`)) {
    throw new Error(`${file} is not anchored to ${SCHEMA_RELEASE_TAG}`);
  }
}

console.log(`Version contract verified for ${requestedTag}.`);
