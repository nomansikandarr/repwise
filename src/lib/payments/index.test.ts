import { describe, expect, it } from "vitest";
import { splitFee } from ".";

describe("splitFee", () => {
  it("takes a 10% platform fee and gives the rest to the coach", () => {
    expect(splitFee(3500)).toEqual({ fee: 350, net: 3150 });
    expect(splitFee(6500)).toEqual({ fee: 650, net: 5850 });
  });

  it("rounds the fee to whole rupees and never loses a rupee", () => {
    const { fee, net } = splitFee(2995);
    expect(fee).toBe(300);
    expect(fee + net).toBe(2995);
  });

  it("rejects invalid amounts", () => {
    expect(() => splitFee(-1)).toThrow();
    expect(() => splitFee(10.5)).toThrow();
  });
});
