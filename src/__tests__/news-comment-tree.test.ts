import { describe, expect, it } from "vitest";
import { buildShallowCommentTree } from "@/lib/news/comment-tree";

describe("buildShallowCommentTree", () => {
  it("keeps top-level comments and attaches one-level replies in input order", () => {
    const tree = buildShallowCommentTree([
      { id: "root-1", content: "첫 댓글" },
      { id: "reply-1", parentId: "root-1", content: "첫 답글" },
      { id: "root-2", parentId: null, content: "둘째 댓글" },
      { id: "reply-2", parentId: "root-1", content: "둘째 답글" },
    ]);

    expect(tree).toMatchObject([
      {
        id: "root-1",
        parentId: null,
        replies: [
          { id: "reply-1", parentId: "root-1", replies: [] },
          { id: "reply-2", parentId: "root-1", replies: [] },
        ],
      },
      {
        id: "root-2",
        parentId: null,
        replies: [],
      },
    ]);
  });

  it("normalizes replies to replies under the original top-level comment", () => {
    const tree = buildShallowCommentTree([
      { id: "root", content: "원 댓글" },
      { id: "reply", parentId: "root", content: "답글" },
      { id: "nested", parentId: "reply", content: "답글의 답글" },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0]).toMatchObject({
      id: "root",
      replies: [
        { id: "reply", parentId: "root", replies: [] },
        { id: "nested", parentId: "root", replies: [] },
      ],
    });
  });

  it("treats comments with missing parents as top-level comments", () => {
    const tree = buildShallowCommentTree([
      { id: "orphan", parentId: "missing", content: "부모 없는 댓글" },
    ]);

    expect(tree).toMatchObject([
      {
        id: "orphan",
        parentId: null,
        replies: [],
      },
    ]);
  });
});
