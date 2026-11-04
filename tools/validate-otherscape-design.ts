import fs from "node:fs";
import { contrastRatio } from "./require-contrast.js";

const root = "schemas/otherscape/design";
const projection = JSON.parse(fs.readFileSync(`${root}/handbook-projection.json`, "utf8"));
const tokens = JSON.parse(fs.readFileSync(`${root}/tokens.json`, "utf8"));
const cssPath = "handbook/otherscape/assets/styles/otherscape.css";
type Mode = "light" | "dark";
const modes: Mode[] = ["light", "dark"];

function at(tree: any, dotted: string): any { return dotted.split(".").reduce((node, key) => node?.[key], tree); }
function value(dotted: string, mode: Mode): string {
  const override = mode === "dark" ? at(tokens.themes?.dark, dotted)?.$value : undefined;
  const raw = override ?? at(tokens, dotted)?.$value;
  if (typeof raw !== "string" && typeof raw !== "number") throw new Error(`Unknown projection token: ${dotted}`);
  const alias = typeof raw === "string" ? /^\{(.+)\}$/.exec(raw) : null;
  return alias ? value(alias[1], mode) : String(raw);
}

if (projection.version !== "2.0.0") throw new Error("Projection must be v2.0.0");
const variants = projection.variants as Record<string, any> | undefined;
if (!variants?.metro || !variants?.cairo) throw new Error("Projection must declare the metro and cairo variants");

/* One polarity per variant: Cairo is light, Metro dark. A second mode is a second design to source and to prove. */
const expectedModes: Record<string, Mode> = { metro: "dark", cairo: "light" };
for (const [id, variant] of Object.entries(variants)) {
  const declared = modes.filter((mode) => variant.modes?.[mode]);
  if (expectedModes[id] && declared.join() !== expectedModes[id]) throw new Error(`Variant ${id} must project ${expectedModes[id]} only, not ${declared.join(", ") || "nothing"}`);
  if (declared.length !== 1) throw new Error(`Variant ${id} must project exactly one mode`);
  for (const mode of declared) {
    if (!Array.isArray(variant.modes[mode].evidence) || variant.modes[mode].evidence.length === 0) throw new Error(`Missing ${id} ${mode} evidence`);
  }
  if (!variant.note || Object.keys(variant.note).length === 0) throw new Error(`Variant ${id} projects no note token`);
  for (const layer of ["note", "workspace", "sheet"]) {
    for (const token of Object.values(variant[layer] ?? {}) as string[]) {
      for (const mode of declared) value(token, mode);
    }
  }
  for (const pair of variant.contrast ?? []) {
    const fg = variant.sheet?.[pair.foreground] ?? variant.note?.[pair.foreground];
    const bg = variant.sheet?.[pair.background] ?? variant.note?.[pair.background];
    if (!fg || !bg) throw new Error(`Contrast pair of ${id} names an unprojected variable: ${pair.foreground} / ${pair.background}`);
    for (const mode of declared) {
      const ratio = contrastRatio(value(fg, mode), value(bg, mode));
      if (ratio < pair.min) throw new Error(`${id} ${mode}: ${pair.foreground} on ${pair.background} is ${ratio.toFixed(2)}:1, under ${pair.min}:1`);
    }
  }
}

/* Every rule of the pack sheet belongs to one declared variant, and reads only that variant's --os-<id>-* variables.
   Dark goes through .brumes--colour-dark, never .theme-dark: Handbook swaps the colour class for light while printing. */
const sheet = fs.readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
let rules = 0;
for (const [, rawSelector, body] of sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selector = rawSelector.trim();
  rules += 1;
  if (/\.theme-dark\b/.test(selector)) throw new Error(`Dark rule outside .brumes--colour-dark: ${selector}`);
  const owners = new Set<string>();
  for (const part of selector.split(/,(?![^(]*\))/)) {
    const owner = /\.brumes--variant-([a-z0-9-]+)/.exec(part)?.[1];
    if (!owner || !variants[owner]) throw new Error(`Rule outside a declared variant: ${part.trim()}`);
    owners.add(owner);
  }
  for (const [, used] of body.matchAll(/--os-([a-z0-9]+)-/g)) {
    if (variants[used] && !owners.has(used)) throw new Error(`--os-${used}-* used outside .brumes--variant-${used}: ${selector}`);
  }
}
if (rules === 0) throw new Error(`${cssPath} declares no rule`);
console.log("✓ Otherscape design projection is valid.");
