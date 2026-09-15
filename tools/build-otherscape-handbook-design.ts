import fs from "node:fs";
import path from "node:path";

const design = "schemas/otherscape/design";
const tokens = JSON.parse(fs.readFileSync(path.join(design, "tokens.json"), "utf8"));
const projection = JSON.parse(fs.readFileSync(path.join(design, "handbook-projection.json"), "utf8"));
const packPath = "handbook/otherscape/pack.json";
const cssPath = "handbook/otherscape/assets/styles/otherscape.css";
const write = process.argv.includes("--write");
const check = process.argv.includes("--check");

function at(tree: any, dotted: string): any { return dotted.split(".").reduce((value, key) => value?.[key], tree); }
function value(dotted: string, mode: "light" | "dark"): string {
  const override = mode === "dark" ? at(tokens.themes?.dark, dotted)?.$value : undefined;
  const raw = override ?? at(tokens, dotted)?.$value;
  if (typeof raw !== "string") throw new Error(`Unresolvable token: ${dotted}`);
  const alias = /^\{(.+)\}$/.exec(raw);
  return alias ? value(alias[1], mode) : raw;
}
function metro(mode: "light" | "dark") {
  return { note: Object.fromEntries(Object.entries(projection.note).map(([css, token]) => [css, value(String(token), mode)])) };
}
function css() {
  return `/* GENERATED from schemas/otherscape/design — do not edit by hand. */\n.os-handbook--metro { font-family: ${value("font.family.sans", "light")}; }\n.os-handbook--metro .os-section-label { background: var(--text-highlight-bg); color: var(--h1-color); }\n.os-handbook--metro .os-editorial-section { max-width: 42rem; line-height: 1.5; }\n.os-handbook--metro.is-dark .os-editorial-section { outline: 1px solid var(--text-muted); }\n@media (prefers-reduced-motion: reduce) { .os-handbook--metro * { animation: none !important; transition: none !important; } }\n`;
}
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const metroVariant = pack.variants.find((item: any) => item.id === "metro");
if (!metroVariant) throw new Error("Missing metro variant");
const expected = { light: metro("light"), dark: metro("dark") };
if (check) {
  if (JSON.stringify(metroVariant.style) !== JSON.stringify(expected)) throw new Error("Metro projection drift in handbook/otherscape/pack.json");
  if (!fs.existsSync(cssPath) || fs.readFileSync(cssPath, "utf8") !== css()) throw new Error("Otherscape stylesheet drift");
}
if (write) {
  metroVariant.style = expected;
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  fs.writeFileSync(packPath, `${JSON.stringify(pack, null, 2)}\n`);
  fs.writeFileSync(cssPath, css());
}
