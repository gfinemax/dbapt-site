import type { NewsDisplayAuthorName } from "@/lib/news-display-author";
import type { FreePostType } from "@/lib/free-post-type";

type FreeBoardPostPayloadInput = {
  title: string;
  content: string;
  postType: FreePostType;
  isStarred: boolean;
  isAdmin: boolean;
  displayAuthorName: NewsDisplayAuthorName;
  attachmentPath?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  registeredAt?: string;
};

type FreeBoardPostUpdatePayloadInput = FreeBoardPostPayloadInput & {
  postId: string;
};

type FreeBoardCommentCreatePayloadInput = {
  postId: string;
  content: string;
  parentCommentId?: string;
  isAdmin: boolean;
  displayAuthorName: NewsDisplayAuthorName;
};

type FreeBoardDeleteParams = {
  postId?: string;
  commentId?: string;
};

export function buildFreeBoardPostCreatePayload({
  title,
  content,
  postType,
  isStarred,
  isAdmin,
  displayAuthorName,
  attachmentPath,
  attachmentName,
  attachmentSize,
  registeredAt,
}: FreeBoardPostPayloadInput) {
  return {
    title,
    content,
    postType,
    isStarred,
    attachmentPath: attachmentPath ?? null,
    attachmentName: attachmentName ?? null,
    attachmentSize: attachmentSize ?? null,
    ...(isAdmin ? { displayAuthorName } : {}),
    ...(isAdmin && registeredAt ? { registeredAt } : {}),
  };
}

export function buildFreeBoardPostUpdatePayload({
  postId,
  title,
  content,
  postType,
  isStarred,
  isAdmin,
  displayAuthorName,
  attachmentPath,
  attachmentName,
  attachmentSize,
  registeredAt,
}: FreeBoardPostUpdatePayloadInput) {
  return {
    postId,
    title,
    content,
    postType,
    isStarred,
    attachmentPath: attachmentPath ?? null,
    attachmentName: attachmentName ?? null,
    attachmentSize: attachmentSize ?? null,
    ...(isAdmin ? { displayAuthorName } : {}),
    ...(isAdmin && registeredAt ? { registeredAt } : {}),
  };
}

export function buildFreeBoardCommentCreatePayload({
  postId,
  content,
  parentCommentId,
  isAdmin,
  displayAuthorName,
}: FreeBoardCommentCreatePayloadInput) {
  return {
    postId,
    content,
    ...(parentCommentId ? { parentCommentId } : {}),
    ...(isAdmin ? { displayAuthorName } : {}),
  };
}

export function buildFreeBoardDeleteUrl({ postId, commentId }: FreeBoardDeleteParams): string {
  const searchParams = new URLSearchParams();

  if (postId) {
    searchParams.set("postId", postId);
  } else if (commentId) {
    searchParams.set("commentId", commentId);
  }

  const query = searchParams.toString();
  return query ? `/api/news/free?${query}` : "/api/news/free";
}
