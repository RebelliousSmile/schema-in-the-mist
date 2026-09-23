import assert from "node:assert/strict";
import fs from "node:fs";
import { requireAccessibleNoteTokens, requireCompleteLinkStateFamilies, resolveNoteTokens } from "./require-contrast.js";

function fixture(name: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(`test/fixtures/handbook-contrast/${name}.json`, "utf8")) as Record<string, unknown>;
}

const inherited = fixture("inherited-low-contrast");
assert.throws(
  () => requireAccessibleNoteTokens(resolveNoteTokens(inherited.base as Record<string, string>, inherited.variant as Record<string, string>), "inherited-low-contrast"),
  /--link-color.*below 4\.5:1/,
);
assert.throws(
  () => requireCompleteLinkStateFamilies(fixture("incomplete-link-state") as Record<string, string>, "incomplete-link-state"),
  /must override --link-color, --link-color-hover, and --link-color-active/,
);

console.log("✓ Handbook contrast regression fixtures reject inherited low contrast and incomplete link states.");
