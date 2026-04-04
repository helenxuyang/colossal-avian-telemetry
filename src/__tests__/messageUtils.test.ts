import { describe, expect, it } from "vitest";
import { mergeBytes } from "../messageUtils";

describe("mergeBytes", () => {
  it("combines high and low bytes", () => {
    expect(mergeBytes(0x12, 0x34)).toBe(0x1234);
  });
  it("handles zeroes", () => {
    expect(mergeBytes(0x00, 0x00)).toBe(0x0000);
  });
  it("handles start with zeroes", () => {
    expect(mergeBytes(0x01, 0x02)).toBe(0x0102);
  });
  it("handles end with zeroes", () => {
    expect(mergeBytes(0x10, 0x20)).toBe(0x1020);
  });
});
