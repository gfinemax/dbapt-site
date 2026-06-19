import type { NewsCommentView } from "@/lib/news/types";

export function getNoticeCommentAuthorName(comment: Pick<NewsCommentView, "displayAuthorName" | "author">) {
  if (comment.author?.role === "ADMIN") {
    return comment.displayAuthorName || "운영자";
  }

  return comment.author?.name || "조합원";
}
