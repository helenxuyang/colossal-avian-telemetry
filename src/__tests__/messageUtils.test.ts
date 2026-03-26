import { describe, expect, it } from "vitest";
import {
  generateMockValueTwoByteHex,
  getMockEscMessageGenerator,
  mergeBytes,
} from "../messageUtils";
import { getInitColossalAvian } from "../robot";

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

describe("generateMockValueTwoByteHex", () => {
  it("handles zero", () => {
    expect(generateMockValueTwoByteHex(0)).toBe("0 0");
  });
  it("handles zero high byte, single digit low byte", () => {
    expect(generateMockValueTwoByteHex(5)).toBe("0 5");
    expect(generateMockValueTwoByteHex(10)).toBe("0 a");
  });
  it("handles zero high byte, two digit low byte", () => {
    expect(generateMockValueTwoByteHex(16)).toBe("0 10");
  });
  it("handles one digit high byte, zero low byte", () => {
    expect(generateMockValueTwoByteHex(16 * 16 * 2)).toBe("2 0");
  });
  it("handles one digit high byte, one digit low byte", () => {
    expect(generateMockValueTwoByteHex(16 * 16 * 7 + 10)).toBe("7 a");
  });
  it("handles two digit high byte, one digit low byte", () => {
    expect(generateMockValueTwoByteHex(16 * 16 * 16 + 15)).toBe("10 f");
  });
  it("handles two digit high byte, two digit low byte", () => {
    expect(generateMockValueTwoByteHex(16 * 16 * 16 + 16)).toBe("10 10");
  });
});

describe("getMockEscMessageGenerator", () => {
  it("rotates between ESCs including data and input", () => {
    const generator = getMockEscMessageGenerator(
      Date.now(),
      getInitColossalAvian(),
    );
    const checkDataMessage = (id: string) => {
      const message = generator();
      expect(message).toContain(`<${id}`);
      expect(message.split(" ").length).toBe(12);
    };
    const checkInputMessage = (id: string) => {
      const message = generator();
      expect(message).toContain(`<${id}`);
      expect(message.split(" ").length).toBe(3);
    };
    checkDataMessage("a");
    checkDataMessage("b");
    checkDataMessage("c");
    checkInputMessage("w");
    checkInputMessage("x");
    checkInputMessage("y");
    checkInputMessage("z");
    checkDataMessage("a");
  });
});
