import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

export const ThemeTypeEnum = z
  .enum(["self", "mythos", "noise", "crew"])
  .meta({
    description:
      "Which kind of theme this kit builds. The three character theme types, plus `crew` for the Crew Theme Kits, which are printed with the identical anatomy — power tags, weakness tags, one Quest line — and so are filed here rather than in a target of their own. Required and deliberately left without a default: none of the four is a neutral starting value.",
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
        "Classifies the Theme Kit's source to aid cataloging and tooling.",
      examples: ["official", "homebrew"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Theme Kit appears.",
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
    description: "Attribution and cataloging fields for the Theme Kit's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const OtherscapeThemeKitSchema = z
  .strictObject({
    title_tag: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Title tag is required")
      .default("Untitled Theme Kit")
      .meta({
        description:
          "The kit's title tag, which is also how the kit is named: the printed block is a `THEMEBOOK THEMETYPE` header followed by this tag alone on its line, and two kits sharing a header are told apart by it. There is therefore no separate `name` field — the two would always hold the same string with no rule saying which wins. Note the divergence from `litm/theme-kit`, which calls this slot `name` and maps it onto `story-theme.title_tag`; here both ends are spelled `title_tag`, so a kit and the theme built from it line up with no mapping. Written without the surrounding braces of the inline tag syntax, and not repeated inside `power_tags`.",
        examples: [
          "Back-Alley Ripperdoc",
          "Corporate Citizenship",
          "Forbidden Cult",
        ],
      }),
    theme_type: ThemeTypeEnum,
    category: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Themebook this Theme Kit belongs to, held as the name printed in the block header. Kept a free string rather than a closed set, so that homebrew themebooks remain expressible and so that every setting book's additions stay writable on the day they ship. Same field, same spelling as on an :Otherscape Theme, so the value copies across unchanged.",
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
              "One tag this Theme Kit offers, which a character can write onto their Theme and then invoke to be Favored. Written without the surrounding braces of the inline tag syntax; a renderer adds them.",
            examples: ["steady hands", "knows what the chrome costs"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Theme Kit suggests, in the order they are printed. The title tag is not repeated here, so a printed block of ten tags leaves nine in this list. A character picks from them rather than taking them all.",
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
              "One tag this Theme Kit offers that works against the character, which the MC can invoke to Imperil them. Written without the surrounding braces and without the leading marker of the inline weakness syntax; belonging to this field is what makes it a weakness.",
            examples: ["owes the wrong people", "cannot say no to a patient"],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags this Theme Kit suggests turning against the character, in the order they are printed.",
      }),
    quest: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The one Quest line this Theme Kit prints, whatever the sheet labels it: Identity on a Self theme, Ritual on a Mythos theme, Itch on a Noise theme. One field rather than three mutually exclusive ones, and deliberately not a union at the root: the README announces editor autocomplete for JSON and TOML, which a root-level `oneOf` is what editor schema support handles least evenly. The cost is that the field name does not say which of the three labels it holds — read `theme_type` for that. Spelled `quest` as on `litm/theme-kit`, so the value copies across. Supports inline Markdown.",
        examples: [
          "Keep the clinic open, whatever the district asks in return.",
          "Find out what the Source wanted with you.",
        ],
      }),
    meta: MetaSchema.optional().meta({
      description:
        "Attribution and cataloging fields for the Theme Kit's origin.",
    }),
  })
  .meta({
    description:
      ":Otherscape - Theme Kit, the blank a Theme is filled in from, holding a themebook's suggested title tag, power tags, weakness tags and Quest before a character makes any of it their own. It carries no `upgrade` and no `decay`: those hold the state of a played theme, which a blank kit does not have. It carries no `improvements` either, because Theme Specials are printed on the themebook rather than on the kit.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type ThemeType = z.infer<typeof ThemeTypeEnum>;
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type ThemeKitMeta = z.infer<typeof MetaSchema>;
export type OtherscapeThemeKit = z.infer<typeof OtherscapeThemeKitSchema>;
