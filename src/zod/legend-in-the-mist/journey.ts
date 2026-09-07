import { z } from "zod";

/** =========================
 *  Enums
 *  ========================= */

export const JourneyTypeEnum = z
  .enum(["landscape", "occasion", "undertaking"])
  .meta({
    description:
      "What kind of Journey this is. A landscape is a place the Heroes cross, an occasion is an event they pass through, an undertaking is a task they see out. Required and deliberately left without a default: the three are not variations on one starting value the way a Story Theme starts at origin, so there is nothing to pick that would not be arbitrary.",
    examples: ["landscape", "occasion", "undertaking"],
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

export const VignetteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Vignette name is required")
      .meta({
        description:
          "Short label for this moment of the Journey, as it would be read out at the table.",
        examples: [
          "The drowned mile",
          "A toll at the crossing",
          "Something keeping pace",
        ],
      }),
    trigger: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What brings this vignette into play: the condition, moment or choice that makes it happen rather than the next one. Left out when the vignette simply comes up in order. Supports inline Markdown.",
        examples: [
          "When the Heroes try to cross after dark.",
          "The first time someone spends a night without shelter.",
          "When a Hero refuses to pay the ferryman.",
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
              "Outcome this vignette can deliver when a Hero's action generates Consequences. Supports inline Markdown.",
            examples: [
              "Give {soaked-1} to whoever went in first.",
              "The path behind is gone ({lost-2}).",
              "Something takes a share of the supplies (remove a tier from {well-provisioned}).",
            ],
          }),
      )
      .min(1, "At least one Consequence is required")
      .meta({
        description:
          "What this vignette can cost, as opposed to the Journey's own list, which applies anywhere along it. A vignette that exists carries at least one. Supports inline Markdown.",
      }),
  })
  .meta({
    description:
      "One moment the Journey breaks down into, with what brings it into play and what it can cost.",
  });

export const MetaSchema = z
  .object({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Journey's source to aid cataloging and tooling.",
      examples: ["official", "cauldron"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Journey appears.",
        examples: [
          "Legend in the Mist - Core Book Volume II - The Narrator",
          "Lantern in the Mist - Sample Journeys",
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
    description: "Attribution and cataloging fields for the Journey's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const LegendInTheMistJourneySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Journey name is required")
      .default("Untitled Journey")
      .meta({
        description: "The Journey's own name, as the table would refer to it.",
        examples: [
          "The Long Road to Blackmere",
          "The Harvest Fair",
          "Raising the Sunken Bell",
        ],
      }),
    type: JourneyTypeEnum,
    description: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Narrator-facing summary of what this Journey is and what crossing it feels like. One string rather than a list of lines: paragraph breaks are carried by newlines, as on a Challenge's description. Supports inline Markdown.",
        examples: [
          "Four days of drowned road between the last inn and Blackmere, where the water is never quite where it was yesterday. Nothing here hunts the Heroes. The marsh simply does not care whether they arrive.",
          "The fair comes once a year and everyone owes someone by the end of it.",
        ],
      }),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "A tag cannot be empty")
          .meta({
            description:
              "One tag this Journey offers to whoever travels it, which can be invoked while they are in it. Written without the surrounding braces of the inline tag syntax; a renderer adds them.",
            examples: [
              "waist-deep in black water",
              "no landmark in any direction",
              "everyone is somebody's guest",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "The tags the Journey makes available while the Heroes are in it. Named plainly rather than split into power and weakness: a Journey offers its tags to whoever is there, so there is no second axis to oppose them to.",
      }),
    benefits: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What the Heroes gain by seeing this Journey through, or what completing it opens up. Supports inline Markdown.",
        examples: [
          "Anyone who reaches Blackmere on foot is owed a bed and a meal, and the marsh-folk will say so out loud.",
          "The bell rings again, and the shipping lanes reopen.",
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
              "Outcome the Journey can deliver when a Hero's action generates Consequences, regardless of which vignette they are in. Supports inline Markdown.",
            examples: [
              "The day is gone and the water is rising ({time-passes-1}).",
              "Give {footsore-2} to whoever set the pace.",
              "Something in the pack is ruined beyond drying out.",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "What the Journey can cost anywhere along it, as opposed to a vignette's own list, which belongs to that vignette alone. A Challenge draws the same distinction and names its wider list `general_consequences`; here the two lists share a name and are told apart by which level they sit at.",
      }),
    vignettes: z
      .array(VignetteSchema)
      .optional()
      .meta({
        description:
          "The moments this Journey breaks down into, in the order they are meant to come up. A Journey with none is a short Journey, but a vignette that is present carries at least one Consequence.",
      }),
    meta: MetaSchema.optional().meta({
      description: "Attribution and cataloging fields for the Journey's origin.",
    }),
  })
  .meta({
    description:
      "Legend in the Mist - Journey, what the table plays through between the places a story stops: a landscape, an occasion or an undertaking, with the tags it offers, what it can cost, and the vignettes it breaks down into.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type JourneyType = z.infer<typeof JourneyTypeEnum>;
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type JourneyMeta = z.infer<typeof MetaSchema>;
export type Vignette = z.infer<typeof VignetteSchema>;
export type LegendInTheMistJourney = z.infer<
  typeof LegendInTheMistJourneySchema
>;
