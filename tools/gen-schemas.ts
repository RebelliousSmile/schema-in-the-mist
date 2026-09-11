import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { SCHEMA_RELEASE_TAG, TARGETS } from "../src/index.js";

const repository = "https://raw.githubusercontent.com/RebelliousSmile/schema-in-the-mist";

for (const target of TARGETS) {
  const relative = path.posix.join(target.game.folder, `${target.name}.schema.json`);
  const schema = z.toJSONSchema(target.zod, {
    target: "draft-7",
    io: "input",
  }) as Record<string, unknown>;
  const document = {
    $schema: schema.$schema,
    $id: `${repository}/${SCHEMA_RELEASE_TAG}/schemas/v1/${relative}`,
    ...Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "$schema")),
  };
  const serialized = `${JSON.stringify(document, null, 2)}\n`;

  for (const root of ["schemas/v1", "schemas"]) {
    const destination = path.join(root, target.game.folder, `${target.name}.schema.json`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, serialized);
  }
}

console.log(`Generated ${TARGETS.length} versioned and convenience JSON Schemas.`);
