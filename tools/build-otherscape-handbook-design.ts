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
  return `/* GENERATED from schemas/otherscape/design — do not edit by hand. */
@media (prefers-reduced-motion: reduce) { body.brumes--otherscape.brumes--variant-metro * { animation: none !important; transition: none !important; } }
${Object.keys(BANDS).map(bandCss).join("")}`;
}
/* Cards: one sheet for the three variants, read from each variant's --os-<id>-* variables. The type colour is the one
   readable on the card surface (Tokyo keeps slate cards in both polarities); the icon is a mask of the pack image of
   the type, and a missing image hides the icon only. Tags and title bands are bevelled on the left, text is set tight. */
const TYPES = ["self", "mythos", "noise"] as const;
function cardCss(v: string, o: (name: string) => string, frame: string) {
  const display = value("font.family.display", "light");
  const sans = value("font.family.sans", "light");
  const black = value("font.weight.black", "light");
  const bold = value("font.weight.bold", "light");
  const paper = value("color.neutral.50", "light");
  const leftBevel = (size: string) => `polygon(${size} 0, 100% 0, 100% 100%, 0 100%, 0 ${size})`;
  const card = ":is(.brumes-os-theme, .brumes-os-profile, .brumes-os-creation:not(.brumes-os-creation--loadout-item))";
  const item = ".brumes-os-creation--loadout-item";
  const next = `${v} .el-pre:has(${item}) + .el-pre:has(${item}) ${item}`;
  const rule = "1px solid color-mix(in srgb, var(--os-type) 55%, transparent)";
  const smallCaps = `font-family: ${display}; font-size: 0.78em; font-weight: ${black}; letter-spacing: 0.14em; text-transform: uppercase;`;
  // Compounded on the card so the type outranks the card's own `--os-type`:
  // `:is()` takes its strongest argument, which makes the card rule 0,4,1.
  const types = TYPES.map((type) => `${v} ${card}:is(.brumes-os-theme--${type}, .brumes-os-profile--${type}) { --os-type: ${o(`type-${type}`)}; --os-type-icon: var(--brumes-image-theme-${type}); }
${v}.brumes-missing--theme-${type} :is(.brumes-os-theme--${type} .brumes-os-theme--icon, .brumes-os-profile--${type} .brumes-os-profile--icon) { display: none; }
`).join("");
  return `${v} ${card} {
  --os-type: ${o("rule")};
  --os-card-accent: var(--os-type);
  --p-spacing: 0.2em;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.3em 0.9em;
  padding: 0.7em 0.8em 0.75em;
  border: ${frame} var(--os-type);
  box-shadow: none;
  font-family: ${sans};
  line-height: 1.25;
}
${types}${v} .brumes-os-theme--crew .brumes-os-theme--icon { display: none; }
${v} ${card} :is(p, li, h3, h4) { margin: 0; }
${v} ${card} > * { grid-column: 1 / -1; min-width: 0; }
${v} ${card} section { margin: 0; padding: 0.3em 0 0; border-top: ${rule}; }
${v} ${card} section > * + * { margin-top: 0.2em; }
${v} ${card} h4 { display: flex; align-items: center; gap: 0.45em; color: var(--os-type); line-height: 1.1; ${smallCaps} }
${v} ${card} h4::after { content: ""; flex: 1; border-top: 1px solid currentColor; opacity: 0.7; }
${v} ${card} ul { display: flex; flex-wrap: wrap; gap: 0.25em 0.3em; margin: 0; padding: 0; list-style: none; }
${v} ${card} .brumes-tag {
  display: inline-block;
  padding: 0.14em 0.55em 0.1em 0.7em;
  border: 1px solid transparent;
  background: linear-gradient(color-mix(in srgb, var(--os-type) 26%, ${o("surface")}), color-mix(in srgb, var(--os-type) 26%, ${o("surface")})) padding-box, var(--os-type) border-box;
  color: ${o("surface-text")};
  font-size: 0.8em;
  font-weight: ${bold};
  line-height: 1.2;
  text-transform: uppercase;
  clip-path: ${leftBevel("0.5em")};
}
${v} ${card} .brumes-tag.brumes-weakness { background: ${o("weakness")}; color: ${o("weakness-text")}; }
${v} :is(.brumes-os-theme--icon, .brumes-os-profile--icon) {
  display: inline-block;
  flex: none;
  width: 1.6em;
  height: 1.6em;
  background: var(--os-type);
  -webkit-mask: var(--os-type-icon) center / contain no-repeat;
  mask: var(--os-type-icon) center / contain no-repeat;
}
${v} .brumes-os-theme--header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.25em 0.5em; }
${v} .brumes-os-theme--type { grid-column: 1; grid-row: 1; gap: 0 0.4em; color: var(--os-type); line-height: 1.1; ${smallCaps} }
${v} .brumes-os-theme--type-name { color: ${o("surface-text")}; }
${v} .brumes-os-theme--icon { grid-column: 2; grid-row: 1; width: 1.7em; height: 1.7em; }
${v} .brumes-os-theme--header h3 {
  grid-column: 1 / -1;
  padding: 0.18em 0.5em 0.08em 0.75em;
  background: var(--os-type);
  color: ${paper};
  font-family: ${display};
  font-size: 1.3em;
  font-style: italic;
  font-weight: ${black};
  line-height: 1.05;
  text-transform: uppercase;
  clip-path: ${leftBevel("0.55em")};
}
${v} .brumes-os-theme--header h3 .brumes-tag { padding: 0; border: 0; background: none; color: inherit; font: inherit; text-transform: inherit; clip-path: none; }
${v} .brumes-os-theme--header small { grid-column: 1 / -1; font-size: 0.75em; opacity: 0.8; }
${v} .brumes-os-theme--header { order: 1; }
${v} .brumes-os-theme--description { order: 2; border-top: 0; padding-top: 0; }
${v} .brumes-os-theme--power-tags { order: 3; }
${v} .brumes-os-theme--weakness-tags { order: 4; border-inline-start: 0; padding-inline-start: 0; }
${v} .brumes-os-theme--quest { order: 5; display: block; margin: 0; padding-top: 0.3em; border-top: ${rule}; }
${v} .brumes-os-theme--quest-label { display: block; color: var(--os-type); ${smallCaps} }
${v} .brumes-os-theme--special { order: 6; }
${v} .brumes-os-theme--special > p { gap: 0 0.35em; }
${v} .brumes-os-theme--special-box { margin: 0; accent-color: var(--os-type); }
${v} .brumes-os-theme--tracks { order: 7; padding-top: 0.3em; border-top: ${rule}; }
${v} .brumes-os-theme--track-mark { color: var(--os-type); }
${v} .brumes-os-profile--power-set header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.15em 0.4em; }
${v} .brumes-os-profile--kind { grid-column: 1 / -1; padding-bottom: 0.15em; border-bottom: 1px solid var(--os-type); color: var(--os-type); text-align: end; ${smallCaps} }
${v} .brumes-os-profile--icon { grid-column: 1; }
${v} .brumes-os-profile--power-set h3 { grid-column: 2; color: var(--os-type); font-size: 1.45em; font-style: italic; line-height: 1; }
${v} .brumes-os-profile--rating { grid-column: 3; color: var(--os-type); font-weight: ${black}; letter-spacing: 0.05em; white-space: nowrap; }
${v} .brumes-os-profile--power-set header small { grid-column: 1 / -1; margin: 0; font-size: 0.75em; opacity: 0.8; }
${v} .brumes-os-profile :is(.brumes-os-profile--specials, .brumes-os-profile--threats) strong { display: block; font-weight: ${bold}; }
${v} .brumes-os-profile--threat { margin: 0; padding: 0; border: 0; }
${v} .brumes-os-profile--threat > strong::before { content: "› "; color: var(--os-type); font-weight: ${black}; }
${v} .brumes-os-profile--threat + .brumes-os-profile--threat { margin-top: 0.3em; }
${v} .brumes-os-creation header { display: flex; flex-direction: column; align-items: flex-start; gap: 0.15em; }
${v} .brumes-os-creation--character-trope header strong {
  order: -1;
  padding: 0.15em 0.45em 0.08em;
  background: ${o("label")};
  color: ${o("label-text")};
  clip-path: ${leftBevel("0.35em")};
  ${smallCaps}
}
${v} .brumes-os-creation--character-trope h3 { color: ${o("card-title")}; font-size: 1.5em; line-height: 1; }
${v} .brumes-os-creation--character-trope header small { margin: 0; font-size: 0.75em; opacity: 0.8; }
${v} .brumes-os-creation--character-trope section { border-top: 0; }
${v} .brumes-os-creation--theme-kits h4 { flex-direction: row-reverse; }
${v} .brumes-os-creation--character-trope :is(.brumes-os-creation--theme-kits, .brumes-os-creation--choices) ul { display: grid; gap: 0.1em; }
${v} .brumes-os-creation--character-trope li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.35em; }
${v} .brumes-os-creation--character-trope li strong { font-weight: ${bold}; text-transform: uppercase; }
${v} :is(.brumes-os-creation--kit-category, .brumes-os-creation--kit-page) { font-size: 0.8em; opacity: 0.85; text-transform: uppercase; }
${v} .brumes-os-creation--kit-category::before { content: "\\28"; }
${v} .brumes-os-creation--kit-category:has(+ .brumes-os-creation--kit-page)::after { content: ","; }
${v} .brumes-os-creation--kit-category:not(:has(+ .brumes-os-creation--kit-page))::after { content: "\\29"; }
${v} .brumes-os-creation--kit-page::after { content: "\\29"; }
${v} .brumes-os-creation--choices h4::before {
  content: "?";
  display: inline-grid;
  place-items: center;
  width: 1.3em;
  height: 1.3em;
  border-radius: 50%;
  background: var(--os-type);
  color: ${o("surface")};
  letter-spacing: 0;
}
${v} .brumes-os-creation--choice-box { margin: 0; accent-color: var(--os-type); }
${v} .brumes-os-creation--loadout-entry { padding: 0.05em 0.35em; background: ${o("highlight")}; color: ${o("highlight-text")}; }
${v} ${item} {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1fr);
  align-items: start;
  gap: 0.15em 0.8em;
  margin: 0;
  padding: 0.35em 0.5em;
  border: 0;
  border-radius: 0;
  background: color-mix(in srgb, currentColor 9%, transparent);
  box-shadow: none;
  line-height: 1.25;
}
${v} ${item}::before,
${v} ${item}::after,
${v} ${item} h4 { grid-row: 1; margin: 0; padding: 0; border: 0; color: var(--text-muted); ${smallCaps} }
${v} ${item}::before { content: "Objet"; grid-column: 1; }
${v} ${item}::after { content: "Description"; grid-column: 2; }
${v} ${item} > * { grid-row: 2; min-width: 0; margin: 0; padding: 0; border: 0; }
${v} ${item} :is(p, li, h3) { margin: 0; }
${v} ${item} .brumes-os-creation--header { grid-column: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 0.1em; }
${v} ${item} .brumes-os-creation--header h3 {
  padding: 0.12em 0.45em 0.06em 0.6em;
  background: ${o("item-name")};
  color: ${o("item-name-text")};
  font-family: ${display};
  font-size: 1.05em;
  font-weight: ${black};
  line-height: 1.1;
  text-transform: uppercase;
  clip-path: ${leftBevel("0.4em")};
  box-sizing: border-box;
  max-width: 100%;
  overflow-wrap: anywhere;
}
${v} ${item} .brumes-os-creation--header :is(strong, small) { font-size: 0.75em; opacity: 0.8; }
${v} ${item} .brumes-os-creation--description { grid-column: 2; }
${v} ${item} :is(.brumes-os-creation--feature-tags, .brumes-os-creation--weakness-tag) { display: contents; }
${v} ${item} .brumes-os-creation--feature-tags > h4 { grid-column: 3; }
${v} ${item} .brumes-os-creation--weakness-tag > h4 { grid-column: 4; }
${v} ${item} .brumes-os-creation--feature-tags > ul { grid-row: 2; grid-column: 3; display: flex; flex-wrap: wrap; gap: 0.15em 0.3em; margin: 0; padding: 0; list-style: none; }
${v} ${item} .brumes-os-creation--feature-tags .brumes-tag { padding: 0 0.25em; background: ${o("highlight")}; color: ${o("highlight-text")}; font-weight: normal; }
${v} ${item} .brumes-os-creation--feature-tags li:first-child .brumes-tag { font-style: italic; font-weight: ${bold}; }
${v} ${item} .brumes-os-creation--weakness-tag > .brumes-tag {
  grid-row: 2;
  grid-column: 4;
  justify-self: start;
  box-sizing: border-box;
  max-width: 100%;
  overflow-wrap: anywhere;
  padding: 0.1em 0.5em 0.1em 0.9em;
  background: color-mix(in srgb, currentColor 22%, transparent);
  clip-path: polygon(0.6em 0, 100% 0, 100% 100%, 0.6em 100%, 0 50%);
}
/* The row folds on the width the block gets, not on the window's: a narrow
   column in a wide window must stack too (four columns from 34rem, pp. 252-254). */
${v} :has(> ${item}) { container-type: inline-size; }
${v} .el-pre:has(${item}) + .el-pre:has(${item}) { margin-top: -0.5em; }
${next}::before,
${next}::after,
${next} h4 { display: none; }
@container (max-width: 34rem) {
  ${v} ${item} { grid-template-columns: minmax(0, 1fr); }
  ${v} ${item} > *,
  ${v} ${item} :is(.brumes-os-creation--feature-tags, .brumes-os-creation--weakness-tag) > * { grid-row: auto; grid-column: 1; }
  ${v} ${item}::before,
  ${v} ${item}::after { display: none; }
}
`;
}
/* Band headings, highlighted subtitles and bevelled callouts, shared by every variant; each one reads only its own
   --os-<id>-* variables. The declared polarity paints the note; with an alternate, the other one paints the alternate
   section, on screen like the section itself. Flat paper, no texture. */
interface BandOptions { frame: string; chevrons: boolean; page?: boolean; label: string }
const BANDS: Record<string, BandOptions> = {
  metro: { frame: "1px solid", chevrons: false, page: true, label: "Metro: light (page.jpg, light-chapo.jpg, act-0-crew.png, description.jpg, chapter-title.jpg), dark alternate (dark.jpg, dark-chapo.jpg); cut cards of sheet1.jpg." },
  cairo: { frame: "3px double", chevrons: true, label: "Cairo: light (cairo-light.jpg), dark alternate (cairo-dark.jpg); double frame of cairo-tropes.jpg in the type colour." },
  tokyo: { frame: "1px solid", chevrons: false, label: "Tokyo: light (tokyo-light.jpg), dark alternate (tokyo-dark.jpg); slate cards in both." },
};
function bandCss(id: string) {
  const variant = projection.variants[id];
  const options = BANDS[id];
  if (!variant || !options) throw new Error(`No band sheet for ${id}`);
  const [mode] = modesOf(variant);
  const other: Mode = mode === "light" ? "dark" : "light";
  const v = `body.brumes--otherscape.brumes--variant-${id}`;
  const o = (name: string) => `var(--os-${id}-${name})`;
  const display = value("font.family.display", "light");
  const title = value("font.family.title", "light");
  const sans = value("font.family.sans", "light");
  const lead = value("font.family.lead", "light");
  const leadSize = value("font.size.book.lead", "light");
  const black = value("font.weight.black", "light");
  const bold = value("font.weight.bold", "light");
  const bevel = value("radius.bevel", "light");
  const band = value("radius.band", "light");
  const cut = value("radius.band-bevel", "light");
  const h1Cut = `polygon(0 0, calc(100% - ${cut}) 0, 100% ${cut}, 100% 100%, 0 100%)`;
  const surfaces = ".callout, .brumes-os-theme, .brumes-os-profile, .brumes-os-creation:not(.brumes-os-creation--loadout-item)";
  const alternate = variant.alternate ? `@media screen {
  ${v} .handbook-mode-alternate {
${sheetVars(variant, other).replace(/^/gm, "  ")}
  }
}
` : "";
  const chevrons = options.chevrons ? `${v} .callout::before,
${v} .callout::after {
  content: "";
  position: absolute;
  inset-inline-start: 1.5rem;
  width: 1.4rem;
  height: 0.3rem;
  background: repeating-linear-gradient(60deg, ${o("chevron")} 0 0.3rem, transparent 0.3rem 0.55rem);
}
${v} .callout::before { top: 0.15rem; }
${v} .callout::after { bottom: 0.15rem; }
` : "";
  return `/* ${options.label} */
${v} {
${sheetVars(variant, mode)}
}
${v} :is(.markdown-rendered, .markdown-source-view.mod-cm6) {
  --p-spacing: 0.55em;
  --line-height-normal: 1.32;
  --list-spacing: 0.05em;
  --heading-spacing: 1.1em;
}
${alternate}${v} :is(.markdown-rendered .el-h1 > h1, .markdown-rendered .el-h2 > h2, .markdown-rendered .el-h3 > h3) {
  width: fit-content;
  font-family: ${display};
  font-weight: ${black};
  text-transform: uppercase;
  line-height: 1;
  border-radius: ${band};
}
/* The book's faces per role (phase 8): the H1 in its title face, never synthesised bold since NeoTokyo has a
   Regular only; the intertitle in the bold text face. */
${v} :is(.markdown-rendered .el-h1 > h1, .HyperMD-header-1 .cm-header-1) { font-family: ${title}; font-synthesis-weight: none; }
${v} :is(.markdown-rendered .el-h2 > h2, .HyperMD-header-2 .cm-header-2) { font-family: ${sans}; font-weight: ${bold}; }
/* Running text is justified and hyphenated, as in the book; the lead stays ranged left. */
${v} .markdown-rendered .el-p > p { text-align: justify; hyphens: auto; }
${v} :is(.markdown-rendered, .markdown-source-view.mod-cm6) li { hyphens: auto; }
${v} :is(.HyperMD-header-1 .cm-header-1, .HyperMD-header-2 .cm-header-2, .HyperMD-header-3 .cm-header-3) {
  border-radius: ${band};
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  text-transform: uppercase;
}
${v} .markdown-rendered .el-h1 > h1 {
  padding: 0.12em 0.6em 0.06em 0.3em;
  background: ${o("heading-band")};
  color: ${o("heading")};
  clip-path: ${h1Cut};
}
${v} .HyperMD-header-1 .cm-header-1 { padding: 0 0.6em 0 0.3em; background: ${o("heading-band")}; color: ${o("heading")}; clip-path: ${h1Cut}; }
${v} .markdown-rendered .el-h2 > h2 { padding: 0.12em 0.35em 0.04em; background: ${o("subheading-band")}; color: ${o("subheading")}; }
${v} .HyperMD-header-2 .cm-header-2 { padding: 0 0.3em; background: ${o("subheading-band")}; color: ${o("subheading")}; }
${v} .markdown-rendered .el-h3 > h3 { padding: 0.18em 0.45em 0.1em; background: ${o("label")}; color: ${o("label-text")}; font-size: 1em; }
${v} .HyperMD-header-3 .cm-header-3 { padding: 0 0.35em; background: ${o("label")}; color: ${o("label-text")}; font-size: 1em; }
${v} :is(.markdown-rendered .el-h1 + .el-p > p, .markdown-rendered .el-h1 + .handbook-layout-marker + .el-p > p, .HyperMD-header-1 + .cm-line) { color: ${o("lead")}; font-family: ${lead}; font-size: ${leadSize}; line-height: 1.25; text-align: start; }
${v} :is(.markdown-rendered .el-h2 + .el-p > p > em:only-child, .HyperMD-header-2 + .cm-line > .cm-em:first-child) {
  padding: 0 0.3em;
  background: ${o("highlight")};
  color: ${o("highlight-text")};
}
${v} :is(${surfaces}) {
  border-radius: ${bevel};
  corner-shape: bevel;
  box-shadow: none;
  background: ${o("surface")};
  --text-normal: ${o("surface-text")};
  --bold-color: ${o("surface-text")};
  --italic-color: ${o("surface-text")};
  color: ${o("surface-text")};
}
@supports not (corner-shape: bevel) {
  ${v} :is(${surfaces}) {
    clip-path: polygon(${bevel} 0, calc(100% - ${bevel}) 0, 100% ${bevel}, 100% calc(100% - ${bevel}), calc(100% - ${bevel}) 100%, ${bevel} 100%, 0 calc(100% - ${bevel}), 0 ${bevel});
  }
}
${v} .callout {
  position: relative;
  border: ${options.chevrons ? "3px double" : "1px solid"} ${o("surface-line")};
}
${chevrons}${v} .callout-title { --callout-title-color: ${o("surface-text")}; color: ${o("surface-text")}; font-family: ${display}; font-style: italic; font-weight: ${black}; text-transform: uppercase; }
${v} .callout-icon { color: ${o("card-title")}; }
${cardCss(v, o, options.frame)}${options.page ? pageCss(v, o) : ""}`;
}
/* The scenario page (act-0-crew.png): an H6 right before an H1 is its kicker, and the two callouts that
   OTHERSCAPE_VISUAL_CALLOUTS publishes are square, untitled surfaces, set apart from the bevelled callout. */
function pageCss(v: string, o: (name: string) => string) {
  const display = value("font.family.display", "light");
  const black = value("font.weight.black", "light");
  const band = value("radius.band", "light");
  const typewriter = value("font.family.typewriter", "light");
  const title = value("font.family.title", "light");
  const lead = value("font.family.lead", "light");
  const aside = value("font.family.aside", "light");
  const list = value("font.family.list", "light");
  const light = value("font.weight.light", "light");
  const leadSize = value("font.size.book.lead", "light");
  const readAloudSize = value("font.size.book.read-aloud", "light");
  const callout = (id: string) => `${v} .callout[data-brumes-callout-style="${id}"]`;
  return `${v} .markdown-rendered .el-h6:has(+ .el-h1) > h6 {
  width: fit-content;
  margin-block: 0 0.15em;
  padding: 0.12em 0.35em 0.04em;
  border-radius: ${band};
  background: ${o("kicker-band")};
  color: ${o("kicker")};
  font-family: ${display};
  font-size: 1.35em;
  font-weight: ${black};
  line-height: 1;
  text-transform: uppercase;
}
${v} .markdown-rendered .el-h6:has(+ .el-h1) + .el-h1 > h1 { margin-top: 0; }
${v} .HyperMD-header-6:has(+ .HyperMD-header-1) .cm-header-6 {
  padding: 0 0.3em;
  border-radius: ${band};
  background: ${o("kicker-band")};
  color: ${o("kicker")};
  font-family: ${display};
  font-size: 1.35em;
  font-weight: ${black};
  text-transform: uppercase;
}
/* Native callouts keep the bevelled cyan frame of the variant: it is the titled sidebar of page.jpg (THEMATIC
   PILLARS), with its red striped tab on the top edge, right side. */
${v} .callout:not([data-brumes-callout-style^="otherscape-"]) { padding: 0.9em 1.1em 0.8em; }
${v} .callout:not([data-brumes-callout-style^="otherscape-"])::after {
  content: "";
  position: absolute;
  top: 0;
  inset-inline-end: 12%;
  width: 3.2rem;
  height: 0.4rem;
  pointer-events: none;
  background: repeating-linear-gradient(120deg, ${o("tab")} 0 0.25rem, transparent 0.25rem 0.45rem);
}
/* Bullets (act-0-crew.png): a small dot on a hanging indent, items set apart like paragraphs. The ink is named:
   \`currentColor\` would resolve on the bullet span, whose colour is transparent. A zero ring size keeps the dot
   solid where the theme draws the first level as a ring (Border). */
${v} :is(.markdown-rendered, .markdown-source-view) { --list-bullet-size: 0.22em; --list-bullet-size-alt: 0px; --list-marker-color: var(--text-normal); }
${v} .markdown-rendered ul > li + li { margin-top: 0.55em; }
/* Numbered lists are set in the book's light condensed face; sidebars and renvois in IBM Plex Sans Condensed. */
${v} .markdown-rendered ol > li { font-family: ${list}; font-weight: ${light}; }
${v} :is(.callout:not([data-brumes-callout-style^="otherscape-"]), .callout[data-brumes-callout-style="otherscape-renvoi"]) > .callout-content { font-family: ${aside}; }
/* The renvoi and the read-aloud (act-0-crew.png) are plain: a flat grey band in tight padding, and a typewriter
   passage on the paper itself with a thin grey rule on its left. No frame, no tab, no texture. */
${callout("otherscape-renvoi")} {
  border: 0;
  border-radius: 0;
  corner-shape: round;
  clip-path: none;
  padding: 0.3em 0.5em;
  background: ${o("aside")};
  --text-normal: ${o("aside-text")};
  --bold-color: ${o("aside-text")};
  --italic-color: ${o("aside-text")};
  color: ${o("aside-text")};
  line-height: 1.3;
}
${callout("otherscape-read-aloud")} {
  border: 0;
  border-radius: 0;
  corner-shape: round;
  clip-path: none;
  border-inline-start: 1px solid ${o("read-aloud-line")};
  padding: 0.1em 0 0.1em 0.7em;
  background: none;
  --text-normal: ${o("read-aloud-text")};
  --bold-color: ${o("read-aloud-text")};
  --italic-color: ${o("read-aloud-text")};
  color: ${o("read-aloud-text")};
  font-family: ${typewriter};
  font-size: ${readAloudSize};
  line-height: 1.4;
  text-align: justify;
  hyphens: auto;
}
${callout("otherscape-renvoi")} > .callout-title,
${callout("otherscape-read-aloud")} > .callout-title { display: none; }
${callout("otherscape-renvoi")} > .callout-content { --p-spacing: 0; }
${callout("otherscape-renvoi")} > .callout-content > p { margin-block: 0; }
${callout("otherscape-read-aloud")} > .callout-content { --p-spacing: 0.9em; }
${callout("otherscape-read-aloud")} > .callout-content > p { margin-block: 0 0.9em; }
${callout("otherscape-read-aloud")} > .callout-content > p:last-child { margin-bottom: 0; }
/* Chapter opening (chapter-title.jpg): the pack's metro-emblem image, masked in the ink, above the title centred
   in the display face; the body is a lead in the first column, the rest in the second. Without the image the
   emblem is simply absent. */
${callout("otherscape-chapter")} {
  margin-block: 1.5em;
  border: 0;
  border-radius: 0;
  corner-shape: round;
  clip-path: none;
  padding: 0;
  background: none;
  --text-normal: inherit;
  --bold-color: inherit;
  --italic-color: inherit;
  color: var(--text-normal);
  column-span: all;
}
${callout("otherscape-chapter")} > .callout-title {
  --callout-title-color: currentColor;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25em;
  color: inherit;
  font-family: ${title};
  font-synthesis-weight: none;
  font-size: 3em;
  font-style: normal;
  font-weight: ${black};
  line-height: 0.9;
  text-align: center;
  text-transform: uppercase;
}
${callout("otherscape-chapter")} > .callout-title::before {
  content: "";
  width: 1.1em;
  aspect-ratio: 100 / 92;
  background-color: currentColor;
  -webkit-mask: var(--brumes-image-metro-emblem, linear-gradient(transparent, transparent)) center / contain no-repeat;
  mask: var(--brumes-image-metro-emblem, linear-gradient(transparent, transparent)) center / contain no-repeat;
}
${callout("otherscape-chapter")} > .callout-title > :is(.callout-icon, .callout-fold) { display: none; }
${callout("otherscape-chapter")} > .callout-content {
  margin-top: 1em;
  columns: 2 12rem;
  column-gap: 2rem;
}
${callout("otherscape-chapter")} > .callout-content > p:first-child {
  margin-top: 0;
  break-after: column;
  color: ${o("lead")};
  font-family: ${lead};
  font-size: ${leadSize};
  line-height: 1.25;
  text-align: start;
}
${callout("otherscape-renvoi")} > .callout-content > p + p {
  margin: 0.25em -0.5em 0;
  padding: 0.25em 0.5em 0;
  border-top: 1px solid color-mix(in srgb, ${o("aside")} 40%, white);
}
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
