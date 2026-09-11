import type { z } from "zod";
import { createJsonCodec } from "./codecs/json.js";
import { createTomlCodec } from "./codecs/toml.js";
import { CityOfMistCustomMoveSchema } from "./zod/city-of-mist/custom-move.js";
import { CityOfMistDangerSchema } from "./zod/city-of-mist/danger.js";
import { CityOfMistThemeCardSchema } from "./zod/city-of-mist/theme-card.js";
import { CityOfMistThemeKitSchema } from "./zod/city-of-mist/theme-kit.js";
import { LegendInTheMistChallengeSchema } from "./zod/legend-in-the-mist/challenge.js";
import { LegendInTheMistJourneySchema } from "./zod/legend-in-the-mist/journey.js";
import { LegendInTheMistStoryThemeSchema } from "./zod/legend-in-the-mist/story-theme.js";
import { LegendInTheMistThemeKitSchema } from "./zod/legend-in-the-mist/theme-kit.js";
import { OtherscapeChallengeSchema } from "./zod/otherscape/challenge.js";
import { OtherscapeCharacterTropeSchema } from "./zod/otherscape/character-trope.js";
import { OtherscapeLoadoutItemSchema } from "./zod/otherscape/loadout-item.js";
import { OtherscapePowerSetSchema } from "./zod/otherscape/power-set.js";
import { OtherscapeThemeSchema } from "./zod/otherscape/theme.js";
import { OtherscapeThemeKitSchema } from "./zod/otherscape/theme-kit.js";

export {
  CONTRACT_VERSION,
  SCHEMA_RELEASE_TAG,
  TOML_VERSION,
  assertCompatiblePackageVersion,
} from "./contract-version.js";
export { createJsonCodec, type JsonCodec } from "./codecs/json.js";
export { createTomlCodec, type TomlCodec } from "./codecs/toml.js";
export {
  GAMES,
  TARGETS,
  TARGET_BY_KEY,
  type Game,
  type GameAbbreviation,
  type GameFolder,
  type MistEngineDocumentTarget,
  type SchemaTarget,
} from "./zod/constants.js";

export {
  CityOfMistCustomMoveSchema,
  CityOfMistDangerSchema,
  CityOfMistThemeCardSchema,
  CityOfMistThemeKitSchema,
  LegendInTheMistChallengeSchema,
  LegendInTheMistJourneySchema,
  LegendInTheMistStoryThemeSchema,
  LegendInTheMistThemeKitSchema,
  OtherscapeChallengeSchema,
  OtherscapeCharacterTropeSchema,
  OtherscapeLoadoutItemSchema,
  OtherscapePowerSetSchema,
  OtherscapeThemeSchema,
  OtherscapeThemeKitSchema,
};

export type { CityOfMistCustomMove } from "./zod/city-of-mist/custom-move.js";
export type { CityOfMistDanger } from "./zod/city-of-mist/danger.js";
export type { CityOfMistThemeCard } from "./zod/city-of-mist/theme-card.js";
export type { CityOfMistThemeKit } from "./zod/city-of-mist/theme-kit.js";
export type { LegendInTheMistChallenge } from "./zod/legend-in-the-mist/challenge.js";
export type { LegendInTheMistJourney } from "./zod/legend-in-the-mist/journey.js";
export type { LegendInTheMistStoryTheme } from "./zod/legend-in-the-mist/story-theme.js";
export type { LegendInTheMistThemeKit } from "./zod/legend-in-the-mist/theme-kit.js";
export type { OtherscapeChallenge } from "./zod/otherscape/challenge.js";
export type { OtherscapeCharacterTrope } from "./zod/otherscape/character-trope.js";
export type { OtherscapeLoadoutItem } from "./zod/otherscape/loadout-item.js";
export type { OtherscapePowerSet } from "./zod/otherscape/power-set.js";
export type { OtherscapeTheme } from "./zod/otherscape/theme.js";
export type { OtherscapeThemeKit } from "./zod/otherscape/theme-kit.js";

export type MistDocumentCodec<Schema extends z.ZodType> = {
  readonly schema: Schema;
  parseToml(text: string): z.output<Schema>;
  stringifyToml(value: z.input<Schema>): string;
  parseJson(text: string): z.output<Schema>;
  stringifyJson(value: z.input<Schema>): string;
};

function createDocumentCodec<Schema extends z.ZodType>(
  schema: Schema,
): MistDocumentCodec<Schema> {
  return { ...createTomlCodec(schema), ...createJsonCodec(schema) };
}

export const cityOfMistCustomMoveCodec = createDocumentCodec(CityOfMistCustomMoveSchema);
export const cityOfMistDangerCodec = createDocumentCodec(CityOfMistDangerSchema);
export const cityOfMistThemeCardCodec = createDocumentCodec(CityOfMistThemeCardSchema);
export const cityOfMistThemeKitCodec = createDocumentCodec(CityOfMistThemeKitSchema);
export const legendInTheMistChallengeCodec = createDocumentCodec(LegendInTheMistChallengeSchema);
export const legendInTheMistJourneyCodec = createDocumentCodec(LegendInTheMistJourneySchema);
export const legendInTheMistStoryThemeCodec = createDocumentCodec(LegendInTheMistStoryThemeSchema);
export const legendInTheMistThemeKitCodec = createDocumentCodec(LegendInTheMistThemeKitSchema);
export const otherscapeChallengeCodec = createDocumentCodec(OtherscapeChallengeSchema);
export const otherscapeCharacterTropeCodec = createDocumentCodec(OtherscapeCharacterTropeSchema);
export const otherscapeLoadoutItemCodec = createDocumentCodec(OtherscapeLoadoutItemSchema);
export const otherscapePowerSetCodec = createDocumentCodec(OtherscapePowerSetSchema);
export const otherscapeThemeCodec = createDocumentCodec(OtherscapeThemeSchema);
export const otherscapeThemeKitCodec = createDocumentCodec(OtherscapeThemeKitSchema);

export const MIST_ENGINE_CODECS = {
  "city-of-mist/custom-move": cityOfMistCustomMoveCodec,
  "city-of-mist/danger": cityOfMistDangerCodec,
  "city-of-mist/theme-card": cityOfMistThemeCardCodec,
  "city-of-mist/theme-kit": cityOfMistThemeKitCodec,
  "legend-in-the-mist/challenge": legendInTheMistChallengeCodec,
  "legend-in-the-mist/journey": legendInTheMistJourneyCodec,
  "legend-in-the-mist/story-theme": legendInTheMistStoryThemeCodec,
  "legend-in-the-mist/theme-kit": legendInTheMistThemeKitCodec,
  "otherscape/challenge": otherscapeChallengeCodec,
  "otherscape/character-trope": otherscapeCharacterTropeCodec,
  "otherscape/loadout-item": otherscapeLoadoutItemCodec,
  "otherscape/power-set": otherscapePowerSetCodec,
  "otherscape/theme": otherscapeThemeCodec,
  "otherscape/theme-kit": otherscapeThemeKitCodec,
} as const;
