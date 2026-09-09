import fs from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

function loadDocument(filePath: string): unknown {
  const source = fs.readFileSync(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".json") return JSON.parse(source);
  if (extension === ".toml") return TOML.parse(source);

  throw new Error(`Unsupported document type: ${filePath}`);
}

function usage(): never {
  console.error(
    "Usage: npm run validate:files -- <schema.json> <document.{json,toml}> [...]"
  );
  process.exit(2);
}

function run(): void {
  const [schemaPath, ...documentPaths] = process.argv.slice(2);

  if (!schemaPath || documentPaths.length === 0) usage();

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  let failures = 0;

  for (const documentPath of documentPaths) {
    let document: unknown;

    try {
      document = loadDocument(documentPath);
    } catch (error) {
      failures++;
      console.error(`✗ ${documentPath}`);
      console.error(error);
      continue;
    }

    if (validate(document)) {
      console.log(`✓ ${documentPath} (${schemaPath})`);
      continue;
    }

    failures++;
    console.error(`✗ ${documentPath} (${schemaPath})`);
    console.error(validate.errors);
  }

  if (failures > 0) process.exit(1);
}

run();
