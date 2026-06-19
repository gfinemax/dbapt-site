import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
} from "@/lib/news-display-author";
import type { CoopNewsView, NewsCommentView, NewsSessionView } from "@/lib/news/types";

export type NoticeCommentEditDraft = {
  id: string;
  content: string;
  displayAuthorName: NewsDisplayAuthorName;
};

export function canEditNotice(
  notice: Pick<CoopNewsView, "id"> | null | undefined,
  isAdmin: boolean,
): boolean {
  return isAdmin && isRealNotice(notice);
}

export function canCommentOnNotice(
  notice: Pick<CoopNewsView, "id"> | null | undefined,
): boolean {
  return isRealNotice(notice);
}

export function canMutateNoticeComment(
  comment: Pick<NewsCommentView, "author">,
  session: Pick<NewsSessionView, "id" | "role"> | null | undefined,
): boolean {
  return session?.role === "ADMIN" || comment.author?.id === session?.id;
}

export function buildNoticeCommentEditDraft(comment: NewsCommentView): NoticeCommentEditDraft {
  const displayAuthorName = comment.displayAuthorName;

  return {
    id: comment.id,
    content: comment.content || "",
    displayAuthorName:
      displayAuthorName && NEWS_DISPLAY_AUTHOR_NAMES.includes(displayAuthorName as NewsDisplayAuthorName)
        ? (displayAuthorName as NewsDisplayAuthorName)
        : "운영자",
  };
}

function isRealNotice(notice: Pick<CoopNewsView, "id"> | null | undefined): boolean {
  return !!notice?.id && !String(notice.id).startsWith("mock-");
}
