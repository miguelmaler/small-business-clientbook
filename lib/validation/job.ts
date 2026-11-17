import { z } from "zod";
import { dollarsToCents, MAX_AMOUNT_CENTS } from "../money";
import { validate, type ValidationResult } from "./shared";

/**
 * Validation for Job input, matching the `public.jobs` table:
 *
 *   client_id    uuid not null           (must be one of the user's clients)
 *   title        text not null           (not blank, <= 200 chars)
 *   description  text not null default '' (<= 5000 chars, may be empty)
 *   status       text default 'pending'  ('pending' or 'done')
 *   amount       numeric(12, 2) default 0 (dollars, >= 0, at most 2 decimals)
 *   billed       boolean default false
 *   paid         boolean default false   (paid requires billed)
 *
 * `id`, `user_id`, `created_at`, and `updated_at` are NOT part of the input.
 * The database sets them.
 *
 * status and billing are independent: a pending job may be billed or paid
 * (e.g. a deposit paid up front).
 */

export const JOB_STATUSES = ["pending", "done"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/** Must match the CHECK constraints on public.jobs. */
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
  .string({ error: "Description must be text" })
  .trim()
  .max(
    JOB_LIMITS.description,
    `Description must be ${JOB_LIMITS.description} characters or less`,
  );

const status = z.enum(JOB_STATUSES, { error: "Status must be pending or done" });

/**
 * Accepts dollars as a number (12.5) or as text typed into a form
 * ("$1,234.56"). Outputs dollars as a number with at most 2 decimals, ready
 * for the numeric(12, 2) column. Parsing goes through whole cents so values
 * like 19.99 never pick up floating point error.
 */
const amount = z
  .union([z.number(), z.string()], {
    error: (issue) =>
      issue.input === undefined ? "Amount is required" : "Amount must be a dollar amount",
  })
  .transform((value, ctx) => {
    const negative = typeof value === "number" ? value < 0 : value.trim().startsWith("-");
    if (negative) {
      ctx.addIssue({ code: "custom", message: "Amount cannot be negative" });
      return z.NEVER;
    }
    const cents = dollarsToCents(value);
    if (cents === null) {
      ctx.addIssue({
        code: "custom",
        message: "Amount must be a dollar amount with at most 2 decimal places",
      });
      return z.NEVER;
    }
    if (cents > MAX_AMOUNT_CENTS) {
      ctx.addIssue({ code: "custom", message: "Amount cannot be more than $10,000,000.00" });
      return z.NEVER;
    }
    return cents / 100;
  });

const billed = z.boolean({ error: "Billed must be true or false" });
const paid = z.boolean({ error: "Paid must be true or false" });

const jobFields = {
  client_id: clientId,
  title,
  description,
  status,
  amount,
  billed,
  paid,
};

/**
 * Mirrors the jobs_paid_requires_billed constraint. On an update that only
 * sends `paid: true`, the stored `billed` value isn't known here, so the
 * database constraint is the final check.
 */
const paidRequiresBilled = (data: { billed?: boolean; paid?: boolean }) =>
  !(data.paid === true && data.billed === false);

const paidRequiresBilledError = {
  error: "A job must be billed before it can be marked paid",
  path: ["paid"],
};

/** Use when creating a new job. Fields with a database default may be omitted. */
export const jobCreateSchema = z
  .strictObject({
    ...jobFields,
    description: description.default(""),
    status: status.default("pending"),
    amount: amount.default(0),
    billed: billed.default(false),
    paid: paid.default(false),
  })
  .refine(paidRequiresBilled, paidRequiresBilledError);

/** Use when editing a job. Any field may be sent, but at least one is required. */
export const jobUpdateSchema = z
  .strictObject(jobFields)
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: "Provide at least one field to update",
  })
  .refine(paidRequiresBilled, paidRequiresBilledError);

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;

export function validateJobCreate(input: unknown): ValidationResult<JobCreateInput> {
  return validate(jobCreateSchema, input);
}

export function validateJobUpdate(input: unknown): ValidationResult<JobUpdateInput> {
  return validate(jobUpdateSchema, input);
}
