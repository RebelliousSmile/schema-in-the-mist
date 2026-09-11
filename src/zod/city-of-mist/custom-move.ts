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

export const CustomMoveKindEnum = z
  .enum(["danger", "situational", "improvement"])
  .meta({
    description:
      "Which of the three kinds of custom move this is. A Danger move belongs to a Danger profile and fires when that Danger acts; a situational move belongs to a place, an object or a scene and fires for anyone in it; an improvement move is unlocked by a theme improvement and belongs to a player character.",
    examples: ["danger", "situational"],
  });

export const MoveTemplateEnum = z
  .enum([
    "active_shield",
    "countdown_outcome",
    "starting_status",
    "status_filter",
    "status_payload",
    "freeform",
  ])
  .meta({
    description:
      "The MC Toolkit template this move was written from, kept for the record. The five templates are writing aids, not a storage format: the trigger and the outcomes hold the prose they produced, and editing that prose afterwards does not invalidate the value. Use `freeform` for a move written without a template.",
    examples: ["active_shield", "freeform"],
  });

export const RollStatEnum = z.enum(["power", "mythos", "logos", "custom"]).meta({
  description:
    "What the roll adds. `power` is the total Power of the tags brought to bear, `mythos` and `logos` are the character's theme counts, and `custom` is anything else the move names, spelled out in `label`.",
  examples: ["power", "custom"],
});

export const OutcomeTierEnum = z
  .enum(["miss", "hit", "7-9", "10+", "12+"])
  .meta({
    description:
      "Which result of the roll this outcome answers. `hit` covers 7 and above where the move does not split 7-9 from 10+. A move need not print a `miss`: an unwritten miss resolves to a hard MC move. `12+` only exists once a theme improvement unlocks it.",
    examples: ["10+", "7-9", "miss"],
  });

/** =========================
 *  Subschemas
 *  ========================= */

export const RollSchema = z
  .strictObject({
    stat: RollStatEnum.meta({
      description: "What the roll adds to 2d6.",
      examples: ["power", "mythos"],
    }),
    label: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What a `custom` stat rolls against, written as the move names it. Ignored for the three named stats.",
        examples: [
          "the tier of the city's {war-torn} status",
          "the number of clues the crew has gathered",
        ],
      }),
    modifier: z.number()
      .int()
      .min(-4)
      .max(4)
      .optional()
      .meta({
        description:
          "A flat bonus or penalty the move applies on top of the stat.",
        examples: [-1, 1, 2],
      }),
  })
  .meta({
    description:
      "The roll a move calls for. Most custom moves are diceless and omit this entirely.",
  });

export const OutcomeSchema = z
  .strictObject({
    tier: OutcomeTierEnum.meta({
      description: "Which result this outcome answers.",
      examples: ["10+", "miss"],
    }),
    text: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Outcome text is required")
      .meta({
        description:
          "What happens at this tier, written as the books write it. Supports inline Markdown.",
        examples: [
          "you get through, but you first take {entangled-3}.",
          "the MC chooses two from the list below.",
        ],
      }),
    options: z
      .array(
        z.string().trim().regex(/\S/, "Must contain a non-whitespace character").min(1, "Option text cannot be empty").meta({
          description: "One option the tier's text points at.",
        }),
      )
      .optional()
      .meta({
        description:
          "The list a tier chooses from, when its text says 'choose two from the list below'. Leave it out for an outcome that resolves in one line.",
      }),
    pick_count: z.number()
      .int()
      .min(1)
      .optional()
      .meta({
        description:
          "How many entries of `options` this tier takes. The same list often serves several tiers with a different count each, which is why the count sits on the tier and not on the list.",
        examples: [1, 2, 3],
      }),
  })
  .meta({
    description:
      "One result of the move, tied to the tier of the roll that produces it.",
  });

export const MetaSchema = z
  .strictObject({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the move's source to aid cataloging and tooling.",
      examples: ["official", "cauldron"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this move appears.",
        examples: [
          "City of Mist: MC Toolkit",
          "City of Mist: Player's Guide",
          "Danger Workbook",
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
        examples: [134, 137, 191],
      }),
  })
  .meta({
    description:
      "Attribution and cataloging fields for the custom move's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const CityOfMistCustomMoveSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Custom move name is required")
      .default("Untitled Custom Move")
      .meta({
        description: "The name/title of the custom move.",
        examples: ["Brambles and Thorns", "War-Torn City", "Ultimate Predator"],
      }),

    kind: CustomMoveKindEnum.default("danger").meta({
      description:
        "Which of the three kinds of custom move this is (MC Toolkit p. 134).",
      examples: ["danger", "situational"],
    }),

    template: MoveTemplateEnum.default("freeform").meta({
      description:
        "The MC Toolkit template this move was written from, kept for the record.",
      examples: ["active_shield", "freeform"],
    }),

    trigger: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Custom move trigger is required")
      .meta({
        description:
          "The condition that fires the move, written in the books' 'when you...' form. This is the one field no custom move can do without: a move with no trigger never fires. Supports inline Markdown.",
        examples: [
          "When you try to get into the castle grounds of the Sleeping Beauty,",
          "When you spend a day in the war-torn city,",
        ],
      }),

    impact: z.number()
      .int()
      .min(1)
      .max(3)
      .optional()
      .meta({
        description:
          "How hard the move hits, on the one-to-three star scale the MC Toolkit prints beside each template.",
        examples: [1, 2, 3],
      }),

    roll: RollSchema.optional().meta({
      description:
        "The roll the move calls for. Most custom moves are diceless and leave this out.",
    }),

    outcomes: z
      .array(OutcomeSchema)
      .optional()
      .meta({
        description:
          "What the move produces, from zero to four tiers. A diceless move carries a single untiered outcome; a rolled move carries one per tier it distinguishes.",
      }),

    frequency: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "How often the move can fire, when the move limits itself. Prose rather than a count, because the books phrase it as fiction.",
        examples: ["Once per scene.", "Once per session, per character."],
      }),

    mc_note: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "An MC-facing aside: how to pitch the move at the table, what it is for, what it should not become. Supports inline Markdown.",
        examples: [
          "Use this to make the castle feel alive rather than to punish the players.",
        ],
      }),

    meta: MetaSchema.optional().meta({
      description:
        "Attribution and cataloging fields for the custom move's origin.",
    }),
  })
  .meta({
    description:
      "City of Mist - a standalone custom move: a condition plus its outcomes, written for a Danger, a situation or a theme improvement. Distinct from the `custom_moves` nested in a Danger profile, which squash trigger and outcome into one description string; this target keeps them apart so a move can be printed, rolled and improved on its own.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */

export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type CustomMoveKind = z.infer<typeof CustomMoveKindEnum>;
export type MoveTemplate = z.infer<typeof MoveTemplateEnum>;
export type RollStat = z.infer<typeof RollStatEnum>;
export type OutcomeTier = z.infer<typeof OutcomeTierEnum>;
export type Roll = z.infer<typeof RollSchema>;
export type Outcome = z.infer<typeof OutcomeSchema>;
export type CustomMoveMeta = z.infer<typeof MetaSchema>;
export type CityOfMistCustomMove = z.infer<typeof CityOfMistCustomMoveSchema>;
