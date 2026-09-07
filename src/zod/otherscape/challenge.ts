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

export const LimitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Limit name is required")
      .meta({
        description:
          "What has to be done to overcome the Challenge along this vector. A polar Limit is printed as a single label with both poles joined by a slash, and is stored here exactly as printed (see `is_polar`).",
        examples: ["Convince", "Disable", "catch/outrun"],
      }),
    level: z.coerce
      .number()
      .int()
      .min(1)
      .max(6)
      .default(1)
      .meta({
        description:
          "Tier that relevant statuses need to reach in order to overcome the Challenge along this Limit.",
        examples: [2, 3, 4],
      }),
    is_polar: z
      .boolean()
      .default(false)
      .meta({
        description:
          "If true, `name` holds a polar Limit: two opposed poles joined by a slash, such as `catch/outrun`, where progress towards one pole undoes progress towards the other. Kept as one flat string rather than two sub-fields, because that is how the books print it and how it survives the TOML encoding intact.",
        examples: [true, false],
      }),
    is_progress: z
      .boolean()
      .default(false)
      .meta({
        description:
          "If true, this Limit acts as a progress track that builds up towards a special outcome rather than ending the Challenge (see `on_max`).",
        examples: [true, false],
      }),
    on_max: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "What happens when a progress Limit fills up (see `is_progress`). Left out on an ordinary Limit. Supports inline Markdown.",
        examples: [
          "The runner uploads the payload and every camera in the district turns towards the Crew (**Exposure**).",
          "Give {burned-3} to whoever is still holding the deck.",
        ],
      }),
  })
  .meta({
    description:
      "One way the Challenge can be overcome, by reaching the right tier of the right kind of status. :Otherscape has no immunity flag on a Limit, so there is none here.",
  });

export const SpecialSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Special name is required")
      .meta({
        description: "Name of the Special.",
        examples: ["Chrome Reflexes", "Corporate Backup", "Ghost in the Feed"],
      }),
    description: z
      .string()
      .trim()
      .min(1, "Special description is required")
      .meta({
        description:
          'Trigger ("When this happens...") and effect ("... do this.") of the Special. Supports inline Markdown.',
        examples: [
          "The first time the runner is Mythos-touched in a scene, remove one tier from any {tracked-} status on it.",
          "Whenever the Crew stops to argue, the runner moves one step closer to the roof.",
        ],
      }),
  })
  .meta({
    description:
      "A rule unique to this Challenge that Threats, Consequences, tags, statuses and Limits cannot express. The books call these Specials; the Legend in the Mist schema calls the same slot `special_features`, so the two names do not copy across.",
  });

export const ThreatSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Threat name is required")
      .meta({
        description:
          "Action the Challenge is beginning to take, prompting the Crew to react before it lands.",
        examples: ["Call it in", "Spike the deck", "Break for the roof"],
      }),
    description: z
      .string()
      .trim()
      .min(1, "Threat description is required")
      .meta({
        description:
          "Concise text elaborating how this Threat looks or escalates. Supports inline Markdown.",
        examples: [
          "Thumbs a panic stud and lets the arcology answer for it",
          "Pushes a hostile daemon back down the line the Crew came up",
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
              "Give {made-2} to whoever spoke last.",
              "The lift doors seal ({locked-in-3}).",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "What this Threat can cost. Deliberately optional, unlike the Legend in the Mist Challenge where the list is required: :Otherscape prints standalone Threats as well as Threats paired with their own Consequences, and a standalone Threat has no list of its own. Do not harmonise it back to a required list.",
      }),
  })
  .meta({
    description:
      "A reusable action the Challenge can take, with the outcomes it carries when it carries its own.",
  });

export const MetaSchema = z
  .object({
    publication_type: PublicationTypeEnum.default("homebrew").meta({
      description:
        "Classifies the Challenge's source to aid cataloging and tooling.",
      examples: ["official", "homebrew"],
    }),
    source: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Source title (book, supplement, PDF) where this Challenge appears.",
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
        examples: [212, 268],
      }),
  })
  .meta({
    description: "Attribution and cataloging fields for the Challenge's origin.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const OtherscapeChallengeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Challenge name is required")
      .default("Untitled Challenge")
      .meta({
        description: "The name/title of the Challenge.",
        examples: [
          "Chrome Vulture Runner",
          "Arcology Doorman",
          "Debt Collector",
        ],
      }),
    description: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "Short MC-facing summary of what this Challenge is and how it behaves. One string rather than a list of lines: paragraph breaks are carried by newlines, as on the Legend in the Mist Challenge. Supports inline Markdown.",
        examples: [
          "A courier who runs the arcology's outer skin on borrowed legs, carrying whatever the middle floors would rather not put on the network.",
        ],
      }),
    scale: z.coerce
      .number()
      .int()
      .optional()
      .meta({
        description:
          "How large this Challenge is compared to a person, as a printed property of the entity rather than an effect applied in play. Left out entirely on a person-sized Challenge, which is what absent already means, so there is no default of `0` to invent.",
        examples: [1, 2, 3],
      }),
    tags_and_statuses: z
      .array(
        z
          .string()
          .trim()
          .min(1, "A tag or status cannot be empty")
          .meta({
            description:
              "One story tag or status the Challenge owns upon entering the scene. Supports inline Markdown.",
            examples: ["{wall-running legs}", "{alert-2}", "{corporate ID}"],
          }),
      )
      .optional()
      .meta({
        description:
          "The Challenge's features and its condition upon entering the scene. Spelled exactly as in the Legend in the Mist Challenge, because it holds the same thing and an identical spelling is what lets a value move between the two games without a mapping table. Supports inline Markdown.",
      }),
    limits: z.array(LimitSchema).optional().meta({
      description:
        "The ways this Challenge can be overcome, each with the tier a status has to reach.",
    }),
    specials: z.array(SpecialSchema).optional().meta({
      description:
        "Rules unique to this Challenge, which Threats, Consequences, tags, statuses and Limits cannot express.",
    }),
    threats: z.array(ThreatSchema).optional().meta({
      description:
        "The typical actions of the Challenge, each with the Consequences it carries when it carries its own.",
    }),
    general_consequences: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Consequence cannot be empty")
          .meta({
            description:
              "Outcome the Challenge can deliver when a Crew member's action generates Consequences, regardless of which Threat is in play. Supports inline Markdown.",
            examples: [
              "Give {winded-1} to whoever took the stairs.",
              "The runner is gone over the parapet and the trail is cold (**Exposure**).",
            ],
          }),
      )
      .optional()
      .meta({
        description:
          "What the Challenge can cost regardless of Threat, as opposed to `threats[].consequences`, which belongs to one Threat alone. Named `general_consequences` for the same reason the Legend in the Mist Challenge renamed it: to stop the two lists colliding.",
      }),
    meta: MetaSchema.optional().meta({
      description:
        "Attribution and cataloging fields for the Challenge's origin.",
    }),
  })
  .meta({
    description:
      ":Otherscape - Challenge profile, used to represent the people, machines and situations that stand between a Crew and what it wants.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type PublicationType = z.infer<typeof PublicationTypeEnum>;
export type Limit = z.infer<typeof LimitSchema>;
export type Special = z.infer<typeof SpecialSchema>;
export type Threat = z.infer<typeof ThreatSchema>;
export type ChallengeMeta = z.infer<typeof MetaSchema>;
export type OtherscapeChallenge = z.infer<typeof OtherscapeChallengeSchema>;
