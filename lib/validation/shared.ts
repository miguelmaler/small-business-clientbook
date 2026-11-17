import { z } from "zod";

/** Forms send "" for empty inputs. Treat blank strings as "not provided". */
export const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

/** Field name -> first error message, ready to show next to a form input. */
export type FieldErrors<Field extends string> = Partial<Record<Field | "form", string>>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors<Extract<keyof T, string>> };

function toFieldErrors<Field extends string>(error: z.ZodError): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {};
  for (const issue of error.issues) {
    const field = (issue.path[0] as Field | undefined) ?? "form";
    // Keep only the first message per field so the UI shows one clear error.
    errors[field] ??= issue.message;
  }
  return errors;
}

/** Run a schema and return either the clean data or per-field error messages. */
export function validate<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): ValidationResult<z.infer<Schema>> {
  const result = schema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: toFieldErrors(result.error) };
}
