import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

export const ThemeLevelEnum = z.enum(["origin", "adventure", "greatness"]).meta({
  description:
    "Tier of the Story Theme, which determines the themebooks it can be built from and the kind of Quest it carries.",
  examples: ["origin", "adventure", "greatness"],
});

export const PublicationTypeEnum = z
  .enum(["official", "third_party", "cauldron", "homebrew"])
  .meta({
    description:
      "Where this content comes from. Use to help downstream tools filter sources.",
    examples: ["official", "cauldron"],
  });

/** =========================
 *  Subschemas
 *  ========================= */

export const MetaSchema = z
  .object({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Story Theme's source to aid cataloging and tooling.",
      examples: ["official", "cauldron"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Story Theme appears.",
        examples: [
          "Legend in the Mist - Core Book Volume I - The Player",
          "Lantern in the Mist - Sample Story Themes",
        ],
      }),
    authors: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Author name cannot be empty")
          .meta({
            description: "One credited author name.",
            examples: ["Son of Oak", "4rtamis"],
          }),
      )
      .optional()
      .meta({
        description: "List of credited authors or contributors.",
      }),
    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional()
      .meta({
        description: "Page number (if relevant to the source).",
        examples: [64, 88, 231],
      }),
  })
  .meta({
    description:
      "Attribution and cataloging fields for the Story Theme's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const LegendInTheMistStoryThemeSchema = z
  .object({
    title_tag: z
      .string()
      .trim()
      .min(1, "Story Theme title tag is required")
      .default("Untitled Story Theme")
      .meta({
        description:
          "The Story Theme's own tag, which names it and can be invoked like any other tag. Written without the surrounding braces of the inline tag syntax.",
        examples: [
          "The Village I Left Behind",
          "Sworn to the Winter Court",
          "Blade of my Father",
        ],
      }),
    level: ThemeLevelEnum.default("origin").meta({
      description:
        "Tier this Story Theme belongs to. Origin themes describe where a Hero comes from, Adventure themes what they have gained on the road, and Greatness themes what they have become.",
      examples: ["origin", "adventure", "greatness"],
    }),
    category: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Themebook this Story Theme is built from. Kept a free string rather than a closed set, so that homebrew themebooks remain expressible.",
        examples: ["Past", "Personality", "Relic", "Destiny", "Companion"],
      }),
    power_tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "A power tag cannot be empty")
          .meta({
            description:
              "One tag the Story Theme grants, which a Hero can invoke to be Favored. Written without the surrounding braces of the inline tag syntax; a renderer adds them.",
            examples: ["stubborn as the hills", "knows every back alley"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Story Theme grants to the Hero, in the order they are written on the sheet.",
      }),
    weakness_tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "A weakness tag cannot be empty")
          .meta({
            description:
              "One tag that works against the Hero, which the Narrator can invoke to Imperil them. Written without the surrounding braces and without the leading marker of the inline weakness syntax; belonging to this field is what makes it a weakness.",
            examples: ["owes a debt", "cannot refuse a dare"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Story Theme turns against the Hero, in the order they are written on the sheet.",
      }),
    quest: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What the Hero is trying to settle through this Story Theme. Supports inline Markdown.",
        examples: [
          "Return home without being recognized.",
          "Find out who ordered the burning.",
        ],
      }),
    improve: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .meta({
        description:
          "Number of Improve marks currently on this Story Theme's track.",
        examples: [0, 1, 3],
      }),
    abandon: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .meta({
        description:
          "Number of Abandon marks currently on this Story Theme's track.",
        examples: [0, 2],
      }),
    milestone: z
      .boolean()
      .optional()
      .meta({
        description:
          "Whether this Story Theme has reached its milestone and is ready to evolve or be replaced.",
        examples: [true, false],
      }),
    meta: MetaSchema.optional().meta({
      description:
        "Attribution and cataloging fields for the Story Theme's origin.",
    }),
  })
  .meta({
    description:
      "Legend in the Mist - Story Theme, one of the themes a Hero is built from, holding its title tag, the tags it grants, the tags it turns against the Hero, and the Quest it carries.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type ThemeLevel = z.infer<typeof ThemeLevelEnum>;
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type StoryThemeMeta = z.infer<typeof MetaSchema>;
export type LegendInTheMistStoryTheme = z.infer<
  typeof LegendInTheMistStoryThemeSchema
>;
