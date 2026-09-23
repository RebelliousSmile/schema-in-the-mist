export type NoteTokens = Record<string, string>;

const TEXT_TOKENS = [
  "--text-normal", "--text-muted", "--text-faint", "--h1-color", "--h2-color", "--h3-color", "--h4-color", "--h5-color", "--h6-color",
  "--bold-color", "--italic-color", "--link-color", "--link-external-color", "--link-unresolved-color", "--table-header-color", "--list-marker-color", "--checkbox-color",
] as const;
const LINK_FAMILIES = [
  ["--link-color", "--link-color-hover", "--link-color-active"],
  ["--link-external-color", "--link-external-color-hover", "--link-external-color-active"],
] as const;

function luminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`expected six-digit hex colour: ${hex}`);
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(foreground: string, background: string): number {
  const [bright, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (bright + 0.05) / (dark + 0.05);
}

export function requireContrast(foreground: string, background: string, threshold = 4.5): void {
  const ratio = contrastRatio(foreground, background);
  if (ratio < threshold) throw new Error(`contrast is ${ratio.toFixed(2)}:1, below ${threshold}:1`);
}

export function resolveNoteTokens(...layers: Array<Record<string, unknown> | undefined>): NoteTokens {
  const resolved: NoteTokens = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [token, value] of Object.entries(layer)) if (typeof value === "string") resolved[token] = value;
  }
  return resolved;
}

export function requireAccessibleNoteTokens(tokens: NoteTokens, label: string): void {
  const background = tokens["--background-primary"];
  if (background === undefined) return;
  for (const token of TEXT_TOKENS) {
    const foreground = tokens[token];
    if (foreground === undefined) continue;
    try {
      requireContrast(foreground, background);
    } catch (error) {
      throw new Error(`${label} ${token} on --background-primary: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  for (const [restToken, hoverToken, activeToken] of LINK_FAMILIES) {
    const rest = tokens[restToken];
    const hover = tokens[hoverToken];
    if (rest === undefined && hover === undefined) continue;
    if (rest === undefined || hover === undefined) throw new Error(`${label} must declare both ${restToken} and ${hoverToken}`);
    try {
      requireContrast(hover, background);
    } catch (error) {
      throw new Error(`${label} ${hoverToken} on --background-primary: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (contrastRatio(hover, background) < contrastRatio(rest, background)) {
      throw new Error(`${label} ${hoverToken} must not be weaker than ${restToken}`);
    }
    const active = tokens[activeToken];
    if (active !== undefined) {
      try {
        requireContrast(active, background);
      } catch (error) {
        throw new Error(`${label} ${activeToken} on --background-primary: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (contrastRatio(active, background) < contrastRatio(rest, background)) {
        throw new Error(`${label} ${activeToken} must not be weaker than ${restToken}`);
      }
    }
  }
}

export function requireCompleteLinkStateFamilies(tokens: NoteTokens, label: string): void {
  for (const [restToken, hoverToken, activeToken] of LINK_FAMILIES) {
    const rest = tokens[restToken];
    const hover = tokens[hoverToken];
    const active = tokens[activeToken];
    if (rest === undefined && hover === undefined && active === undefined) continue;
    if (rest === undefined || hover === undefined || active === undefined) {
      throw new Error(`${label} must override ${restToken}, ${hoverToken}, and ${activeToken}`);
    }
  }
}
