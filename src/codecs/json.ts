import type { z } from "zod";

export type JsonCodec<Schema extends z.ZodType> = {
  readonly schema: Schema;
  parseJson(text: string): z.output<Schema>;
  stringifyJson(value: z.input<Schema>): string;
};

export function createJsonCodec<Schema extends z.ZodType>(
  schema: Schema,
): JsonCodec<Schema> {
  return {
    schema,
    parseJson(text) {
      return schema.parse(JSON.parse(text));
    },
    stringifyJson(value) {
      return `${JSON.stringify(schema.parse(value), null, 2)}\n`;
    },
  };
}
