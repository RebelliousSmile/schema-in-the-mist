import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { TARGETS } from "../src/zod/constants";
import { listDataFiles, loadData } from "./read-data";

type Result = { file: string; ok: boolean; errors?: unknown };

async function run() {
  let failures = 0;
  const allResults: Result[] = [];

  for (const t of TARGETS) {
    // `appearance` publishes at the repository root, not under `schemas/` —
    // see the matching special case in `gen-schemas.ts`.
    const schemaPath =
      t.game.folder === "appearance"
        ? path.join("appearance", `${t.name}.schema.json`)
        : path.join("schemas", t.game.folder, `${t.name}.schema.json`);
    const examplesDir = path.join("examples", t.game.folder, t.name);

    if (!fs.existsSync(schemaPath)) {
      console.warn(`⚠️  Missing schema for target: ${schemaPath} (skipping)`);
      continue;
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    const files = listDataFiles(examplesDir);
    if (files.length === 0) {
      console.warn(`⚠️  No example files found in: ${examplesDir}`);
      continue;
    }

    for (const file of files) {
      const data = loadData(file);
      const ok = validate(data);
      if (ok) {
        console.log(`✓ ${file}`);
        allResults.push({ file, ok: true });
      } else {
        failures++;
        console.error(`✗ ${file}`);
        console.error(validate.errors);
        allResults.push({ file, ok: false, errors: validate.errors });
      }
    }
  }

  if (failures > 0) {
    console.error(`\n❌ Validation failed for ${failures} file(s).`);
    process.exit(1);
  } else {
    console.log(`\n✅ All example files passed validation.`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
