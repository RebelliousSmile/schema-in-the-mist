import { parse, stringify, type TomlTableWithoutBigInt } from "smol-toml";
import { ZodError, type z } from "zod";

export type MistSourceConversion =
  | { readonly kind: "concise"; readonly source: string }
  | { readonly kind: "raw"; readonly source: string };

export type SourceConversionCodec<Schema extends z.ZodType> = {
  readonly schema: Schema;
  convertToSource(rawToml: string): MistSourceConversion;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Detects value-level divergence introduced by schema transforms (`.trim()`, coercion)
 * once `schema.parse()` has already succeeded — unknown-key loss is caught earlier, by
 * intercepting the `ZodError` that `.strictObject()` raises. Recurses through nested
 * objects and arrays; a key added by `validated` (e.g. a Zod `.default()`) is not a failure.
 */
export function isLosslessSubset(raw: unknown, validated: unknown): boolean {
  if (Array.isArray(raw)) {
    return (
      Array.isArray(validated) &&
      raw.length === validated.length &&
      raw.every((item, index) => isLosslessSubset(item, validated[index]))
    );
  }
  if (isPlainObject(raw)) {
    return (
      isPlainObject(validated) &&
      Object.entries(raw).every(
        ([key, value]) =>
          Object.prototype.hasOwnProperty.call(validated, key) &&
          isLosslessSubset(value, validated[key]),
      )
    );
  }
  return raw === validated;
}

type StringState = "none" | "basic" | "basic-multi" | "literal" | "literal-multi";

/**
 * Scans raw TOML text for a `#` outside of any string span, per TOML 1.0.0's
 * comment and string grammar. Basic and multiline-basic strings honor `\"` escapes;
 * literal strings have none.
 */
export function containsComment(source: string): boolean {
  let state: StringState = "none";
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    switch (state) {
      case "none": {
        if (char === "#") return true;
        if (char === '"') {
          if (source.startsWith('"""', index)) {
            state = "basic-multi";
            index += 3;
          } else {
            state = "basic";
            index += 1;
          }
          continue;
        }
        if (char === "'") {
          if (source.startsWith("'''", index)) {
            state = "literal-multi";
            index += 3;
          } else {
            state = "literal";
            index += 1;
          }
          continue;
        }
        index += 1;
        continue;
      }
      case "basic": {
        if (char === "\\") {
          index += 2;
          continue;
        }
        if (char === '"') {
          state = "none";
        }
        index += 1;
        continue;
      }
      case "basic-multi": {
        if (char === "\\") {
          index += 2;
          continue;
        }
        if (source.startsWith('"""', index)) {
          state = "none";
          index += 3;
          continue;
        }
        index += 1;
        continue;
      }
      case "literal": {
        if (char === "'") {
          state = "none";
        }
        index += 1;
        continue;
      }
      case "literal-multi": {
        if (source.startsWith("'''", index)) {
          state = "none";
          index += 3;
          continue;
        }
        index += 1;
        continue;
      }
    }
  }

  return false;
}

function isUnrecognizedKeysOnly(error: unknown): error is ZodError {
  return (
    error instanceof ZodError &&
    error.issues.length > 0 &&
    error.issues.every((issue) => issue.code === "unrecognized_keys")
  );
}

export function createSourceConversionCodec<Schema extends z.ZodType>(
  schema: Schema,
): SourceConversionCodec<Schema> {
  return {
    schema,
    convertToSource(rawToml) {
      const table = parse(rawToml);

      let validated: z.output<Schema>;
      try {
        validated = schema.parse(table);
      } catch (error) {
        if (isUnrecognizedKeysOnly(error)) {
          return { kind: "raw", source: rawToml };
        }
        throw error;
      }

      const comparable = JSON.parse(JSON.stringify(validated)) as unknown;

      if (containsComment(rawToml) || !isLosslessSubset(table, comparable)) {
        return { kind: "raw", source: rawToml };
      }

      return {
        kind: "concise",
        source: stringify(validated as TomlTableWithoutBigInt),
      };
    },
  };
}
