import { describe, expect, it } from "vitest";

import {
  parseKoreaDateTimeLocalValue,
  toKoreaDateTimeLocalValue,
} from "@/lib/news/korea-date-time";

describe("news korea date time helpers", () => {
  it("formats stored UTC dates as Korea datetime-local values", () => {
    expect(toKoreaDateTimeLocalValue("2026-07-04T12:06:00.000Z")).toBe("2026-07-04T21:06");
  });

  it("parses datetime-local values as Korea wall-clock time", () => {
    expect(parseKoreaDateTimeLocalValue("2026-07-04T21:06")?.toISOString()).toBe(
      "2026-07-04T12:06:00.000Z",
    );
  });

  it("keeps explicit ISO instants as absolute dates", () => {
    expect(parseKoreaDateTimeLocalValue("2026-07-04T21:06:00.000Z")?.toISOString()).toBe(
      "2026-07-04T21:06:00.000Z",
    );
  });
});
