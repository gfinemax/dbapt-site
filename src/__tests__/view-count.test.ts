import { describe, expect, it } from "vitest";
import { formatViewCountNumber } from "@/lib/view-count";

describe("formatViewCountNumber", () => {
  it("formats table view counts as localized numbers only", () => {
    expect(formatViewCountNumber(9)).toBe("9");
    expect(formatViewCountNumber(1250)).toBe("1,250");
    expect(formatViewCountNumber(null)).toBe("0");
  });
});
