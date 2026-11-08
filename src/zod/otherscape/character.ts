import { z } from "zod";
import { createPublicationMetaSchema, PublicationTypeEnum } from "../common/publication.js";
export { PublicationTypeEnum } from "../common/publication.js";
import { OtherscapeThemeSchema } from "./theme.js";
import {
  LoadoutItemFeatureTagsSchema,
  LoadoutItemNameSchema,
  LoadoutItemWeaknessTagSchema,
} from "./loadout-item.js";

/** =========================
 *  Subschemas
 *  ========================= */

export const MetaSchema = createPublicationMetaSchema({
  publicationDescription: "Classifies the Character's source to aid cataloging and tooling.",
  publicationExamples: ["official", "homebrew"],
  sourceDescription: "Source title (book, supplement, PDF) where this Character appears.",
  sourceExamples: ["Metro:Otherscape - Demo Game"],
  pageExamples: [1, 5],
  description: "Attribution and cataloging fields for the Character's origin.",
});

/** The three character theme types: a Crew Theme belongs to the crew, not to one of the four themes of a character. */
export const CharacterThemeTypeEnum = z
  .enum(["self", "mythos", "noise"])
  .meta({
    description:
      "Which kind of theme this is, among the three a character is built from. `crew`, which `otherscape/theme` also accepts, is refused here: a Crew Theme is shared by the crew and is not one of the four themes printed on a character's sheet.",
    examples: ["self", "mythos", "noise"],
  });

export const CharacterThemeSchema = OtherscapeThemeSchema.extend({
  theme_type: CharacterThemeTypeEnum,
}).meta({
  description:
    "One of the character's themes: the very fields of an :Otherscape Theme, composed rather than copied, with `theme_type` narrowed to the three character types.",
});

export const TagComboSchema = z
  .strictObject({
    label: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "A tag combo label is required")
      .meta({
        description: "What the combo is for, as printed at the head of its column.",
        examples: ["Talk my way past security"],
      }),
    tags: z
      .array(
        z
          .string()
          .trim()
          .regex(/\S/, "Must contain a non-whitespace character")
          .min(1, "A tag cannot be empty")
          .meta({
            description:
              "One tag the combo invokes, written without the surrounding braces of the inline tag syntax; a renderer joins them with `+`.",
            examples: ["borrowed badge", "smooth talker"],
          }),
      )
      .min(1, "A tag combo invokes at least one tag")
      .meta({
        description: "The tags combined, in the order the sheet prints them.",
      }),
    power: z
      .number()
      .int()
      .min(0)
      .meta({
        description: "The Power the combo yields, printed as `POWER N`.",
        examples: [2, 3, 4],
      }),
    effect: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "A tag combo effect is required")
      .meta({
        description:
          "The effect aimed at, printed as a phrase: an action word and the status or tags it targets. Inline Markdown rather than an enumeration of actions, because setting books extend that vocabulary.",
        examples: ["**Influence** *convinced*", "**Weaken** alarm tags"],
      }),
  })
  .meta({
    description:
      "A tag combo prepared on the sheet: the tags combined, the Power obtained and the effect aimed at.",
  });

export const CharacterLoadoutItemSchema = z
  .strictObject({
    name: LoadoutItemNameSchema,
    feature_tags: LoadoutItemFeatureTagsSchema,
    weakness_tag: LoadoutItemWeaknessTagSchema,
    loaded: z
      .boolean()
      .optional()
      .meta({
        description:
          "Whether the item is loaded for the current mission. Loadout tags are burnt by default and become usable once loaded; an item without this field is read as not loaded. The whole item is loaded at once: loading a set of tags one by one is not modelled.",
        examples: [true, false],
      }),
  })
  .meta({
    description:
      "One item of the character's loadout theme: the fields of an :Otherscape Loadout Item that the sheet prints (`name`, `feature_tags`, `weakness_tag`), reused rather than copied, plus whether it is loaded.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const OtherscapeCharacterSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Name is required")
      .meta({
        description: "The character's name, printed at the head of the sheet.",
        examples: ["Vesper"],
      }),
    themes: z
      .array(CharacterThemeSchema)
      .max(4, "A character has at most four themes")
      .optional()
      .meta({
        description:
          "The character's themes, in the order the sheet prints them. At most four; fewer leaves room for a character still being built.",
      }),
    tag_combos: z
      .array(TagComboSchema)
      .optional()
      .meta({
        description: "The tag combos prepared on the sheet, in print order.",
      }),
    loadout: z
      .array(CharacterLoadoutItemSchema)
      .optional()
      .meta({
        description:
          "The character's loadout theme, one entry per item, loaded or not. A renderer sorts them into loaded and unloaded columns.",
      }),
    meta: MetaSchema.optional(),
  })
  .meta({
    description:
      ":Otherscape - Character, the lower half of a character sheet in one document: the name, up to four themes, the tag combos and the loadout. The Upgrades rule printed on the sheet is not data: it is the same for every character and is published as a label in `presentation.ts`. The blank Character Card of the core book (Essence, Crew relationships, Evolution) is a different layout and is not modelled here.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type CharacterMeta = z.infer<typeof MetaSchema>;
export type CharacterTheme = z.infer<typeof CharacterThemeSchema>;
export type TagCombo = z.infer<typeof TagComboSchema>;
export type CharacterLoadoutItem = z.infer<typeof CharacterLoadoutItemSchema>;
export type OtherscapeCharacter = z.infer<typeof OtherscapeCharacterSchema>;
