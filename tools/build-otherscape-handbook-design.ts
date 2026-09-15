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
  if (typeof raw !== "string" && typeof raw !== "number") throw new Error(`Unresolvable token: ${dotted}`);
  const alias = typeof raw === "string" ? /^\{(.+)\}$/.exec(raw) : null;
  return alias ? value(alias[1], mode) : String(raw);
}
function metro(mode: "light" | "dark") {
  return { note: Object.fromEntries(Object.entries(projection.note).map(([css, token]) => [css, value(String(token), mode)])) };
}
function css() {
  const light = (token: string) => value(token, "light");
  const dark = (token: string) => value(token, "dark");
  return `/* GENERATED from schemas/otherscape/design — do not edit by hand. */
/* Handbook renders os-theme as .brumes-os-theme; scope this pack sheet to Metro only. */
body.brumes--otherscape.brumes--variant-metro {
  --os-metro-card-surface: ${light("color.semantic.surface")};
  --os-metro-card-text: ${light("color.semantic.text")};
}
body.brumes--otherscape.brumes--variant-metro.brumes--colour-dark {
  --os-metro-card-surface: ${dark("color.semantic.surface")};
  --os-metro-card-text: ${dark("color.semantic.text")};
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme {
  font-family: ${light("font.family.sans")};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: ${light("space.3")} ${light("space.4")};
  padding: ${light("space.4")};
  border: ${light("border.width.default")} solid var(--os-card-accent);
  border-radius: ${light("radius.none")};
  background: var(--os-metro-card-surface);
  color: var(--os-metro-card-text);
  box-shadow: none;
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--self { --os-card-accent: var(--brumes-theme-self); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--mythos { --os-card-accent: var(--brumes-theme-mythos); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--noise { --os-card-accent: var(--brumes-theme-noise); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--type {
  color: var(--os-card-accent);
  font-family: ${light("font.family.display")};
  font-size: ${light("font.size.caption")};
  font-weight: ${light("font.weight.black")};
  letter-spacing: 0.14em;
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme h3 {
  color: var(--os-card-accent);
  font-family: ${light("font.family.display")};
  font-size: ${light("font.size.title")};
  font-weight: ${light("font.weight.black")};
  line-height: ${light("font.lineHeight.title")};
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--quest { color: var(--os-metro-card-text); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--weakness-tags { border-inline-start-color: var(--os-card-accent); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--tracks { border-top-color: var(--os-card-accent); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--track-mark { color: var(--os-card-accent); }
@media (max-width: ${light("breakpoint.sm")}) {
  body.brumes--otherscape.brumes--variant-metro .brumes-os-theme { grid-template-columns: minmax(0, 1fr); }
  body.brumes--otherscape.brumes--variant-metro .brumes-os-theme > * { grid-column: 1; min-width: 0; }
}
@media (prefers-reduced-motion: reduce) { body.brumes--otherscape.brumes--variant-metro * { animation: none !important; transition: none !important; } }
`;
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
