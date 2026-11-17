import { z } from "zod";
import { blankToUndefined, trimmed, validate, type ValidationResult } from "./shared";

/**
 * Validation for Client input, based on the Client class in the
 * Small Business CRM class diagram:
 *
 *   name: text            (required)
 *   email: text [0..1]    (optional)
 *   phone: text           (required)
 *   address: text         (required)
 *   notes: text [0..1]    (optional)
 *
 * `id` and `user_id` are intentionally NOT part of the input. The server sets
 * them (user_id comes from the logged-in user), so a user can never create a
 * client under someone else's account.
 */

export const CLIENT_LIMITS = {
  name: 100,
  email: 254,
  phone: 30,
  address: 200,
  notes: 2000,
} as const;

const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

const name = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(CLIENT_LIMITS.name, `Name must be ${CLIENT_LIMITS.name} characters or less`);

const email = z.preprocess(
  (value) => trimmed(blankToUndefined(value)),
  z
    .email("Enter a valid email address")
    .max(CLIENT_LIMITS.email, `Email must be ${CLIENT_LIMITS.email} characters or less`)
    .transform((value) => value.toLowerCase())
    .optional(),
);

const phone = z
  .string({ error: "Phone is required" })
  .trim()
  .min(1, "Phone is required")
  .max(CLIENT_LIMITS.phone, `Phone must be ${CLIENT_LIMITS.phone} characters or less`)
  .regex(/^[0-9+\-().\s]+$/, "Phone can only contain numbers, spaces, and + - ( ) .")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
  }, `Phone must have between ${MIN_PHONE_DIGITS} and ${MAX_PHONE_DIGITS} digits`);

const address = z
  .string({ error: "Address is required" })
  .trim()
  .min(1, "Address is required")
  .max(CLIENT_LIMITS.address, `Address must be ${CLIENT_LIMITS.address} characters or less`);

const notes = z.preprocess(
  (value) => trimmed(blankToUndefined(value)),
  z
    .string()
    .max(CLIENT_LIMITS.notes, `Notes must be ${CLIENT_LIMITS.notes} characters or less`)
    .optional(),
);

/** Use when creating a new client. Required fields must be present. */
export const clientCreateSchema = z.strictObject({
  name,
  email,
  phone,
  address,
  notes,
});

/** Use when editing a client. Any field may be sent, but at least one is required. */
export const clientUpdateSchema = clientCreateSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: "Provide at least one field to update",
  });

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

export function validateClientCreate(input: unknown): ValidationResult<ClientCreateInput> {
  return validate(clientCreateSchema, input);
}

export function validateClientUpdate(input: unknown): ValidationResult<ClientUpdateInput> {
  return validate(clientUpdateSchema, input);
}
