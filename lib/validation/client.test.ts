import { describe, expect, it } from "vitest";
import { CLIENT_LIMITS, validateClientCreate, validateClientUpdate } from "./client";

const validClient = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "(208) 555-0123",
  address: "123 Main St, Boise, ID",
  notes: "Prefers text messages",
};

describe("validateClientCreate", () => {
  it("accepts a valid client", () => {
    const result = validateClientCreate(validClient);
    expect(result.success).toBe(true);
  });

  it("accepts a client without the optional email and notes", () => {
    const result = validateClientCreate({
      name: validClient.name,
      phone: validClient.phone,
      address: validClient.address,
    });
    expect(result.success).toBe(true);
  });

  it("treats blank optional fields from a form as not provided", () => {
    const result = validateClientCreate({ ...validClient, email: "  ", notes: "" });
    expect(result).toEqual({
      success: true,
      data: {
        name: "Jane Doe",
        phone: "(208) 555-0123",
        address: "123 Main St, Boise, ID",
        email: undefined,
        notes: undefined,
      },
    });
  });

  it("trims whitespace and lowercases email", () => {
    const result = validateClientCreate({
      ...validClient,
      name: "  Jane Doe  ",
      email: "  Jane@Example.COM ",
    });
    expect(result.success && result.data.name).toBe("Jane Doe");
    expect(result.success && result.data.email).toBe("jane@example.com");
  });

  it.each(["name", "phone", "address"] as const)("requires %s", (field) => {
    const result = validateClientCreate({ ...validClient, [field]: undefined });
    expect(result.success).toBe(false);
    expect(!result.success && result.errors[field]).toMatch(/required/i);
  });

  it("rejects a name that is only spaces", () => {
    const result = validateClientCreate({ ...validClient, name: "   " });
    expect(!result.success && result.errors.name).toBe("Name is required");
  });

  it("rejects an invalid email", () => {
    const result = validateClientCreate({ ...validClient, email: "not-an-email" });
    expect(!result.success && result.errors.email).toBe("Enter a valid email address");
  });

  it.each(["208-555-0123", "+1 (208) 555-0123", "208.555.0123", "2085550123"])(
    "accepts phone format %s",
    (phone) => {
      expect(validateClientCreate({ ...validClient, phone }).success).toBe(true);
    },
  );

  it.each([
    ["letters", "call me maybe"],
    ["too few digits", "555-01"],
    ["too many digits", "1234567890123456"],
  ])("rejects a phone with %s", (_label, phone) => {
    const result = validateClientCreate({ ...validClient, phone });
    expect(result.success).toBe(false);
    expect(!result.success && result.errors.phone).toBeDefined();
  });

  it("enforces max lengths", () => {
    const result = validateClientCreate({
      ...validClient,
      name: "a".repeat(CLIENT_LIMITS.name + 1),
      notes: "a".repeat(CLIENT_LIMITS.notes + 1),
    });
    expect(!result.success && result.errors.name).toMatch(/or less/);
    expect(!result.success && result.errors.notes).toMatch(/or less/);
  });

  it("rejects id and user_id so users cannot set ownership", () => {
    const result = validateClientCreate({
      ...validClient,
      id: "11111111-1111-1111-1111-111111111111",
      user_id: "22222222-2222-2222-2222-222222222222",
    });
    expect(result.success).toBe(false);
  });

  it("returns one error per field for multiple bad fields", () => {
    const result = validateClientCreate({ name: "", phone: "abc", address: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.errors).sort()).toEqual(["address", "name", "phone"]);
    }
  });

  it("rejects input that is not an object", () => {
    expect(validateClientCreate(null).success).toBe(false);
    expect(validateClientCreate("Jane").success).toBe(false);
  });
});

describe("validateClientUpdate", () => {
  it("accepts updating a single field", () => {
    const result = validateClientUpdate({ phone: "208-555-9999" });
    expect(result).toEqual({ success: true, data: { phone: "208-555-9999" } });
  });

  it("rejects an empty update", () => {
    const result = validateClientUpdate({});
    expect(!result.success && result.errors.form).toBe("Provide at least one field to update");
  });

  it("still validates the fields that are sent", () => {
    const result = validateClientUpdate({ email: "bad" });
    expect(!result.success && result.errors.email).toBe("Enter a valid email address");
  });

  it("does not allow clearing a required field", () => {
    const result = validateClientUpdate({ name: "" });
    expect(!result.success && result.errors.name).toBe("Name is required");
  });
});
