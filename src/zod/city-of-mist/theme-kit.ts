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

export const ThemeTypeEnum = z.enum(["mythos", "logos", "extra", "crew"]).meta({
  description:
    "Which family the themebook belongs to, which decides almost everything a card built from it prints. `mythos` is a legend breaking through, its motivation is a Mystery and its erosion track is FADE; `logos` is the ordinary life that anchors the character, its motivation is an Identity and its erosion track is CRACK; `extra` covers the loadout-style themebooks, which carry no erosion track; `crew` is the shared themebook, which prints its crew relationships in place of a motivation and has no erosion track at all. There is no Mist theme type here: that notion belongs to Legend in the Mist.",
  examples: ["mythos", "logos"],
});

export const MotivationKindEnum = z
  .enum(["mystery", "identity", "either"])
  .meta({
    description:
      "How the themebook's motivation zone is phrased. A Mystery is a question the character cannot stop asking; an Identity is a statement the character keeps proving. `either` is for the themebooks that leave the choice to the player.",
    examples: ["mystery", "identity"],
  });

export const CrewOutcomeEnum = z.enum(["help", "hurt", "either"]).meta({
  description:
    "What the crew relationship does to the crew when its scenario happens.",
  examples: ["help", "hurt"],
});

/** =========================
 *  Subschemas
 *  ========================= */

export const QuestionSchema = z
  .strictObject({
    letter: z
      .string()
      .trim()
      .regex(/^[A-Z]$/, "A question letter is a single capital letter, A to J")
      .meta({
        description:
          "The letter the books print beside the question. It travels onto the played card, where it identifies which question a tag answers.",
        examples: ["A", "B", "J"],
      }),
    text: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Question text is required")
      .meta({
        description:
          "The question itself, written as the themebook prints it. Supports inline Markdown.",
        examples: [
          "What is the one thing you are best at?",
          "What do you carry that no one else would recognise?",
        ],
      }),
    examples: z
      .array(
        z.string().trim().regex(/\S/, "Must contain a non-whitespace character").min(1, "Example cannot be empty").meta({
          description: "One suggested answer, printed in the margin.",
        }),
      )
      .optional()
      .meta({
        description:
          "The suggested answers the books print under the question, as a prompt rather than a constraint.",
      }),
  })
  .meta({
    description:
      "One lettered question of the themebook, which a player answers with a tag.",
  });

export const SelectionRuleSchema = z
  .strictObject({
    required_count: z.number()
      .int()
      .min(0)
      .default(0)
      .meta({
        description:
          "How many questions must be answered, whichever the player would rather pick. The first power question is usually required.",
        examples: [0, 1],
      }),
    chosen_count: z.number()
      .int()
      .min(0)
      .default(0)
      .meta({
        description:
          "How many further questions the player picks freely from the list.",
        examples: [1, 2],
      }),
    note: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Anything the counts cannot say, written as the themebook says it.",
        examples: [
          "Answer the first question, then two more of your choice.",
          "One extra power tag costs one extra weakness tag.",
        ],
      }),
  })
  .meta({
    description:
      "How many of a question list a player answers, and how the choice is made.",
  });

export const MotivationSchema = z
  .strictObject({
    kind: MotivationKindEnum.meta({
      description:
        "Whether this zone is written as a Mystery, as an Identity, or left to the player.",
      examples: ["mystery", "identity"],
    }),
    intro: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Motivation intro is required")
      .meta({
        description:
          "The line the themebook prints above the zone, which tells the player what to write. Supports inline Markdown.",
        examples: [
          "What is the question you cannot stop asking?",
          "Write the statement you keep proving to yourself.",
        ],
      }),
    examples: z
      .array(
        z.string().trim().regex(/\S/, "Must contain a non-whitespace character").min(1, "Example cannot be empty").meta({
          description: "One suggested motivation.",
        }),
      )
      .optional()
      .meta({
        description: "The suggested motivations printed with the zone.",
      }),
    options: z
      .array(
        z.string().trim().regex(/\S/, "Must contain a non-whitespace character").min(1, "Option cannot be empty").meta({
          description: "One motivation the player picks from a closed list.",
        }),
      )
      .optional()
      .meta({
        description:
          "A closed list to pick from, for the themebooks that offer one instead of a blank line.",
      }),
    rule: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What answering or abandoning the motivation does, when the themebook spells it out.",
        examples: [
          "When you answer this Mystery, the theme fades and you lose it.",
        ],
      }),
  })
  .meta({
    description:
      "The themebook's motivation zone: one field rather than two, because the zone is named by the theme type and its grammar changes with it.",
  });

export const CrewRelationshipSchema = z
  .strictObject({
    scenario: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Crew relationship scenario is required")
      .meta({
        description:
          "The situation the crew themebook asks the players to answer for.",
        examples: [
          "When one of us is arrested,",
          "When we disagree on where the money goes,",
        ],
      }),
    outcome: CrewOutcomeEnum.meta({
      description: "What that situation does to the crew.",
      examples: ["help", "hurt"],
    }),
  })
  .meta({
    description:
      "One crew relationship, which a Crew themebook prints in place of a motivation.",
  });

export const ImprovementSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Improvement name is required")
      .meta({
        description: "The improvement's title, as the themebook prints it.",
        examples: ["Second Sight", "Expert"],
      }),
    effect: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Improvement effect is required")
      .meta({
        description:
          "What buying the improvement does. Supports inline Markdown.",
        examples: [
          "Take an additional power tag for this theme.",
          "Unlock a custom move for this theme.",
        ],
      }),
  })
  .meta({
    description: "One improvement a player can buy for a theme built here.",
  });

export const MetaSchema = z
  .strictObject({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the themebook's source to aid cataloging and tooling.",
      examples: ["official", "cauldron"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this themebook appears.",
        examples: ["City of Mist: Player's Guide", "City of Mist: Starter Set"],
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
        examples: [78, 112],
      }),
  })
  .meta({
    description:
      "Attribution and cataloging fields for the themebook's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const CityOfMistThemeKitSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .regex(/\S/, "Must contain a non-whitespace character")
      .min(1, "Themebook name is required")
      .default("Untitled Themebook")
      .meta({
        description: "The themebook's name.",
        examples: ["Personality", "Divination", "Adaptation"],
      }),

    theme_type: ThemeTypeEnum.meta({
      description:
        "Which family this themebook belongs to. Required and without a default: a themebook with no type prints the wrong banner and the wrong erosion track.",
      examples: ["mythos", "logos"],
    }),

    keywords: z
      .array(
        z.string().trim().regex(/\S/, "Must contain a non-whitespace character").min(1, "Keyword cannot be empty").meta({
          description: "One keyword printed on the themebook's header.",
        }),
      )
      .optional()
      .meta({
        description:
          "The handful of words the themebook prints to say at a glance what it is about.",
      }),

    introduction: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The opening paragraph of the themebook, which pitches the theme to the player. Supports Markdown.",
      }),

    concept: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The one-line concept, which says what a character built on this themebook is.",
        examples: ["You are who you are, and that is enough."],
      }),

    power_tag_questions: z
      .array(QuestionSchema)
      .optional()
      .meta({
        description:
          "The lettered questions whose answers become power tags, in printed order.",
      }),

    power_tag_rule: SelectionRuleSchema.optional().meta({
      description: "How many power questions are answered, and how they are chosen.",
    }),

    weakness_tag_questions: z
      .array(QuestionSchema)
      .optional()
      .meta({
        description:
          "The lettered questions whose answers become weakness tags, in printed order.",
      }),

    weakness_tag_rule: SelectionRuleSchema.optional().meta({
      description:
        "How many weakness questions are answered, and how they are chosen.",
    }),

    extra_tags: z
      .array(
        z.string().trim().regex(/\S/, "Must contain a non-whitespace character").min(1, "Extra tag cannot be empty").meta({
          description: "One tag the themebook grants outside its questions.",
        }),
      )
      .optional()
      .meta({
        description:
          "Tags the themebook hands out directly, without a question to answer.",
      }),

    motivation: MotivationSchema.optional().meta({
      description:
        "The motivation zone. A Crew themebook leaves it out and prints its crew relationships instead.",
    }),

    title_guidance: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What the themebook tells the player to write on the card's title line.",
        examples: ["Name the part of yourself this theme is about."],
      }),

    crew_relationships: z
      .array(CrewRelationshipSchema)
      .optional()
      .meta({
        description:
          "The situations a Crew themebook asks the table to answer for. Empty on every other theme type.",
      }),

    improvements: z
      .array(ImprovementSchema)
      .length(5, "A themebook carries exactly five improvements")
      .optional()
      .meta({
        description:
          "The five improvements a theme built here can buy. Every themebook the books print carries five, no more and no fewer.",
      }),

    meta: MetaSchema.optional().meta({
      description:
        "Attribution and cataloging fields for the themebook's origin.",
    }),
  })
  .meta({
    description:
      "City of Mist - a themebook: the blank questionnaire a player fills in to build a theme, not the answers they write. The filled card is the separate `theme-card` target. Note that there is no Mist theme type in City of Mist; that notion belongs to Legend in the Mist.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */

export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type ThemeType = z.infer<typeof ThemeTypeEnum>;
export type MotivationKind = z.infer<typeof MotivationKindEnum>;
export type CrewOutcome = z.infer<typeof CrewOutcomeEnum>;
export type Question = z.infer<typeof QuestionSchema>;
export type SelectionRule = z.infer<typeof SelectionRuleSchema>;
export type Motivation = z.infer<typeof MotivationSchema>;
export type CrewRelationship = z.infer<typeof CrewRelationshipSchema>;
export type Improvement = z.infer<typeof ImprovementSchema>;
export type ThemeKitMeta = z.infer<typeof MetaSchema>;
export type CityOfMistThemeKit = z.infer<typeof CityOfMistThemeKitSchema>;
