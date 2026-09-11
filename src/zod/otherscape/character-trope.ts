import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

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

export const ThemeKitReferenceSchema = z
  .strictObject({
    title_tag: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Title tag is required")
      .meta({
        description:
          "The referenced Theme Kit's title tag, transcribed from the unparenthesised half of the printed line. Spelled `title_tag` rather than `name` because that is the field an :Otherscape Theme Kit actually carries, so this half of the pair is a lookup key rather than fresh vocabulary.",
        examples: ["Chipped Weapon Mastery", "Corporate Citizenship"],
      }),
    category: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Category is required")
      .meta({
        description:
          "The referenced Theme Kit's themebook, transcribed from the parenthesised half of the printed line. Needed alongside the title tag because the same title tag can appear under more than one themebook across settings, so neither half alone identifies a kit. Same field, same spelling as `category` on an :Otherscape Theme Kit — and note that it is **not** the same field as `category` on this trope, which holds a grouping of tropes instead.",
        examples: ["AUGMENTATION", "AFFILIATION", "ARTIFACT", "CYBERSPACE"],
      }),
  })
  .meta({
    description:
      "A reference to an :Otherscape Theme Kit, held as the pair the books print: title tag plus themebook. The two keys are spelled exactly as they are on `otherscape/theme-kit`, so the pair resolves against a kit record without a mapping table and without parsing parentheses.",
  });

export const MetaSchema = z
  .strictObject({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Character Trope's source to aid cataloging and tooling.",
      examples: ["official", "homebrew"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Character Trope appears.",
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
        examples: [64, 72],
      }),
  })
  .meta({
    description:
      "Attribution and cataloging fields for the Character Trope's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const OtherscapeCharacterTropeSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Name is required")
      .default("Untitled Character Trope")
      .meta({
        description:
          "The Character Trope's name, as printed under its category heading.",
        examples: ["Neon Exorcist", "Corporate Fixer", "Street Samurai"],
      }),
    category: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The heading this Character Trope is printed under, which groups tropes that play in similar territory. **This does not hold a themebook** and does not resolve against `category` on an :Otherscape Theme Kit or Theme: same word, different subject. A themebook names where a theme comes from; this names a family of characters. Where a kit reference does mean a themebook — inside `theme_kits` and `choices` — the field is spelled `category` there too, and that one *is* the themebook.",
        examples: ["ASSASSINS & SPIES", "HACKERS & FIXERS", "SOLDIERS"],
      }),
    description: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The prose that introduces this Character Trope: who they are and what kind of trouble they walk into. Supports inline Markdown; use `\\n\\n` for paragraph breaks.",
        examples: [
          "You were trained to put things back where they belong, and the things do not agree.",
        ],
      }),
    theme_kits: z
      .array(ThemeKitReferenceSchema)
      .optional()
      .meta({
        description:
          "The Theme Kits this Character Trope hands the player outright, in the order they are printed. Each is held as a title-tag-plus-themebook pair rather than a string, because the printed form — `Chipped Weapon Mastery (AUGMENTATION)` — carries two data, and reading it as one would leave a consumer parsing parentheses.",
      }),
    choices: z
      .array(ThemeKitReferenceSchema)
      .optional()
      .meta({
        description:
          "The Theme Kits printed under `Choose One:`, from which the player takes a single one. Same shape as `theme_kits` because the books print them in the identical form; what separates the two lists is that this one is picked from, not taken whole.",
      }),
    loadout: z
      .array(
        z
          .string()
          .trim()
          .regex(/\S/, "Must contain a non-whitespace character")
          .min(1, "A loadout entry cannot be empty")
          .meta({
            description:
              "One entry of the starting `Loadout:` line, transcribed as printed, parentheticals included.",
            examples: [
              "sniper rifle (requires setup) with AR sight",
              "concealed pistol (all: incriminating)",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "The gear this Character Trope starts with, transcribed from the printed `Loadout:` line one entry at a time. Plain strings, qualifiers kept inside them: the line is prose about gear rather than a list of catalog keys, and the group-wide riders it uses — `(all: incriminating)` — do not belong to any single item. These strings deliberately do **not** resolve against `otherscape/loadout-item`: a trope's loadout is a starting suggestion written in the trope's own words, while a loadout item is a catalog record, and keeping the two unlinked means neither has to wait on the other.",
      }),
    meta: MetaSchema.optional().meta({
      description:
        "Attribution and cataloging fields for the Character Trope's origin.",
    }),
  })
  .meta({
    description:
      ":Otherscape - Character Trope, the character-creation package the books print: a name under a category heading, prose, the Theme Kits it hands over, the ones it offers a choice between, and a starting loadout. It has no counterpart in Legend in the Mist, so nothing here maps onto a `litm/` target.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type ThemeKitReference = z.infer<typeof ThemeKitReferenceSchema>;
export type CharacterTropeMeta = z.infer<typeof MetaSchema>;
export type OtherscapeCharacterTrope = z.infer<
  typeof OtherscapeCharacterTropeSchema
>;
