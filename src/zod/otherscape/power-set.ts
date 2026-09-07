import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

export const PowerSetTypeEnum = z
  .enum(["self", "mythos", "noise"])
  .meta({
    description:
      "Which of the three sources this Power Set draws on. The books file every published Power Set under exactly one of these headings. Required and deliberately left without a default: none of the three is a neutral starting value, so picking one would assert something false about the other two.",
    examples: ["self", "mythos", "noise"],
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

export const SpecialSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Special name is required")
      .meta({
        description: "Name of the Special.",
        examples: ["Blood in the Water", "Feels No Wound", "Rides the Surge"],
      }),
    description: z
      .string()
      .trim()
      .min(1, "Special description is required")
      .meta({
        description:
          'Trigger ("When this happens...") and effect ("... do this.") of the Special. Supports inline Markdown.',
        examples: [
          "While it holds a status of tier 3 or higher, it ignores the first tier of any status that would slow it down.",
          "The first time someone tries to reason with it in a scene, the attempt simply does not land.",
        ],
      }),
  })
  .meta({
    description:
      "A rule the Power Set grants to whatever Challenge it is grafted onto. Copied from `otherscape/challenge` rather than imported: every target in this repo is a self-contained file, and cross-file sub-schema sharing is a repo-wide refactor deferred on issue #2.",
  });

export const ThreatSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Threat name is required")
      .meta({
        description:
          "Action the Power Set lets the Challenge begin to take, prompting the Crew to react before it lands.",
        examples: ["Go through it", "Lash out", "Refuse to stop"],
      }),
    description: z
      .string()
      .trim()
      .min(1, "Threat description is required")
      .meta({
        description:
          "Concise text elaborating how this Threat looks or escalates. Supports inline Markdown.",
        examples: [
          "Takes the shortest line to whoever is closest, through whatever is in the way",
          "Stops answering to its own name",
        ],
      }),
    consequences: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Consequence cannot be empty")
          .meta({
            description:
              "Outcome this Threat delivers when a Crew member's action generates Consequences, or when the Threat is ignored. Supports inline Markdown.",
            examples: [
              "Give {thrown-2} to whoever stood in the way.",
              "A wall stops being a wall.",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "What this Threat can cost. Optional for the same reason as on `otherscape/challenge`: the books print standalone Threats alongside Threats paired with their own Consequences.",
      }),
  })
  .meta({
    description:
      "A reusable action the Power Set adds to the Challenge it is grafted onto, with the outcomes it carries when it carries its own.",
  });

export const MetaSchema = z
  .object({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Power Set's source to aid cataloging and tooling.",
      examples: ["official", "homebrew"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Power Set appears.",
        examples: [
          "Metro:Otherscape - Core Book",
          "Cairo:Otherscape - Playtest",
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
        examples: [224, 231],
      }),
  })
  .meta({
    description: "Attribution and cataloging fields for the Power Set's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const OtherscapePowerSetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Power Set name is required")
      .default("Untitled Power Set")
      .meta({
        description: "The name/title of the Power Set.",
        examples: ["Source-Touched Berserk", "Netrunner Rig", "Old Blood"],
      }),
    type: PowerSetTypeEnum,
    description: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Short MC-facing summary of what this Power Set does to whatever carries it. One string rather than a list of lines: paragraph breaks are carried by newlines. Supports inline Markdown.",
        examples: [
          "Something older than the arcology got a grip, and now the body does what it wants with the person still inside it.",
        ],
      }),
    specials: z.array(SpecialSchema).optional().meta({
      description:
        "The rules this Power Set grants, which Threats and Consequences, tags and statuses cannot express.",
    }),
    threats: z.array(ThreatSchema).optional().meta({
      description:
        "The actions this Power Set adds to the Challenge it is grafted onto, each with the Consequences it carries when it carries its own.",
    }),
    general_consequences: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Consequence cannot be empty")
          .meta({
            description:
              "Outcome this Power Set can deliver when a Crew member's action generates Consequences, regardless of which Threat is in play. Supports inline Markdown.",
            examples: [
              "Give {rattled-1} to whoever saw it happen.",
              "Something the Crew was standing on stops holding weight.",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "What this Power Set can cost regardless of Threat, as opposed to `threats[].consequences`, which belongs to one Threat alone. Named `general_consequences` for the same reason as on `otherscape/challenge`: to stop the two lists colliding.",
      }),
    meta: MetaSchema.optional().meta({
      description: "Attribution and cataloging fields for the Power Set's origin.",
    }),
  })
  .meta({
    description:
      ":Otherscape - Power Set, a bundle of Specials, Threats and Consequences the books publish standalone and graft onto any Challenge. It carries no Scale and no Limits: those belong to the Challenge it is attached to, not to the Power Set.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type PowerSetType = z.infer<typeof PowerSetTypeEnum>;
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type Special = z.infer<typeof SpecialSchema>;
export type Threat = z.infer<typeof ThreatSchema>;
export type PowerSetMeta = z.infer<typeof MetaSchema>;
export type OtherscapePowerSet = z.infer<typeof OtherscapePowerSetSchema>;
