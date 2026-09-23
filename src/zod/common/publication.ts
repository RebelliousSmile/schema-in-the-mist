import { z } from "zod";

export const PublicationTypeEnum = z
  .enum(["official", "third_party", "cauldron", "homebrew"])
  .meta({
    description:
      "Where this content comes from. Use to help downstream tools filter sources.",
    examples: ["official", "cauldron"],
  });

export type PublicationMetaCopy = {
  publicationDescription: string;
  publicationExamples: string[];
  sourceDescription: string;
  sourceExamples: string[];
  pageExamples: number[];
  description: string;
};

export function createPublicationMetaSchema(copy: PublicationMetaCopy) {
  return z
    .strictObject({
      publication_type: PublicationTypeEnum.default("homebrew").meta({
        description: copy.publicationDescription,
        examples: copy.publicationExamples,
      }),
      source: z
        .string()
        .trim()
        .optional()
        .meta({ description: copy.sourceDescription, examples: copy.sourceExamples }),
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
        .meta({ description: "List of credited authors or contributors." }),
      page: z
        .number()
        .int()
        .min(1)
        .optional()
        .meta({ description: "Page number (if relevant to the source).", examples: copy.pageExamples }),
    })
    .meta({ description: copy.description });
}
