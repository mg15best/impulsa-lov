import { describe, expect, it } from "vitest";
import {
  normalizeOptionalDate,
  normalizeOptionalNumber,
  normalizeOptionalString,
} from "@/lib/payloadUtils";

describe("payloadUtils", () => {
  describe("normalizeOptionalString", () => {
    it("returns null for undefined, null, or empty values", () => {
      expect(normalizeOptionalString(undefined)).toBeNull();
      expect(normalizeOptionalString(null)).toBeNull();
      expect(normalizeOptionalString("")).toBeNull();
      expect(normalizeOptionalString("   ")).toBeNull();
    });

    it("returns trimmed string for non-empty values", () => {
      expect(normalizeOptionalString("  hello ")).toBe("hello");
    });
  });

  describe("normalizeOptionalDate", () => {
    it("reuses optional string behavior", () => {
      expect(normalizeOptionalDate(" 2026-01-01 ")).toBe("2026-01-01");
      expect(normalizeOptionalDate(" ")).toBeNull();
    });
  });

  describe("normalizeOptionalNumber", () => {
    it("returns null for empty or invalid values", () => {
      expect(normalizeOptionalNumber(undefined)).toBeNull();
      expect(normalizeOptionalNumber(null)).toBeNull();
      expect(normalizeOptionalNumber(" ")).toBeNull();
      expect(normalizeOptionalNumber("not-a-number")).toBeNull();
      expect(normalizeOptionalNumber(Number.NaN)).toBeNull();
    });

    it("parses numbers from strings and preserves numeric values", () => {
      expect(normalizeOptionalNumber(" 42 ")).toBe(42);
      expect(normalizeOptionalNumber(7)).toBe(7);
    });
  });
});
