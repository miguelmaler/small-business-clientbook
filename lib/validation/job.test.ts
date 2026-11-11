import { describe, expect, it } from "vitest";
import { MAX_AMOUNT_CENTS } from "../money";
import { JOB_LIMITS, validateJobCreate, validateJobUpdate } from "./job";

const CLIENT_ID = "3f2b8c1e-9d4a-4f6b-8a2e-1c5d7e9f0a3b";

const validJob = {
  client_id: CLIENT_ID,
  title: "Kitchen sink repair",
  description: "Replace leaking faucet and supply lines",
  amount_cents: 15000,
  billing_status: "BILLED",
};

describe("validateJobCreate", () => {
  it("accepts a valid job and defaults status to PENDING", () => {
    expect(validateJobCreate(validJob)).toEqual({
      success: true,
      data: { ...validJob, status: "PENDING" },
    });
  });

  it("accepts explicit statuses", () => {
    const result = validateJobCreate({ ...validJob, status: "DONE", billing_status: "PAID" });
    expect(result.success && result.data.status).toBe("DONE");
    expect(result.success && result.data.billing_status).toBe("PAID");
  });

  it("allows a PENDING job to be BILLED or PAID (deposits)", () => {
    expect(validateJobCreate({ ...validJob, status: "PENDING", billing_status: "PAID" }).success)
      .toBe(true);
  });

  it("trims title and description", () => {
    const result = validateJobCreate({ ...validJob, title: "  Fix sink  " });
    expect(result.success && result.data.title).toBe("Fix sink");
  });

  it.each([
    ["client_id", "Client is required"],
    ["title", "Title is required"],
    ["description", "Description is required"],
    ["amount_cents", "Amount is required"],
    ["billing_status", "Billing status is required"],
  ] as const)("requires %s", (field, message) => {
    const result = validateJobCreate({ ...validJob, [field]: undefined });
    expect(!result.success && result.errors[field]).toBe(message);
  });

  it("rejects a client_id that is not a UUID", () => {
    const result = validateJobCreate({ ...validJob, client_id: "123" });
    expect(!result.success && result.errors.client_id).toBe("Choose a valid client");
  });

  it("rejects a blank title", () => {
    const result = validateJobCreate({ ...validJob, title: "   " });
    expect(!result.success && result.errors.title).toBe("Title is required");
  });

  it.each(["pending", "IN_PROGRESS", ""])("rejects status %j", (value) => {
    const result = validateJobCreate({ ...validJob, status: value });
    expect(!result.success && result.errors.status).toBe("Status must be PENDING or DONE");
  });

  it.each(["UNBILLED", "INVOICED", "paid"])("rejects billing status %j", (value) => {
    const result = validateJobCreate({ ...validJob, billing_status: value });
    expect(!result.success && result.errors.billing_status).toBe(
      "Billing status must be BILLED or PAID",
    );
  });

  describe("amount_cents", () => {
    it("accepts zero (free work)", () => {
      expect(validateJobCreate({ ...validJob, amount_cents: 0 }).success).toBe(true);
    });

    it("accepts the maximum", () => {
      expect(validateJobCreate({ ...validJob, amount_cents: MAX_AMOUNT_CENTS }).success).toBe(
        true,
      );
    });

    it.each([
      [-1, "Amount cannot be negative"],
      [12.5, "Amount must be a whole number of cents"],
      [MAX_AMOUNT_CENTS + 1, "Amount cannot be more than $10,000,000.00"],
      ["1500", "Amount must be a number in cents"],
      [Number.NaN, "Amount must be a number in cents"],
    ])("rejects %j", (value, message) => {
      const result = validateJobCreate({ ...validJob, amount_cents: value });
      expect(!result.success && result.errors.amount_cents).toBe(message);
    });
  });

  it("enforces max lengths", () => {
    const result = validateJobCreate({
      ...validJob,
      title: "a".repeat(JOB_LIMITS.title + 1),
      description: "a".repeat(JOB_LIMITS.description + 1),
    });
    expect(!result.success && result.errors.title).toMatch(/or less/);
    expect(!result.success && result.errors.description).toMatch(/or less/);
  });

  it.each(["id", "user_id", "created_at", "updated_at"])(
    "rejects server-set field %s",
    (field) => {
      expect(validateJobCreate({ ...validJob, [field]: "x" }).success).toBe(false);
    },
  );
});

describe("validateJobUpdate", () => {
  it("accepts marking a job done", () => {
    expect(validateJobUpdate({ status: "DONE" })).toEqual({
      success: true,
      data: { status: "DONE" },
    });
  });

  it("accepts marking a job paid", () => {
    expect(validateJobUpdate({ billing_status: "PAID" }).success).toBe(true);
  });

  it("does not apply defaults on update", () => {
    const result = validateJobUpdate({ title: "New title" });
    expect(result).toEqual({ success: true, data: { title: "New title" } });
  });

  it("rejects an empty update", () => {
    const result = validateJobUpdate({});
    expect(!result.success && result.errors.form).toBe("Provide at least one field to update");
  });

  it("still validates the fields that are sent", () => {
    const result = validateJobUpdate({ amount_cents: -5 });
    expect(!result.success && result.errors.amount_cents).toBe("Amount cannot be negative");
  });
});
