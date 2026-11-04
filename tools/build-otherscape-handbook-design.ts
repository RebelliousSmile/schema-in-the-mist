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
type Mode = "light" | "dark";
type Layer = Record<string, string>;
function resolve(map: Record<string, unknown> | undefined, mode: Mode): Layer {
  return Object.fromEntries(Object.entries(map ?? {}).map(([css, token]) => [css, value(String(token), mode)]));
}
/* Obsidian derives its accent ramp from --accent-h/s/l: they follow the projected --color-accent. */
function hsl(hex: string): { h: string; s: string; l: string } {
  const [r, g, b] = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h: h.toFixed(2), s: `${(sat * 100).toFixed(2)}%`, l: `${(l * 100).toFixed(2)}%` };
}
function derive(derived: Record<string, unknown> | undefined, note: Layer): Layer {
  return Object.fromEntries(Object.entries(derived ?? {}).map(([css, rule]) => {
    const match = /^hsl\.([hsl])\((--[a-z0-9-]+)\)$/.exec(String(rule));
    if (!match || !/^#[0-9a-f]{6}$/i.test(note[match[2]] ?? "")) throw new Error(`Underivable token ${css}: ${String(rule)}`);
    return [css, hsl(note[match[2]])[match[1] as "h" | "s" | "l"]];
  }));
}
function variantStyle(variant: any, mode: Mode): { note: Layer; workspace?: Layer } {
  const note = resolve(variant.note, mode);
  Object.assign(note, derive(variant.derived, note));
  return variant.workspace ? { note, workspace: resolve(variant.workspace, mode) } : { note };
}
/* A variant holds the polarities its projection names, and only their layers. */
function modesOf(variant: any): Mode[] {
  const modes = (["light", "dark"] as Mode[]).filter((mode) => variant.modes?.[mode]);
  if (modes.length === 0) throw new Error("A projected variant names no mode");
  return modes;
}
/* A light-only variant may publish its dark design for the alternate section, and only for it. */
function sectionOf(variant: any): Record<string, never> | { section: { note: Layer } } {
  if (!variant.alternate) return {};
  const [mode] = modesOf(variant);
  return { section: { note: variantStyle(variant, mode === "light" ? "dark" : "light").note } };
}
function sheetVars(variant: any, mode: Mode): string {
  return Object.entries(resolve(variant.sheet, mode)).map(([css, colour]) => `  ${css}: ${colour};`).join("\n");
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
  grid-template-columns: minmax(0, 1fr);
  gap: ${light("space.2")};
  padding: ${light("space.4")};
  border: ${light("border.width.default")} solid var(--os-card-accent);
  border-radius: ${light("radius.none")};
  background: var(--os-metro-card-surface);
  color: var(--os-metro-card-text);
  box-shadow: none;
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme > * { grid-column: 1; min-width: 0; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--header { order: 1; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--power-tags { order: 2; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--weakness-tags { order: 3; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--quest { order: 4; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--tracks { order: 5; }
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
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme ul { display: grid; gap: ${light("space.1")}; margin: 0; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme li { margin: 0; }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme .brumes-tag {
  display: block;
  padding: ${light("space.1")} ${light("space.2")};
  border: ${light("border.width.hairline")} solid color-mix(in srgb, var(--os-card-accent) 68%, transparent);
  background: color-mix(in srgb, var(--os-card-accent) 14%, var(--os-metro-card-surface));
  color: var(--os-metro-card-text);
  font-size: ${light("font.size.caption")};
  font-weight: ${light("font.weight.bold")};
  line-height: ${light("font.lineHeight.body")};
  text-transform: uppercase;
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--weakness-tags {
  border-inline-start: 0;
  padding-inline-start: 0;
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--weakness-tags .brumes-tag {
  border-inline-start: ${light("border.width.thick")} solid var(--os-card-accent);
  background: color-mix(in srgb, var(--os-card-accent) 24%, var(--os-metro-card-surface));
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--quest {
  margin: ${light("space.2")} 0 0;
  padding-top: ${light("space.2")};
  border-top: ${light("border.width.hairline")} solid var(--os-card-accent);
  color: var(--os-metro-card-text);
}
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--tracks { border-top-color: var(--os-card-accent); }
body.brumes--otherscape.brumes--variant-metro .brumes-os-theme--track-mark { color: var(--os-card-accent); }
@media (prefers-reduced-motion: reduce) { body.brumes--otherscape.brumes--variant-metro * { animation: none !important; transition: none !important; } }
${cairoCss()}`;
}
function cairoCss() {
  const cairo = projection.variants.cairo;
  const v = "body.brumes--otherscape.brumes--variant-cairo";
  const display = value("font.family.display", "light");
  const black = value("font.weight.black", "light");
  const bevel = value("radius.bevel", "light");
  const band = value("radius.band", "light");
  const cut = value("radius.band-bevel", "light");
  const h1Cut = `polygon(0 0, calc(100% - ${cut}) 0, 100% ${cut}, 100% 100%, 0 100%)`;
  if (modesOf(cairo).join() !== "light") throw new Error("The Cairo sheet is written for a light-only variant");
  return `/* Cairo: band headings, highlighted subtitles, bevelled callouts and cards. Light; its dark design paints the
   alternate section only, on screen like the section itself. Flat paper, no texture. */
${v} {
${sheetVars(cairo, "light")}
}
@media screen {
  ${v} .handbook-mode-alternate {
${sheetVars(cairo, "dark").replace(/^/gm, "  ")}
  }
}
${v} :is(.markdown-rendered .el-h1 > h1, .markdown-rendered .el-h2 > h2, .markdown-rendered .el-h3 > h3) {
  width: fit-content;
  font-family: ${display};
  font-weight: ${black};
  text-transform: uppercase;
  line-height: 1;
  border-radius: ${band};
}
${v} :is(.HyperMD-header-1 .cm-header-1, .HyperMD-header-2 .cm-header-2, .HyperMD-header-3 .cm-header-3) {
  border-radius: ${band};
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  text-transform: uppercase;
}
${v} .markdown-rendered .el-h1 > h1 {
  padding: 0.12em 0.6em 0.06em 0.3em;
  background: var(--os-cairo-heading-band);
  color: var(--os-cairo-heading);
  clip-path: ${h1Cut};
}
${v} .HyperMD-header-1 .cm-header-1 { padding: 0 0.6em 0 0.3em; background: var(--os-cairo-heading-band); color: var(--os-cairo-heading); clip-path: ${h1Cut}; }
${v} .markdown-rendered .el-h2 > h2 { padding: 0.12em 0.35em 0.04em; background: var(--os-cairo-subheading-band); color: var(--os-cairo-heading); }
${v} .HyperMD-header-2 .cm-header-2 { padding: 0 0.3em; background: var(--os-cairo-subheading-band); color: var(--os-cairo-heading); }
${v} .markdown-rendered .el-h3 > h3 { padding: 0.18em 0.45em 0.1em; background: var(--os-cairo-label); color: var(--os-cairo-label-text); font-size: 1em; }
${v} .HyperMD-header-3 .cm-header-3 { padding: 0 0.35em; background: var(--os-cairo-label); color: var(--os-cairo-label-text); font-size: 1em; }
${v} :is(.markdown-rendered .el-h1 + .el-p > p, .HyperMD-header-1 + .cm-line) { color: var(--os-cairo-lead); font-size: 1.3em; line-height: 1.25; }
${v} :is(.markdown-rendered .el-h2 + .el-p > p > em:only-child, .HyperMD-header-2 + .cm-line > .cm-em:first-child) {
  padding: 0 0.3em;
  background: var(--os-cairo-highlight);
  color: var(--os-cairo-highlight-text);
}
${v} :is(.callout, .brumes-os-theme, .brumes-os-profile, .brumes-os-creation) {
  border-radius: ${bevel};
  corner-shape: bevel;
  box-shadow: none;
}
@supports not (corner-shape: bevel) {
  ${v} :is(.callout, .brumes-os-theme, .brumes-os-profile, .brumes-os-creation) {
    clip-path: polygon(${bevel} 0, calc(100% - ${bevel}) 0, 100% ${bevel}, 100% calc(100% - ${bevel}), calc(100% - ${bevel}) 100%, ${bevel} 100%, 0 calc(100% - ${bevel}), 0 ${bevel});
  }
}
${v} .callout {
  position: relative;
  border: 3px double var(--os-cairo-surface-line);
  background: var(--os-cairo-surface);
  color: var(--text-normal);
}
${v} .callout::before,
${v} .callout::after {
  content: "";
  position: absolute;
  inset-inline-start: 1.5rem;
  width: 1.4rem;
  height: 0.3rem;
  background: repeating-linear-gradient(60deg, var(--os-cairo-chevron) 0 0.3rem, transparent 0.3rem 0.55rem);
}
${v} .callout::before { top: 0.15rem; }
${v} .callout::after { bottom: 0.15rem; }
${v} .callout-title { color: var(--text-normal); font-family: ${display}; font-style: italic; font-weight: ${black}; text-transform: uppercase; }
${v} .callout-icon { color: var(--os-cairo-card-title); }
${v} :is(.brumes-os-theme, .brumes-os-profile, .brumes-os-creation) {
  --os-card-accent: var(--os-cairo-rule);
  border: 1px solid var(--os-cairo-surface-line);
  background: var(--os-cairo-surface);
  color: var(--text-normal);
}
${v} :is(.brumes-os-theme, .brumes-os-profile, .brumes-os-creation) :is(h2, h3) { color: var(--os-cairo-card-title); font-family: ${display}; font-weight: ${black}; text-transform: uppercase; }
${v} .brumes-os-theme--type {
  width: fit-content;
  padding: 0.2em 0.5em 0.1em;
  background: var(--os-cairo-label);
  color: var(--os-cairo-label-text);
  font-family: ${display};
  font-weight: ${black};
  text-transform: uppercase;
}
${v} :is(.brumes-os-theme--quest, .brumes-os-theme--tracks) { border-top: 1px solid var(--os-cairo-rule); }
`;
}
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const projected = Object.entries(projection.variants as Record<string, any>).map(([id, variant]) => {
  const target = pack.variants.find((item: any) => item.id === id);
  if (!target) throw new Error(`Missing ${id} variant`);
  const modes = modesOf(variant);
  return { id, target, modes, expected: { ...Object.fromEntries(modes.map((mode) => [mode, variantStyle(variant, mode)])), ...sectionOf(variant) } };
});
/* The pack-wide typography comes from the tokens too: a family the tokens drop must not linger in the pack. */
const baseNote = pack.pack.style.base.note;
const expectedFonts: Record<string, string> = Object.fromEntries(
  Object.entries(projection.base ?? {}).map(([css, token]) => [css, value(String(token), "light")]),
);
if (check) {
  for (const { id, target, modes, expected } of projected) {
    if (JSON.stringify(target.style) !== JSON.stringify(expected)) throw new Error(`${id} projection drift in handbook/otherscape/pack.json`);
    if (JSON.stringify(target.polarities) !== JSON.stringify(modes)) throw new Error(`${id} polarity drift in handbook/otherscape/pack.json`);
  }
  for (const [css, font] of Object.entries(expectedFonts)) {
    if (baseNote[css] !== font) throw new Error(`Typography projection drift in handbook/otherscape/pack.json: ${css}`);
  }
  if (!fs.existsSync(cssPath) || fs.readFileSync(cssPath, "utf8") !== css()) throw new Error("Otherscape stylesheet drift");
}
if (write) {
  for (const { target, modes, expected } of projected) { target.style = expected; target.polarities = modes; }
  Object.assign(baseNote, expectedFonts);
  fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  fs.writeFileSync(packPath, `${JSON.stringify(pack, null, 2)}\n`);
  fs.writeFileSync(cssPath, css());
}
