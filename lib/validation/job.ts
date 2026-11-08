import { z } from "zod";
import { MAX_AMOUNT_CENTS } from "../money";
import { validate, type ValidationResult } from "./shared";

/**
 * Validation for Job input, based on the Job class in the
 * Small Business CRM class diagram:
 *
 *   client_id: uuid {FK -> Client}   (required)
 *   title: text                      (required)
 *   description: text                (required)
 *   status: JobStatus                (defaults to PENDING)
 *   amount_cents: integer            (required, whole cents, >= 0)
 *   billing_status: BillingStatus    (required: BILLED or PAID)
 *
 * `id`, `user_id`, `created_at`, and `updated_at` are NOT part of the input.
 * The server/database sets them.
 *
 * status and billing_status are independent: a PENDING job may be BILLED or
 * PAID (e.g. a deposit paid up front).
 */

export const JOB_STATUSES = ["PENDING", "DONE"] as const;
export const BILLING_STATUSES = ["BILLED", "PAID"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export const JOB_LIMITS = {
  title: 200,
  description: 5000,
} as const;

const clientId = z.uuid({
  error: (issue) => (issue.input === undefined ? "Client is required" : "Choose a valid client"),
});

const title = z
  .string({ error: "Title is required" })
  .trim()
  .min(1, "Title is required")
  .max(JOB_LIMITS.title, `Title must be ${JOB_LIMITS.title} characters or less`);

const description = z
  .string({ error: "Description is required" })
  .trim()
  .min(1, "Description is required")
  .max(
    JOB_LIMITS.description,
    `Description must be ${JOB_LIMITS.description} characters or less`,
  );

const status = z.enum(JOB_STATUSES, { error: "Status must be PENDING or DONE" });

const billingStatus = z.enum(BILLING_STATUSES, {
  error: (issue) =>
    issue.input === undefined
      ? "Billing status is required"
      : "Billing status must be BILLED or PAID",
});

const amountCents = z
  .number({
    error: (issue) =>
      issue.input === undefined ? "Amount is required" : "Amount must be a number in cents",
  })
  .int("Amount must be a whole number of cents")
  .min(0, "Amount cannot be negative")
  .max(MAX_AMOUNT_CENTS, "Amount cannot be more than $10,000,000.00");

const jobFields = {
  client_id: clientId,
  title,
  description,
  status,
  amount_cents: amountCents,
  billing_status: billingStatus,
};

/** Use when creating a new job. status defaults to PENDING. */
export const jobCreateSchema = z.strictObject({
  ...jobFields,
  status: status.default("PENDING"),
});

/** Use when editing a job. Any field may be sent, but at least one is required. */
export const jobUpdateSchema = z
  .strictObject(jobFields)
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: "Provide at least one field to update",
  });

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;

export function validateJobCreate(input: unknown): ValidationResult<JobCreateInput> {
  return validate(jobCreateSchema, input);
}

export function validateJobUpdate(input: unknown): ValidationResult<JobUpdateInput> {
  return validate(jobUpdateSchema, input);
}
