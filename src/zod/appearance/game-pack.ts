import { z } from "zod";

/** =========================
 *  Primitives
 *  ========================= */

export const GamePackIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "A game identifier is lowercase letters and digits, joined by single hyphens",
  )
  .meta({
    description:
      "The game's identifier. It is also a CSS class suffix and a key stored in a reader's own settings, so it is restricted to what is safe in both: lowercase letters, digits, and single hyphens between them. Renaming it is a migration, not an edit.",
    examples: ["city-of-mist", "legend-in-the-mist", "otherscape"],
  });

export const CustomPropertyNameSchema = z
  .string()
  .trim()
  .regex(
    /^--[A-Za-z0-9_-]+$/,
    "A token name is a CSS custom property, starting with two hyphens",
  )
  .meta({
    description:
      "A CSS custom property name, written with its two leading hyphens. A reader copies it verbatim, so a name it does not recognise costs nothing: the property is simply never read.",
    examples: ["--background-primary", "--h1-font", "--brumes-theme-mythos"],
  });

export const TokensSchema = z
  .record(CustomPropertyNameSchema, z.string().trim().min(1))
  .meta({
    description:
      "Custom property names to the values they take. This is the whole of what a pack says about colour and type: no selector, no rule, no stylesheet. A renderer turns the record into one declaration block and scopes it by the game itself.",
    examples: [{ "--text-normal": "#12161B", "--h1-size": "2.6em" }],
  });

/** =========================
 *  Style
 *  ========================= */

export const StyleLayerSchema = z
  .object({
    note: TokensSchema.optional().meta({
      description:
        "What dresses the document: fonts, colours, heading metrics. Always applied when the game is active.",
    }),
    workspace: TokensSchema.optional().meta({
      description:
        "What repaints the interface around the document. Kept apart from `note` because a reader may want a game's pages without its window, and the two are toggled separately.",
    }),
  })
  .meta({
    description:
      "One set of tokens, split by what it dresses. Both slots are optional: a layer that names neither is the same as no layer at all.",
  });

export const StyleSchema = z
  .object({
    base: StyleLayerSchema.optional().meta({
      description:
        "Applies whichever theme is active. Geometry, typography and anything a game keeps identical by day and by night belong here rather than being written twice.",
    }),
    light: StyleLayerSchema.optional().meta({
      description: "Applies over `base` when the light theme is active.",
    }),
    dark: StyleLayerSchema.optional().meta({
      description:
        "Applies over `base` when the dark theme is active. A game that declares nothing here has no night of its own and borrows the reader's theme.",
    }),
  })
  .meta({
    description:
      "The game's tokens, by theme variant. `base` first, then the variant, so a value declared in both wins in the variant.",
  });

/** =========================
 *  Assets
 *  ========================= */

export const FontFaceSchema = z
  .object({
    file: z
      .string()
      .trim()
      .min(1, "A font face needs a file")
      .meta({
        description:
          "The font file, relative to the pack's asset folder, like an image.",
        examples: ["fonts/pragroman.ttf", "fonts/vollkorn-bold.woff2"],
      }),
    weight: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The weight this file carries. Worth naming even for a family with a single face: a face declared without one is matched as regular, and then synthetically emboldened wherever bold is asked for.",
        examples: ["400", "700", "400 700"],
      }),
    style: z
      .string()
      .trim()
      .optional()
      .meta({
        description: "The style this file carries.",
        examples: ["normal", "italic"],
      }),
  })
  .meta({
    description:
      "One font file and what it is. The long form of a font entry, for when the bare filename is not enough.",
  });

export const AssetsSchema = z
  .object({
    root: z
      .string()
      .trim()
      .optional()
      .meta({
        description:
          "The folder the game's files live in, relative to the reader's own asset root. Left out, a reader picks a folder named after the game. Never absolute, and never climbing out with two dots: a pack names files it ships with, not files elsewhere on the machine.",
        examples: ["city-of-mist", "assets/legend-in-the-mist"],
      }),
    images: z
      .record(
        z
          .string()
          .trim()
          .min(1)
          .meta({
            description:
              "The role the illustration plays, not the picture it holds. A template asks for a role and gets whatever the active game put behind it.",
            examples: ["theme-card", "iceberg-group", "callout-edge"],
          }),
        z
          .string()
          .trim()
          .min(1)
          .meta({
            description: "The file, relative to the pack's asset folder.",
            examples: ["images/theme-card.webp"],
          }),
      )
      .optional()
      .meta({
        description:
          "The illustrations the game draws with, by role. A role a game leaves out is not an error: the template that asks for it degrades to a plain rendering rather than reserving a box for a picture that never comes.",
      }),
    fonts: z
      .record(
        z
          .string()
          .trim()
          .min(1)
          .meta({
            description:
              "The family name, spelled exactly as the tokens spell it in the font properties.",
            examples: ["PragRoman", "Vollkorn"],
          }),
        z.union([z.string().trim().min(1), FontFaceSchema]).meta({
          description:
            "A bare filename, or the long form when the face needs a weight or a style.",
        }),
      )
      .optional()
      .meta({
        description:
          "The typefaces the pack asks for. Without this, a pack can name a family in a token and have nothing load it, silently borrowing whatever face another game happened to bring.",
      }),
  })
  .meta({
    description:
      "Where the game's files live and what each one is for. Everything here is a path into the reader's own storage: the schema describes no bytes and carries no picture.",
  });

/** =========================
 *  Root schema
 *  ========================= */

export const GamePackSchema = z
  .object({
    id: GamePackIdSchema,
    label: z
      .string()
      .trim()
      .min(1, "A game pack needs a label")
      .meta({
        description:
          "The game's name as a reader shows it. Kept apart from the identifier so that the display name can be punctuated, capitalised and changed without touching a class name or a stored setting.",
        examples: ["City of Mist", "Legend in the Mist", ":Otherscape"],
      }),
    style: StyleSchema.meta({
      description: "The tokens the game writes, by theme variant.",
    }),
    assets: AssetsSchema.optional().meta({
      description:
        "Where the game's illustrations and typefaces live. A pack that declares none renders in type and colour alone.",
    }),
  })
  .meta({
    description:
      "A game pack: how a game dresses a reader, as data. It says who the game is, which custom properties it writes by theme variant, and where its illustrations live, and nothing about what is played. Tags, themes, tracks, Dangers and everything else a table puts on the page belong to the content schemas, and appear nowhere here.",
  });

/** =========================
 *  Exported TS types
 *  ========================= */
export type GamePackTokens = z.infer<typeof TokensSchema>;
export type GamePackStyleLayer = z.infer<typeof StyleLayerSchema>;
export type GamePackStyle = z.infer<typeof StyleSchema>;
export type GamePackFontFace = z.infer<typeof FontFaceSchema>;
export type GamePackAssets = z.infer<typeof AssetsSchema>;
export type GamePack = z.infer<typeof GamePackSchema>;
