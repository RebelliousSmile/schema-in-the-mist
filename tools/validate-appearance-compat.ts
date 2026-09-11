import fs from "node:fs";
import { Ajv } from "ajv";

const paths = [
  "appearance/game-pack.schema.json",
  "schemas/appearance/game-pack.schema.json",
] as const;

function hasExternalRef(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasExternalRef);
  if (!value || typeof value !== "object") return false;

  for (const [key, child] of Object.entries(value)) {
    if (
      key === "$ref" &&
      typeof child === "string" &&
      (/^[a-z][a-z0-9+.-]*:/i.test(child) || child.startsWith("//"))
    ) {
      return true;
    }
    if (hasExternalRef(child)) return true;
  }
  return false;
}

const buffers = paths.map((schemaPath) => {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Missing legacy appearance schema: ${schemaPath}`);
  }
  return fs.readFileSync(schemaPath);
});

if (!buffers[0].equals(buffers[1])) {
  throw new Error("Legacy appearance schemas have diverged");
}

const schema = JSON.parse(buffers[0].toString("utf8"));
if (hasExternalRef(schema)) {
  throw new Error("Legacy appearance schema contains an external $ref");
}

const validProbe = {
  id: "compatibility-probe",
  label: "Compatibility Probe",
  style: {},
  polarities: ["light", "dark"],
  shapes: {
    "example-block": {
      summary: { heading: "Summary", optional: true },
    },
  },
};
const invalidProbe = { ...validProbe, unknown: true };
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);

if (!validate(validProbe)) {
  throw new Error(`Legacy appearance schema rejected the valid probe: ${JSON.stringify(validate.errors)}`);
}
if (validate(invalidProbe)) {
  throw new Error("Legacy appearance schema accepted an unknown root property");
}

console.log("✓ Legacy appearance schemas are identical, self-contained, and usable offline.");
