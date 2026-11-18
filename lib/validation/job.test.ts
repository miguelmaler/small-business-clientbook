import { describe, expect, it } from "vitest";
import { MAX_AMOUNT_CENTS } from "../money";
import { JOB_LIMITS, validateJobCreate, validateJobUpdate } from "./job";

const CLIENT_ID = "3f2b8c1e-9d4a-4f6b-8a2e-1c5d7e9f0a3b";

const validJob = {
  client_id: CLIENT_ID,
  title: "Kitchen sink repair",
  description: "Replace leaking faucet and supply lines",
  amount: 150,
  billed: true,
  paid: false,
};

describe("validateJobCreate", () => {
  it("accepts a valid job and defaults status to pending", () => {
    expect(validateJobCreate(validJob)).toEqual({
      success: true,
      data: { ...validJob, status: "pending" },
    });
  });

  it("applies the database defaults when only client_id and title are sent", () => {
    expect(validateJobCreate({ client_id: CLIENT_ID, title: "Fix sink" })).toEqual({
      success: true,
      data: {
        client_id: CLIENT_ID,
        title: "Fix sink",
        description: "",
        status: "pending",
        amount: 0,
        billed: false,
        paid: false,
      },
    });
  });

  it("accepts explicit status and billing", () => {
    const result = validateJobCreate({ ...validJob, status: "done", billed: true, paid: true });
    expect(result.success && result.data.status).toBe("done");
    expect(result.success && result.data.paid).toBe(true);
  });

  it("allows a pending job to be billed and paid (deposits)", () => {
    expect(
      validateJobCreate({ ...validJob, status: "pending", billed: true, paid: true }).success,
    ).toBe(true);
  });

  it("rejects a job that is paid but not billed", () => {
    const result = validateJobCreate({ ...validJob, billed: false, paid: true });
    expect(!result.success && result.errors.paid).toBe(
      "A job must be billed before it can be marked paid",
    );
  });

  it("rejects paid when billed is left to its default", () => {
    const result = validateJobCreate({ client_id: CLIENT_ID, title: "Fix sink", paid: true });
    expect(!result.success && result.errors.paid).toBeDefined();
  });

  it("trims title and description", () => {
    const result = validateJobCreate({ ...validJob, title: "  Fix sink  ", description: " x " });
    expect(result.success && result.data.title).toBe("Fix sink");
    expect(result.success && result.data.description).toBe("x");
  });

  it("allows an empty description", () => {
    const result = validateJobCreate({ ...validJob, description: "   " });
    expect(result.success && result.data.description).toBe("");
  });

  it.each([
    ["client_id", "Client is required"],
    ["title", "Title is required"],
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

  it.each(["PENDING", "DONE", "in_progress", ""])("rejects status %j", (value) => {
    const result = validateJobCreate({ ...validJob, status: value });
    expect(!result.success && result.errors.status).toBe("Status must be pending or done");
  });

  it.each([
    ["billed", "yes"],
    ["paid", "true"],
    ["billed", 1],
  ] as const)("rejects non-boolean %s %j", (field, value) => {
    const result = validateJobCreate({ ...validJob, [field]: value });
    expect(!result.success && result.errors[field]).toMatch(/must be true or false/);
  });

  describe("amount", () => {
    it("accepts zero (free work)", () => {
      expect(validateJobCreate({ ...validJob, amount: 0 }).success).toBe(true);
    });

    it("accepts the maximum", () => {
      const result = validateJobCreate({ ...validJob, amount: MAX_AMOUNT_CENTS / 100 });
      expect(result.success && result.data.amount).toBe(10_000_000);
    });

    it.each([
      [19.99, 19.99],
      ["19.99", 19.99],
      ["$1,234.5", 1234.5],
      [".99", 0.99],
      [0.1 + 0.2, 0.3],
    ])("converts %j to %j dollars", (value, expected) => {
      const result = validateJobCreate({ ...validJob, amount: value });
      expect(result.success && result.data.amount).toBe(expected);
    });

    it.each([
      [-1, "Amount cannot be negative"],
      ["-5", "Amount cannot be negative"],
      [12.345, "Amount must be a dollar amount with at most 2 decimal places"],
      ["abc", "Amount must be a dollar amount with at most 2 decimal places"],
      // Zod rejects NaN as "not a number", before the amount is parsed.
      [Number.NaN, "Amount must be a dollar amount"],
      [MAX_AMOUNT_CENTS / 100 + 0.01, "Amount cannot be more than $10,000,000.00"],
      [true, "Amount must be a dollar amount"],
    ])("rejects %j", (value, message) => {
      const result = validateJobCreate({ ...validJob, amount: value });
      expect(!result.success && result.errors.amount).toBe(message);
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

  it.each(["id", "user_id", "created_at", "updated_at", "amount_cents", "billing_status"])(
    "rejects unknown or server-set field %s",
    (field) => {
      expect(validateJobCreate({ ...validJob, [field]: "x" }).success).toBe(false);
    },
  );
});

describe("validateJobUpdate", () => {
  it("accepts marking a job done", () => {
    expect(validateJobUpdate({ status: "done" })).toEqual({
      success: true,
      data: { status: "done" },
    });
  });

  it("accepts marking a job paid", () => {
    expect(validateJobUpdate({ paid: true }).success).toBe(true);
  });

  it("rejects marking a job paid and unbilled in the same update", () => {
    const result = validateJobUpdate({ billed: false, paid: true });
    expect(!result.success && result.errors.paid).toBe(
      "A job must be billed before it can be marked paid",
    );
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
    const result = validateJobUpdate({ amount: -5 });
    expect(!result.success && result.errors.amount).toBe("Amount cannot be negative");
  });
});
