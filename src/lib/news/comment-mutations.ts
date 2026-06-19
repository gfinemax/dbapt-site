import { getNewsComments, type CoopNewsView, type NewsCommentView } from "@/lib/news/types";

export type NoticeCommentMutation = NewsCommentView & {
  newsId: string;
};

export function appendNoticeComment(
  notice: CoopNewsView | null,
  newsId: string,
  comment: NewsCommentView,
): CoopNewsView | null {
  if (!notice || notice.id !== newsId) return notice;

  return {
    ...notice,
    comments: [...getNewsComments(notice), comment],
  };
}

export function appendNoticeCommentToList(
  newsList: readonly CoopNewsView[],
  newsId: string,
  comment: NewsCommentView,
): CoopNewsView[] {
  return newsList.map((notice) => appendNoticeComment(notice, newsId, comment) as CoopNewsView);
}

export function replaceNoticeComment(
  notice: CoopNewsView | null,
  comment: NoticeCommentMutation,
): CoopNewsView | null {
  if (!notice || notice.id !== comment.newsId) return notice;

  return {
    ...notice,
    comments: getNewsComments(notice).map((existing) => (
      existing.id === comment.id ? comment : existing
    )),
  };
}

export function replaceNoticeCommentInList(
  newsList: readonly CoopNewsView[],
  comment: NoticeCommentMutation,
): CoopNewsView[] {
  return newsList.map((notice) => replaceNoticeComment(notice, comment) as CoopNewsView);
}

export function removeNoticeComment(
  notice: CoopNewsView | null,
  commentId: string,
): CoopNewsView | null {
  if (!notice) return notice;

  return {
    ...notice,
    comments: getNewsComments(notice).filter((comment) => (
      comment.id !== commentId && comment.parentId !== commentId
    )),
  };
}

export function removeNoticeCommentFromList(
  newsList: readonly CoopNewsView[],
  commentId: string,
): CoopNewsView[] {
  return newsList.map((notice) => removeNoticeComment(notice, commentId) as CoopNewsView);
}
