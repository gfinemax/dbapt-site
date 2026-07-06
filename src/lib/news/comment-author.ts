import type { NewsCommentView } from "@/lib/news/types";
import { getContentAuthorLabel } from "@/lib/content-author-label";

export function getNoticeCommentAuthorName(comment: Pick<NewsCommentView, "displayAuthorName" | "author">) {
  return getContentAuthorLabel(
    { ...comment.author, displayAuthorName: comment.displayAuthorName },
    null,
    { adminFallback: "운영자" },
  );
}
