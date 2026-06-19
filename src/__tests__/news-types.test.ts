import { describe, expect, expectTypeOf, it } from "vitest";
import { getNewsComments } from "@/lib/news/types";
import type {
  CoopNewsView,
  FAQView,
  FreePostView,
  NewsCommentView,
  NewsSessionView,
} from "@/lib/news/types";

describe("news view types", () => {
  it("exposes the shared shapes used by the news page client", () => {
    expectTypeOf<NewsSessionView>().toMatchTypeOf<{
      id: string;
      loginId: string | null;
      name: string | null;
      role: string;
      email?: string;
    }>();
    expectTypeOf<CoopNewsView["comments"][number]>().toMatchTypeOf<NewsCommentView>();
    expectTypeOf<FreePostView["comments"][number]["parentId"]>().toEqualTypeOf<string | null>();
    expectTypeOf<FAQView["createdAt"]>().toEqualTypeOf<string>();
  });

  it("returns an empty comment list when a news item has no comments array", () => {
    expect(getNewsComments(null)).toEqual([]);
    expect(getNewsComments(undefined)).toEqual([]);
    expect(getNewsComments({ id: "notice-1" })).toEqual([]);
  });

  it("returns the existing typed comment list for a news item", () => {
    const comments: NewsCommentView[] = [
      {
        id: "comment-1",
        content: "확인했습니다.",
        createdAt: "2026-06-19T00:00:00.000Z",
        parentId: null,
        displayAuthorName: "운영자",
        author: {
          id: "admin-1",
          name: "관리자",
          signupName: null,
          loginId: "admin",
          role: "ADMIN",
        },
      },
    ];

    expect(getNewsComments({ id: "notice-1", comments })).toBe(comments);
  });
});
