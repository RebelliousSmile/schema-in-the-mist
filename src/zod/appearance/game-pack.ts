import { z } from "zod";

/** =========================
 *  Shared identifier pattern
 *  ========================= */

/**
 * A pack identifier, a block id and a zone name all end up in a CSS class
 * name — a pack identifier also in a user's `data.json` key — so all three
 * are held to the same spelling: lowercase letters, digits, and single
 * hyphens between them.
 */
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** =========================
 *  Enums
 *  ========================= */

export const GamePolarityEnum = z.enum(["light", "dark"]).meta({
  description:
    "A polarity a game's own printed material sources. A pack names the ones it has — never derived, never invented to fill a hole — so a layer the pack does not source is simply not written rather than copied from `base`.",
  examples: ["light", "dark"],
});

/** =========================
 *  Style
 *  ========================= */

export const GameStyleTokensSchema = z
  .record(
    z.string().regex(/^--/, "A custom property name starts with --"),
    z.string(),
  )
  .meta({
    description:
      "Custom property name to value, written verbatim into the style block the plugin owns. A name without its leading `--` is not a custom property and is dropped by the reader with a once-per-session warning.",
    examples: [{ "--brumes-color-accent": "#7a5c3e" }],
  });

export const GameStyleLayerSchema = z
  .object({
    note: GameStyleTokensSchema.default({}).meta({
      description: "What dresses a note: fonts, colours, heading metrics.",
    }),
    workspace: GameStyleTokensSchema.default({}).meta({
      description:
        "What repaints the interface around it, behind the workspace toggle.",
    }),
  })
  .meta({
    description:
      "One layer of a game's style: the custom properties written for notes and for the workspace.",
  });

export const GameStyleValuesSchema = z
  .object({
    base: GameStyleLayerSchema.default({ note: {}, workspace: {} }).meta({
      description: "Applies whichever theme is active.",
    }),
    light: GameStyleLayerSchema.default({ note: {}, workspace: {} }).meta({
      description:
        "Applies on top of `base` when the vault's theme is light, and only for a game that sources a light polarity.",
    }),
    dark: GameStyleLayerSchema.default({ note: {}, workspace: {} }).meta({
      description:
        "Applies on top of `base` when the vault's theme is dark, and only for a game that sources a dark polarity.",
    }),
  })
  .meta({
    description:
      "The three layers a pack may write: the one that always applies, and the two theme-conditional ones a pack only earns by declaring the matching `polarities`.",
  });

/** =========================
 *  Assets
 *  ========================= */

export const GameFontFaceSchema = z
  .object({
    file: z
      .string()
      .trim()
      .min(1, "A font face names a file")
      .meta({
        description: "Relative to the pack's asset folder, like an image.",
        examples: ["caveat-bold.woff2"],
      }),
    weight: z.string().trim().optional().meta({
      description:
        "CSS `font-weight` for this face. Left out, the face is matched as regular.",
      examples: ["700", "bold"],
    }),
    style: z.string().trim().optional().meta({
      description: "CSS `font-style` for this face.",
      examples: ["italic"],
    }),
  })
  .meta({
    description:
      "The long form of a font face, for a family that needs a weight or a style beyond the plain regular face a bare filename gives it.",
  });

export const GameAssetsSchema = z
  .object({
    root: z.string().trim().optional().meta({
      description:
        "Vault-relative path illustrations resolve from, in place of the pack's own asset folder.",
      examples: ["assets/my-game"],
    }),
    images: z
      .record(z.string(), z.string())
      .optional()
      .meta({
        description:
          "Illustration role to file name, resolved under the pack's asset root. A role a pack leaves out is not an error: the block that asks for it degrades rather than reserving a box for an image that never comes.",
        examples: [{ "theme-card-frame": "theme-card-frame.svg" }],
      }),
    fonts: z
      .record(z.string(), z.union([z.string(), GameFontFaceSchema]))
      .optional()
      .meta({
        description:
          "Family name, as a style token spells it, to the file that carries the face. A bare string is the file for a family with a single, regular face; the long form exists for a family that needs a weight or a style.",
      }),
  })
  .meta({
    description:
      "Where a game's illustrations and fonts live in the vault, named by role rather than by file so a renderer never hardcodes an image.",
  });

/** =========================
 *  Shapes (per-block zone overrides)
 *  ========================= */

export const ZoneOverrideSchema = z
  .object({
    holds: z.string().trim().optional().meta({
      description:
        "Replacement wording for what the zone holds, in words a reader can check against the screen.",
    }),
    heading: z.string().trim().optional().meta({
      description:
        "Replacement printed heading for the zone, when it opens with one.",
      examples: ["Menaces et conséquences"],
    }),
    family: z.string().trim().optional().meta({
      description:
        "Replacement class the zone shares with its siblings, beside its own.",
    }),
    image: z.string().trim().optional().meta({
      description:
        "Replacement illustration role the zone carries, when it carries one.",
    }),
    optional: z.boolean().optional().meta({
      description:
        "True when the renderer should leave the zone out rather than drawing it empty.",
    }),
    hidden: z.boolean().optional().meta({
      description: "True to leave the zone out of the block entirely.",
    }),
  })
  .meta({
    description:
      "What a game pack may change about one zone a block already declares. Partial by construction: a field left out stays the block's own. A pack cannot add a zone the block does not have, and cannot reorder the zones — both are the block's alone.",
  });

export const ShapeOverridesSchema = z
  .record(
    z.string().regex(NAME_PATTERN, "A block id is kebab-case"),
    z.record(
      z.string().regex(NAME_PATTERN, "A zone name is kebab-case"),
      ZoneOverrideSchema,
    ),
  )
  .meta({
    description:
      "What the game changes about the blocks themselves, block id to zone name to the change. A block or a zone the pack names that the running block registry does not have is not an error at this level: it is reported once per session and otherwise ignored.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const GamePackSchema = z
  .object({
    id: z
      .string()
      .regex(
        NAME_PATTERN,
        "A pack id is lowercase letters, digits and single hyphens only",
      )
      .meta({
        description:
          "Also the CSS class suffix (`brumes--<id>`) and a key of the user's own settings file. Restricted to what is safe in both.",
        examples: ["city-of-mist", "legend-in-the-mist", "otherscape"],
      }),
    label: z
      .string()
      .trim()
      .min(1, "A label cannot be empty when present")
      .optional()
      .meta({
        description:
          "Shown in the interface. Falls back to `id` when left out, rather than to an invented literal.",
        examples: ["City of Mist", "Legend in the Mist"],
      }),
    style: GameStyleValuesSchema.default({
      base: { note: {}, workspace: {} },
      light: { note: {}, workspace: {} },
      dark: { note: {}, workspace: {} },
    }).meta({
      description:
        "The custom properties this pack writes, in up to three layers. Never CSS: the plugin turns these tokens into one style block it owns, and the stylesheet keeps only what a custom property cannot express.",
    }),
    polarities: z
      .array(GamePolarityEnum)
      .optional()
      .meta({
        uniqueItems: true,
        description:
          "The polarities the game's own material sources, in the order they are read. None, and only `base` is written. One, and it holds regardless of the vault's active theme. Two, and the vault's theme decides between `light` and `dark` on a compound selector. Left out on purpose rather than defaulted: a default here would invent a polarity indistinguishable from a sourced one.",
        examples: [["light"], ["light", "dark"]],
      }),
    assets: GameAssetsSchema.optional().meta({
      description: "Where this game's illustrations and fonts live in the vault.",
    }),
    shapes: ShapeOverridesSchema.optional().meta({
      description:
        "What this game changes about the blocks' own shapes, block by block and zone by zone. Reaches names, illustrations and whether a zone is drawn — never geometry, which stays in the renderer's own styling, and never the order of the zones, which belongs to the block.",
    }),
  })
  .meta({
    description:
      "A game pack: how a Mist Engine game presents itself, as data rather than as CSS. Who it is, which custom properties it writes, which polarities it sources, where its illustrations live, and what it changes about the blocks' own shapes. Never a fetch or a network dependency for anyone reading it: the contract is honoured by the shape of the document alone.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type GamePolarity = z.infer<typeof GamePolarityEnum>;
export type GameStyleTokens = z.infer<typeof GameStyleTokensSchema>;
export type GameStyleLayer = z.infer<typeof GameStyleLayerSchema>;
export type GameStyleValues = z.infer<typeof GameStyleValuesSchema>;
export type GameFontFace = z.infer<typeof GameFontFaceSchema>;
export type GameAssets = z.infer<typeof GameAssetsSchema>;
export type ZoneOverride = z.infer<typeof ZoneOverrideSchema>;
export type ShapeOverrides = z.infer<typeof ShapeOverridesSchema>;
export type GamePack = z.infer<typeof GamePackSchema>;
