import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

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

export const ImprovementSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Improvement name is required")
      .meta({
        description:
          "Short label for the improvement, as it is written on the themebook.",
        examples: ["Second Sight", "Herbs for every ailment", "Known by name"],
      }),
    effect: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What taking this improvement does. Supports inline Markdown. Left out when the themebook states only the label.",
        examples: [
          "Add a power tag describing what the spirits tell you.",
          "Once per session, treat a failed roll as a partial success.",
        ],
      }),
  })
  .meta({
    description:
      "One improvement a Hero can take from this Theme Kit, holding its label and, when the themebook spells it out, its effect.",
  });

export const MetaSchema = z
  .object({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Theme Kit's source to aid cataloging and tooling.",
      examples: ["official", "cauldron"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Theme Kit appears.",
        examples: [
          "Legend in the Mist - Core Book Volume I - The Player",
          "Lantern in the Mist - Sample Theme Kits",
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
    description: "Attribution and cataloging fields for the Theme Kit's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const LegendInTheMistThemeKitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Theme Kit name is required")
      .default("Untitled Theme Kit")
      .meta({
        description:
          "The Theme Kit's own name, as it is printed on the themebook page. Unlike a Story Theme's title tag, this is a label rather than a tag a Hero can invoke, so it carries no braces and is not playable.",
        examples: ["The Hedge Witch", "Sworn Blade", "Child of the Marshes"],
      }),
    category: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Themebook this Theme Kit belongs to. Kept a free string rather than a closed set, so that homebrew themebooks remain expressible. Same field, same spelling as on a Story Theme, so the value copies across unchanged.",
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
              "One tag this Theme Kit offers, which a Hero can write onto their Story Theme and then invoke to be Favored. Written without the surrounding braces of the inline tag syntax; a renderer adds them.",
            examples: ["knows which roots bite back", "welcome at every hearth"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Theme Kit suggests, in the order they are printed on the themebook. A Hero picks from them rather than taking them all.",
      }),
    weakness_tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "A weakness tag cannot be empty")
          .meta({
            description:
              "One tag this Theme Kit offers that works against the Hero, which the Narrator can invoke to Imperil them. Written without the surrounding braces and without the leading marker of the inline weakness syntax; belonging to this field is what makes it a weakness.",
            examples: ["the village fears me", "cannot leave a debt unpaid"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Theme Kit suggests turning against the Hero, in the order they are printed on the themebook.",
      }),
    quest: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The Quest this Theme Kit suggests, which a Hero makes their own when they fill the kit in. Supports inline Markdown.",
        examples: [
          "Learn the name the woods refuse to speak.",
          "Heal someone no one else would treat.",
        ],
      }),
    improvements: z
      .array(ImprovementSchema)
      .optional()
      .meta({
        description:
          "The improvement options this Theme Kit offers, in the order they are printed on the themebook. This is a list of choices a Hero can take, and is unrelated to a Story Theme's `improve` field, which counts the Improve marks currently on a track.",
      }),
    meta: MetaSchema.optional().meta({
      description: "Attribution and cataloging fields for the Theme Kit's origin.",
    }),
  })
  .meta({
    description:
      "Legend in the Mist - Theme Kit, the blank a Story Theme is filled in from, holding a themebook's suggested power tags, weakness tags, Quest and improvements before a Hero makes any of it their own.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type ThemeKitMeta = z.infer<typeof MetaSchema>;
export type ThemeKitImprovement = z.infer<typeof ImprovementSchema>;
export type LegendInTheMistThemeKit = z.infer<
  typeof LegendInTheMistThemeKitSchema
>;
