import { describe, expect, it } from "vitest";
import { centsToDollars, dollarsToCents, formatCents } from "./money";

describe("dollarsToCents", () => {
  it.each([
    ["12", 1200],
    ["12.5", 1250],
    ["12.50", 1250],
    ["0.99", 99],
    [".99", 99],
    ["$1,234.56", 123456],
    ["  45.00 ", 4500],
    ["0", 0],
  ])("converts %j to %i cents", (input, expected) => {
    expect(dollarsToCents(input)).toBe(expected);
  });

  it("avoids floating point errors (19.99 would be 1998.9999... with plain math)", () => {
    expect(19.99 * 100).not.toBe(1999);
    expect(dollarsToCents("19.99")).toBe(1999);
    expect(dollarsToCents(19.99)).toBe(1999);
  });

  it("converts numbers", () => {
    expect(dollarsToCents(12.5)).toBe(1250);
    expect(dollarsToCents(0.1 + 0.2)).toBe(30);
  });

  it.each(["", "abc", "12.345", "-5", "1.2.3", "$", ".", "12,34.5x"])(
    "rejects %j",
    (input) => {
      expect(dollarsToCents(input)).toBeNull();
    },
  );

  it.each([-1, 12.345, Number.NaN, Number.POSITIVE_INFINITY])("rejects number %d", (input) => {
    expect(dollarsToCents(input)).toBeNull();
  });
});

describe("centsToDollars", () => {
  it.each([
    [1234, "12.34"],
    [1200, "12.00"],
    [5, "0.05"],
    [0, "0.00"],
    [-250, "-2.50"],
  ])("converts %i to %s", (cents, expected) => {
    expect(centsToDollars(cents)).toBe(expected);
  });

  it("round-trips with dollarsToCents", () => {
    expect(dollarsToCents(centsToDollars(98765))).toBe(98765);
  });
});

describe("formatCents", () => {
  it("formats as US dollars", () => {
    expect(formatCents(123456)).toBe("$1,234.56");
    expect(formatCents(0)).toBe("$0.00");
  });
});
