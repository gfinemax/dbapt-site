import type { NewsDisplayAuthorName } from "@/lib/news-display-author";

type NoticeCommentCreatePayloadInput = {
  newsId: string;
  content: string;
  parentCommentId?: string;
  isAdmin: boolean;
  displayAuthorName: NewsDisplayAuthorName;
};

type NoticeCommentUpdatePayloadInput = {
  commentId: string;
  content: string;
  isAdmin: boolean;
  displayAuthorName: NewsDisplayAuthorName;
};

export function buildNoticeCommentCreatePayload({
  newsId,
  content,
  parentCommentId,
  isAdmin,
  displayAuthorName,
}: NoticeCommentCreatePayloadInput) {
  return {
    newsId,
    content,
    ...(parentCommentId ? { parentCommentId } : {}),
    ...(isAdmin ? { displayAuthorName } : {}),
  };
}

export function buildNoticeCommentUpdatePayload({
  commentId,
  content,
  isAdmin,
  displayAuthorName,
}: NoticeCommentUpdatePayloadInput) {
  return {
    commentId,
    content,
    ...(isAdmin ? { displayAuthorName } : {}),
  };
}
