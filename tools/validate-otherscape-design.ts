import fs from "node:fs";

const root = "schemas/otherscape/design";
const projection = JSON.parse(fs.readFileSync(`${root}/handbook-projection.json`, "utf8"));
const tokens = JSON.parse(fs.readFileSync(`${root}/tokens.json`, "utf8"));
if (projection.version !== "1.0.0" || projection.variant !== "metro") throw new Error("Projection must target metro v1.0.0");
for (const mode of ["light", "dark"]) {
  if (!Array.isArray(projection.modes?.[mode]?.evidence) || projection.modes[mode].evidence.length === 0) throw new Error(`Missing ${mode} evidence`);
}
for (const token of Object.values(projection.note) as string[]) {
  if (!token.split(".").reduce((node: any, key) => node?.[key], tokens)) throw new Error(`Unknown projection token: ${token}`);
}
console.log("✓ Otherscape design projection is valid.");
