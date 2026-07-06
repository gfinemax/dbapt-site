import { describe, expect, it } from "vitest";

import {
  parseContentReactionTargetType,
  summarizeContentLikes,
} from "@/lib/content-reactions";

describe("content reactions", () => {
  it("accepts the common content target types", () => {
    expect(parseContentReactionTargetType("FREE_POST")).toBe("FREE_POST");
    expect(parseContentReactionTargetType("COOP_NEWS")).toBe("COOP_NEWS");
    expect(parseContentReactionTargetType("DOCUMENT")).toBe("DOCUMENT");
    expect(parseContentReactionTargetType("FREE_COMMENT")).toBeNull();
  });

  it("summarizes like count and current user selection", () => {
    expect(summarizeContentLikes([
      { userId: "member-1" },
      { userId: "member-2" },
    ], "member-1")).toEqual({
      likeCount: 2,
      likedByCurrentUser: true,
    });

    expect(summarizeContentLikes(null, null)).toEqual({
      likeCount: 0,
      likedByCurrentUser: false,
    });
  });
});
