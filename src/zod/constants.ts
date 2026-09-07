import { ZodObject } from "zod";
import { LegendInTheMistChallengeSchema } from "./legend-in-the-mist/challenge";
import { LegendInTheMistStoryThemeSchema } from "./legend-in-the-mist/story-theme";
import { LegendInTheMistThemeKitSchema } from "./legend-in-the-mist/theme-kit";
import { LegendInTheMistJourneySchema } from "./legend-in-the-mist/journey";
import { CityOfMistDangerSchema } from "./city-of-mist/danger";
import { OtherscapeChallengeSchema } from "./otherscape/challenge";
import { OtherscapePowerSetSchema } from "./otherscape/power-set";
import { OtherscapeThemeKitSchema } from "./otherscape/theme-kit";
import { OtherscapeThemeSchema } from "./otherscape/theme";
import { OtherscapeCharacterTropeSchema } from "./otherscape/character-trope";

type Game = {
  name: string;
  folder: string;
  abbr: string;
};

type GameDictionary = {
  [index: string]: Game;
};

type SchemaTarget = {
  name: string;
  zod: ZodObject;
  game: Game;
};

export const GAMES: GameDictionary = {
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
};

export const TARGETS: Array<SchemaTarget> = [
  {
    zod: LegendInTheMistChallengeSchema,
    game: GAMES.litm,
    name: "challenge",
  },
  {
    zod: LegendInTheMistStoryThemeSchema,
    game: GAMES.litm,
    name: "story-theme",
  },
  {
    zod: LegendInTheMistThemeKitSchema,
    game: GAMES.litm,
    name: "theme-kit",
  },
  {
    zod: LegendInTheMistJourneySchema,
    game: GAMES.litm,
    name: "journey",
  },
  {
    zod: CityOfMistDangerSchema,
    game: GAMES.com,
    name: "danger",
  },
  {
    zod: OtherscapeChallengeSchema,
    game: GAMES.otherscape,
    name: "challenge",
  },
  {
    zod: OtherscapePowerSetSchema,
    game: GAMES.otherscape,
    name: "power-set",
  },
  {
    zod: OtherscapeThemeKitSchema,
    game: GAMES.otherscape,
    name: "theme-kit",
  },
  {
    zod: OtherscapeThemeSchema,
    game: GAMES.otherscape,
    name: "theme",
  },
  {
    zod: OtherscapeCharacterTropeSchema,
    game: GAMES.otherscape,
    name: "character-trope",
  },
];
