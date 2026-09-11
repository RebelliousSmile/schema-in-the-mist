import { parse, stringify, type TomlTableWithoutBigInt } from "smol-toml";
import type { z } from "zod";

export type TomlCodec<Schema extends z.ZodType> = {
  readonly schema: Schema;
  parseToml(text: string): z.output<Schema>;
  stringifyToml(value: z.input<Schema>): string;
};

export function createTomlCodec<Schema extends z.ZodType>(
  schema: Schema,
): TomlCodec<Schema> {
  return {
    schema,
    parseToml(text) {
      return schema.parse(parse(text));
    },
    stringifyToml(value) {
      const parsed = schema.parse(value);
      return stringify(parsed as TomlTableWithoutBigInt);
    },
  };
}
