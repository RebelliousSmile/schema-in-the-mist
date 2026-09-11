import type { ZodType } from "zod";
import { LegendInTheMistChallengeSchema } from "./legend-in-the-mist/challenge";
import { LegendInTheMistStoryThemeSchema } from "./legend-in-the-mist/story-theme";
import { LegendInTheMistThemeKitSchema } from "./legend-in-the-mist/theme-kit";
import { LegendInTheMistJourneySchema } from "./legend-in-the-mist/journey";
import { CityOfMistDangerSchema } from "./city-of-mist/danger";
import { CityOfMistCustomMoveSchema } from "./city-of-mist/custom-move";
import { CityOfMistThemeKitSchema } from "./city-of-mist/theme-kit";
import { CityOfMistThemeCardSchema } from "./city-of-mist/theme-card";
import { OtherscapeChallengeSchema } from "./otherscape/challenge";
import { OtherscapePowerSetSchema } from "./otherscape/power-set";
import { OtherscapeThemeKitSchema } from "./otherscape/theme-kit";
import { OtherscapeThemeSchema } from "./otherscape/theme";
import { OtherscapeCharacterTropeSchema } from "./otherscape/character-trope";
import { OtherscapeLoadoutItemSchema } from "./otherscape/loadout-item";

export const GAMES = {
  litm: {
    name: "Legend in the Mist",
    folder: "legend-in-the-mist",
    abbr: "litm",
  },
  com: {
    name: "City of Mist",
    folder: "city-of-mist",
    abbr: "com",
  },
  otherscape: {
    name: ":Otherscape",
    folder: "otherscape",
    abbr: "otherscape",
  },
} as const;

export type GameAbbreviation = keyof typeof GAMES;
export type Game = (typeof GAMES)[GameAbbreviation];
export type GameFolder = Game["folder"];

export type MistEngineDocumentTarget =
  | "city-of-mist/custom-move"
  | "city-of-mist/danger"
  | "city-of-mist/theme-card"
  | "city-of-mist/theme-kit"
  | "legend-in-the-mist/challenge"
  | "legend-in-the-mist/journey"
  | "legend-in-the-mist/story-theme"
  | "legend-in-the-mist/theme-kit"
  | "otherscape/challenge"
  | "otherscape/character-trope"
  | "otherscape/loadout-item"
  | "otherscape/power-set"
  | "otherscape/theme"
  | "otherscape/theme-kit";

export type SchemaTarget = {
  key: MistEngineDocumentTarget;
  name: string;
  zod: ZodType;
  game: Game;
};

export const TARGETS = [
  {
    key: "legend-in-the-mist/challenge",
    zod: LegendInTheMistChallengeSchema,
    game: GAMES.litm,
    name: "challenge",
  },
  {
    key: "legend-in-the-mist/story-theme",
    zod: LegendInTheMistStoryThemeSchema,
    game: GAMES.litm,
    name: "story-theme",
  },
  {
    key: "legend-in-the-mist/theme-kit",
    zod: LegendInTheMistThemeKitSchema,
    game: GAMES.litm,
    name: "theme-kit",
  },
  {
    key: "legend-in-the-mist/journey",
    zod: LegendInTheMistJourneySchema,
    game: GAMES.litm,
    name: "journey",
  },
  {
    key: "city-of-mist/danger",
    zod: CityOfMistDangerSchema,
    game: GAMES.com,
    name: "danger",
  },
  {
    key: "city-of-mist/custom-move",
    zod: CityOfMistCustomMoveSchema,
    game: GAMES.com,
    name: "custom-move",
  },
  {
    key: "city-of-mist/theme-kit",
    zod: CityOfMistThemeKitSchema,
    game: GAMES.com,
    name: "theme-kit",
  },
  {
    key: "city-of-mist/theme-card",
    zod: CityOfMistThemeCardSchema,
    game: GAMES.com,
    name: "theme-card",
  },
  {
    key: "otherscape/challenge",
    zod: OtherscapeChallengeSchema,
    game: GAMES.otherscape,
    name: "challenge",
  },
  {
    key: "otherscape/power-set",
    zod: OtherscapePowerSetSchema,
    game: GAMES.otherscape,
    name: "power-set",
  },
  {
    key: "otherscape/theme-kit",
    zod: OtherscapeThemeKitSchema,
    game: GAMES.otherscape,
    name: "theme-kit",
  },
  {
    key: "otherscape/theme",
    zod: OtherscapeThemeSchema,
    game: GAMES.otherscape,
    name: "theme",
  },
  {
    key: "otherscape/character-trope",
    zod: OtherscapeCharacterTropeSchema,
    game: GAMES.otherscape,
    name: "character-trope",
  },
  {
    key: "otherscape/loadout-item",
    zod: OtherscapeLoadoutItemSchema,
    game: GAMES.otherscape,
    name: "loadout-item",
  },
] as const satisfies readonly SchemaTarget[];

export const TARGET_BY_KEY = Object.fromEntries(
  TARGETS.map((target) => [target.key, target]),
) as Record<MistEngineDocumentTarget, (typeof TARGETS)[number]>;
