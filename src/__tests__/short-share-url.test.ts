import { describe, expect, it } from "vitest";

describe("short share URLs", () => {
  it("round-trips UUID content ids with compact typed codes", async () => {
    const {
      buildAbsoluteShortShareUrl,
      buildShortSharePath,
      parseShortShareCode,
    } = await import("@/lib/short-share-url");

    const id = "b472f16e-3e90-40c6-889a-06375fa56b05";
    const path = buildShortSharePath("free", id);

    expect(path).toMatch(/^\/s\/f[A-Za-z0-9]+$/);
    expect(path.length).toBeLessThan(`/share/free/${id}`.length);
    expect(parseShortShareCode(path.replace("/s/", ""))).toEqual({
      kind: "free",
      id,
    });
    expect(buildAbsoluteShortShareUrl("free", id, "https://dbapt.example")).toBe(`https://dbapt.example${path}`);
  });

  it("supports all public share kinds", async () => {
    const { buildShortSharePath, parseShortShareCode } = await import("@/lib/short-share-url");
    const id = "11111111-2222-4333-8444-555555555555";

    expect(parseShortShareCode(buildShortSharePath("notice", id).replace("/s/", ""))).toEqual({ kind: "notice", id });
    expect(parseShortShareCode(buildShortSharePath("newsletter", id).replace("/s/", ""))).toEqual({ kind: "newsletter", id });
    expect(parseShortShareCode(buildShortSharePath("document", id).replace("/s/", ""))).toEqual({ kind: "document", id });
  });

  it("falls back to reversible safe codes for non-UUID ids", async () => {
    const { buildShortSharePath, parseShortShareCode } = await import("@/lib/short-share-url");

    const path = buildShortSharePath("document", "doc-delegate-minutes");

    expect(path).toMatch(/^\/s\/d~/);
    expect(parseShortShareCode(path.replace("/s/", ""))).toEqual({
      kind: "document",
      id: "doc-delegate-minutes",
    });
  });

  it("rejects malformed short codes", async () => {
    const { parseShortShareCode } = await import("@/lib/short-share-url");

    expect(parseShortShareCode("")).toBeNull();
    expect(parseShortShareCode("x123")).toBeNull();
    expect(parseShortShareCode("f")).toBeNull();
    expect(parseShortShareCode("f!not-safe")).toBeNull();
  });
});
