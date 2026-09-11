import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

export const ThemeTypeEnum = z
  .enum(["self", "mythos", "noise", "crew"])
  .meta({
    description:
      "Which kind of theme this is. The three character theme types, plus `crew` for a Crew Theme, which the sheet prints with the identical anatomy — power tags, weakness tags, one Quest line, an Upgrade track and a Decay track — and so is filed here rather than in a target of its own. Same four values, same spelling as on an :Otherscape Theme Kit, so a kit and the theme built from it agree without a mapping table. Required and deliberately left without a default: none of the four is a neutral starting value.",
    examples: ["self", "mythos", "noise", "crew"],
  });

export const PublicationTypeEnum = z
  .enum(["official", "third_party", "cauldron", "homebrew"])
  .meta({
    description:
      "Where this content comes from. Use to help downstream tools filter sources.",
    examples: ["official", "homebrew"],
  });

/** =========================
 *  Subschemas
 *  ========================= */

export const MetaSchema = z
  .strictObject({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Theme's source to aid cataloging and tooling.",
      examples: ["official", "homebrew"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Theme appears.",
        examples: [
          "Metro:Otherscape - Core Book",
          "Tokyo:Otherscape - Setting Book",
        ],
      }),
    authors: z
      .array(
        z
          .string()
          .trim()
          .regex(/\S/, "Must contain a non-whitespace character")
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
    page: z.number()
      .int()
      .min(1)
      .optional()
      .meta({
        description: "Page number (if relevant to the source).",
        examples: [96, 118],
      }),
  })
  .meta({
    description: "Attribution and cataloging fields for the Theme's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const OtherscapeThemeSchema = z
  .strictObject({
    title_tag: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Title tag is required")
      .default("Untitled Theme")
      .meta({
        description:
          "The theme's title tag, written at the top of the card, which is also how the theme is named. Spelled `title_tag` as on an :Otherscape Theme Kit and on a Legend in the Mist Story Theme, so the value copies across unchanged in both directions. Written without the surrounding braces of the inline tag syntax, and not repeated inside `power_tags`.",
        examples: [
          "The Debt I Never Paid",
          "Chrome Under The Skin",
          "Sworn To The Old Signal",
        ],
      }),
    theme_type: ThemeTypeEnum,
    category: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Themebook this Theme was built from, held as the name printed in the block header. Kept a free string rather than a closed set, so that homebrew themebooks remain expressible and so that every setting book's additions stay writable on the day they ship. Same field, same spelling as on an :Otherscape Theme Kit, so the value copies across unchanged.",
        examples: [
          "EXPERTISE",
          "AFFILIATION",
          "AUGMENTATION",
          "ARTIFACT",
          "PERSONALITY",
        ],
      }),
    power_tags: z
      .array(
        z
          .string()
          .trim()
          .regex(/\S/, "Must contain a non-whitespace character")
          .min(1, "A power tag cannot be empty")
          .meta({
            description:
              "One tag this Theme grants, which the character invokes to be Favored. Written without the surrounding braces of the inline tag syntax; a renderer adds them.",
            examples: ["knows who to ask", "still has the old key"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Theme grants, in the order they are written on the card. A played theme carries the ones the character chose out of what the kit offered, not the whole kit list, and gains more as the Upgrade track pays out. The title tag is not repeated here.",
      }),
    weakness_tags: z
      .array(
        z
          .string()
          .trim()
          .regex(/\S/, "Must contain a non-whitespace character")
          .min(1, "A weakness tag cannot be empty")
          .meta({
            description:
              "One tag this Theme turns against the character, which the MC invokes to Imperil them. Written without the surrounding braces and without the leading marker of the inline weakness syntax; belonging to this field is what makes it a weakness.",
            examples: ["cannot leave it alone", "owes the wrong people"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Theme turns against the character, in the order they are written on the card.",
      }),
    quest: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The one Quest line this Theme carries, whatever the sheet labels it: Identity on a Self theme, Ritual on a Mythos theme, Itch on a Noise theme. One field rather than three mutually exclusive ones, and deliberately not a union at the root: the README announces editor autocomplete for JSON and TOML, which a root-level `oneOf` is what editor schema support handles least evenly. The cost is that the field name does not say which of the three labels it holds — read `theme_type` for that. Spelled `quest` as on an :Otherscape Theme Kit and on a Legend in the Mist Story Theme. Supports inline Markdown.",
        examples: [
          "Pay back what I took, to whoever is left to collect it.",
          "Find out what the Source wanted with you.",
        ],
      }),
    upgrade: z.number()
      .int()
      .min(0)
      .max(3)
      .optional()
      .meta({
        description:
          "Number of Upgrade marks currently on this Theme's track. The sheet prints three boxes: the third one is spent to improve the Theme and the track goes back to empty, so the value never stands above 3. Counts what a Legend in the Mist Story Theme calls `improve`, renamed because Upgrade is the word the :Otherscape sheet prints.",
        examples: [0, 1, 3],
      }),
    decay: z.number()
      .int()
      .min(0)
      .max(3)
      .optional()
      .meta({
        description:
          "Number of Decay marks currently on this Theme's track. The sheet prints three boxes: the third one replaces the Theme with another, so the value never stands above 3. Counts what a Legend in the Mist Story Theme calls `abandon`, renamed because Decay is the word the :Otherscape sheet prints.",
        examples: [0, 2, 3],
      }),
    meta: MetaSchema.optional().meta({
      description: "Attribution and cataloging fields for the Theme's origin.",
    }),
  })
  .meta({
    description:
      ":Otherscape - Theme, one of the themes a character is built from, holding its title tag, the tags it grants, the tags it turns against the character, the Quest it carries and the state of its two tracks. It carries no `level` and no `milestone`, and the absence is measured rather than pending: :Otherscape has no theme tiers — nothing answers to origin, adventure or greatness — and no milestone track anywhere in its books. This is the sharpest divergence from `litm/story-theme`, which carries both.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type ThemeType = z.infer<typeof ThemeTypeEnum>;
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type ThemeMeta = z.infer<typeof MetaSchema>;
export type OtherscapeTheme = z.infer<typeof OtherscapeThemeSchema>;
