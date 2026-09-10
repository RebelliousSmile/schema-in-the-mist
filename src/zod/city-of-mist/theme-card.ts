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
    "Which family the card belongs to, inherited from the themebook that produced it. `mythos` fades, `logos` cracks, `extra` and `crew` carry no erosion track. There is no Mist theme type here: that notion belongs to Legend in the Mist.",
  examples: ["mythos", "logos"],
});

export const ErosionKindEnum = z.enum(["fade", "crack"]).meta({
  description:
    "Which erosion the card suffers. Fade belongs to a Mythos theme, Crack to a Logos one; the two are never interchangeable, because they are eroded by opposite behaviour. A corpus elsewhere calls the same track `deterioration`; the books' own names win here.",
  examples: ["fade", "crack"],
});

export const MotivationKindEnum = z
  .enum(["mystery", "identity", "neutral"])
  .meta({
    description:
      "How this card's motivation reads. A Mystery is the question a Mythos theme keeps asking, an Identity the statement a Logos theme keeps proving. `neutral` covers the Extra and Crew cards that carry neither.",
    examples: ["mystery", "identity"],
  });

/** =========================
 *  Subschemas
 *  ========================= */

export const TrackSchema = z
  .object({
    filled: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .meta({
        description: "How many boxes are ticked right now.",
        examples: [0, 2],
      }),
    maximum: z.coerce
      .number()
      .int()
      .min(1)
      .default(3)
      .meta({
        description:
          "How many boxes the track prints. Three on every card the books show, but an improvement can widen it.",
        examples: [3, 4],
      }),
  })
  .refine((track) => track.filled <= track.maximum, {
    message: "A track cannot be filled past its maximum",
    path: ["filled"],
  })
  .meta({
    description:
      "A row of boxes on the card, ticked as play goes on. The refinement reports on `filled` rather than on the track, so an import can name the field that is out of range.",
  });

export const ErosionSchema = z
  .object({
    kind: ErosionKindEnum.meta({
      description: "Fade on a Mythos card, Crack on a Logos one.",
      examples: ["fade", "crack"],
    }),
    filled: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .meta({
        description: "How much the theme has eroded so far.",
        examples: [0, 1],
      }),
    maximum: z.coerce
      .number()
      .int()
      .min(1)
      .default(3)
      .meta({
        description: "How much erosion the theme survives before it breaks.",
        examples: [3],
      }),
  })
  .refine((track) => track.filled <= track.maximum, {
    message: "An erosion track cannot be filled past its maximum",
    path: ["filled"],
  })
  .meta({
    description:
      "The erosion track: the theme's countdown to being replaced. Absent from an Extra or a Crew card, which do not erode.",
  });

export const PowerTagSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Power tag text is required")
      .meta({
        description: "The tag as the player wrote it on the card.",
        examples: ["cards that deal themselves", "a voice under the static"],
      }),
    letter: z
      .string()
      .trim()
      .regex(/^[A-Z]$/, "A question letter is a single capital letter, A to J")
      .optional()
      .meta({
        description:
          "Which themebook question this tag answers. Optional, because a homebrew tag has no question behind it.",
        examples: ["A", "C"],
      }),
    is_burnt: z
      .boolean()
      .default(false)
      .meta({
        description:
          "Whether the tag has been burnt and is spent until it is recovered.",
        examples: [false, true],
      }),
  })
  .meta({
    description:
      "One power tag on the card. The books' rule that an extra power tag costs an extra weakness tag is a play rule, not a constraint enforced here: a card mid-play can sit between the two.",
  });

export const WeaknessTagSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Weakness tag text is required")
      .meta({
        description: "The weakness as the player wrote it on the card.",
        examples: ["it answers, then it asks", "too proud to ask"],
      }),
    letter: z
      .string()
      .trim()
      .regex(/^[A-Z]$/, "A question letter is a single capital letter, A to J")
      .optional()
      .meta({
        description:
          "Which themebook question this weakness answers. Optional, for the same reason as a power tag's.",
        examples: ["B", "D"],
      }),
    is_invoked: z
      .boolean()
      .default(false)
      .meta({
        description:
          "Whether the weakness has been invoked this session for its build-up.",
        examples: [false, true],
      }),
  })
  .meta({
    description:
      "One weakness tag on the card. Counted against the power tags by the books' rule, which the schema records rather than enforces.",
  });

export const MotivationSchema = z
  .object({
    kind: MotivationKindEnum.meta({
      description:
        "Whether the card's motivation reads as a Mystery, an Identity, or neither.",
      examples: ["mystery", "identity"],
    }),
    text: z
      .string()
      .trim()
      .min(1, "Motivation text is required")
      .meta({
        description:
          "The motivation the player wrote, the answer rather than the themebook's prompt. Supports inline Markdown.",
        examples: [
          "Who keeps answering when I ask?",
          "I am the one who stays.",
        ],
      }),
  })
  .meta({
    description:
      "The card's motivation zone, filled in. Left out entirely on a card that carries none.",
  });

export const ImprovementSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Improvement name is required")
      .meta({
        description: "The improvement's title, as the themebook names it.",
        examples: ["Second Sight", "Force of Character"],
      }),
    effect: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What the improvement does, copied onto the card so it can be read without the themebook. Supports inline Markdown.",
        examples: ["Take an additional power tag for this theme."],
      }),
    is_taken: z
      .boolean()
      .default(false)
      .meta({
        description: "Whether the player has bought it.",
        examples: [false, true],
      }),
  })
  .meta({
    description: "One improvement listed on the card, ticked once bought.",
  });

export const MetaSchema = z
  .object({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the card's source to aid cataloging and tooling.",
      examples: ["official", "cauldron"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description: "Source title where this card appears, if any.",
        examples: ["City of Mist: Player's Guide"],
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
        examples: [42],
      }),
  })
  .meta({
    description: "Attribution and cataloging fields for the card's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const CityOfMistThemeCardSchema = z
  .object({
    themebook: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The themebook the card was built from, by name. Optional, because a card can outlive the book it came from and still be played.",
        examples: ["Divination", "Personality"],
      }),

    theme_type: ThemeTypeEnum.meta({
      description:
        "Which family the card belongs to. Required and without a default: it decides the banner, the motivation's grammar and the erosion track.",
      examples: ["mythos", "logos"],
    }),

    title: z
      .string()
      .trim()
      .min(1, "Card title is required")
      .default("Untitled Theme")
      .meta({
        description: "The title the player wrote at the top of the card.",
        examples: ["The Reading I Cannot Stop", "The Oath I Swore"],
      }),

    motivation: MotivationSchema.optional().meta({
      description:
        "The card's motivation, filled in. Absent on an Extra or a Crew card.",
    }),

    attention: TrackSchema.optional().meta({
      description:
        "The attention track, which fills as the theme is played and buys improvements.",
    }),

    erosion: ErosionSchema.optional().meta({
      description:
        "The erosion track, Fade or Crack. Absent on an Extra or a Crew card, which do not erode.",
    }),

    power_tags: z
      .array(PowerTagSchema)
      .optional()
      .meta({
        description: "The power tags written on the card, in printed order.",
      }),

    weakness_tags: z
      .array(WeaknessTagSchema)
      .optional()
      .meta({
        description: "The weakness tags written on the card, in printed order.",
      }),

    improvements: z
      .array(ImprovementSchema)
      .optional()
      .meta({
        description:
          "The improvements available to this theme, ticked as they are bought. Unlike the themebook, a card lists only what it needs to: a partial list is normal.",
      }),

    meta: MetaSchema.optional().meta({
      description: "Attribution and cataloging fields for the card's origin.",
    }),
  })
  .meta({
    description:
      "City of Mist - a played theme card: a themebook's questions answered, with the tracks and the tags as they stand at the table. The blank questionnaire is the separate `theme-kit` target; this one exists on its own, because a card can be read without the themebook that produced it.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */

export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type ThemeType = z.infer<typeof ThemeTypeEnum>;
export type ErosionKind = z.infer<typeof ErosionKindEnum>;
export type MotivationKind = z.infer<typeof MotivationKindEnum>;
export type Track = z.infer<typeof TrackSchema>;
export type Erosion = z.infer<typeof ErosionSchema>;
export type PowerTag = z.infer<typeof PowerTagSchema>;
export type WeaknessTag = z.infer<typeof WeaknessTagSchema>;
export type Motivation = z.infer<typeof MotivationSchema>;
export type Improvement = z.infer<typeof ImprovementSchema>;
export type ThemeCardMeta = z.infer<typeof MetaSchema>;
export type CityOfMistThemeCard = z.infer<typeof CityOfMistThemeCardSchema>;
