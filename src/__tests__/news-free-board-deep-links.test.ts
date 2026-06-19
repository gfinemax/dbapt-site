import { describe, expect, it } from "vitest";

import {
  buildFreeBoardFocusedPostUrl,
  findFocusedFreePostId,
} from "@/lib/news/free-board-deep-links";

describe("free board deep-link helpers", () => {
  it("builds URLs for opening and closing focused posts", () => {
    expect(
      buildFreeBoardFocusedPostUrl("https://example.com/news?tab=notice&foo=bar", "post-1"),
    ).toBe("/news?tab=free&foo=bar&post=post-1");

    expect(
      buildFreeBoardFocusedPostUrl("https://example.com/news?tab=free&post=post-1&foo=bar", null),
    ).toBe("/news?tab=free&foo=bar");
  });

  it("finds a focused post id only when it exists in the current list", () => {
    const posts = [{ id: "post-1" }, { id: "post-2" }];

    expect(findFocusedFreePostId(new URLSearchParams("post=post-2"), posts)).toBe("post-2");
    expect(findFocusedFreePostId(new URLSearchParams("post=missing"), posts)).toBeNull();
    expect(findFocusedFreePostId(new URLSearchParams(""), posts)).toBeNull();
  });
});
