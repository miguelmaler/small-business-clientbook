import { z } from "zod";
import { blankToNull, validate, type ValidationResult } from "./shared";

/**
 * Validation for Client input, matching the `public.clients` table:
 *
 *   name     text not null   (not blank, <= 200 chars)
 *   email    text            (optional, <= 254 chars)
 *   phone    text not null   (not blank, <= 40 chars)
 *   address  text not null   (not blank, <= 500 chars)
 *   notes    text            (optional, <= 5000 chars)
 *
 * `id`, `user_id`, `created_at`, and `updated_at` are intentionally NOT part of
 * the input. The database sets them (user_id defaults to auth.uid() and RLS
 * rejects any other value), so a user can never create a client under someone
 * else's account.
 *
 * Optional fields come out as `null` when left blank, so an update can clear
 * them (sending `undefined` would leave the old value in place).
 */

/** Must match the CHECK constraints on public.clients. */
export const CLIENT_LIMITS = {
  name: 200,
  email: 254,
  phone: 40,
  address: 500,
  notes: 5000,
} as const;

const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

const name = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(CLIENT_LIMITS.name, `Name must be ${CLIENT_LIMITS.name} characters or less`);

const email = z.preprocess(
  blankToNull,
  z
    .email("Enter a valid email address")
    .max(CLIENT_LIMITS.email, `Email must be ${CLIENT_LIMITS.email} characters or less`)
    .transform((value) => value.toLowerCase())
    .nullable()
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
  blankToNull,
  z
    .string()
    .max(CLIENT_LIMITS.notes, `Notes must be ${CLIENT_LIMITS.notes} characters or less`)
    .nullable()
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
