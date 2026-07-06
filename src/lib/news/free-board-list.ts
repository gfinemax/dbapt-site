import { normalizeFreePostType, type FreePostType } from "@/lib/free-post-type";
import type { CommentReactionSummaryItem } from "@/lib/news/comment-reactions";
import { buildShallowCommentTree, type ShallowCommentTreeNode } from "@/lib/news/comment-tree";
import { getPlainNoticeText } from "@/lib/news/rich-text";
import type { FreePostView, NewsCommentView, NewsUserView } from "@/lib/news/types";

export type FreeBoardTypeFilter = FreePostType | "ALL";

export type FreeBoardComment = {
  id: string;
  content: string;
  createdAt: string;
  author: NewsUserView;
  parentId: string | null;
  isReal: boolean;
  reactionSummary: CommentReactionSummaryItem[];
};

export type FreeBoardCommentView = ShallowCommentTreeNode<FreeBoardComment>;

export type FreeBoardPostListItem = {
  id: string;
  title: string;
  content: string;
  postType: FreePostType;
  viewCount: number;
  likeCount: number;
  likedByCurrentUser: boolean;
  isStarred: boolean;
  registeredAt: string;
  registeredAtRaw: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  socialImagePath: string | null;
  isPublicShareEnabled: boolean;
  publicShareEnabledAt: string | null;
  author: NewsUserView;
  comments: FreeBoardCommentView[];
  commentCount: number;
  isReal: boolean;
  isBookmarkedByCurrentUser: boolean;
};

export function formatFreeBoardDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.includes("T") ? value.slice(0, 16).replace("T", " ") : value;
  }

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function buildFreeBoardCommentTree(comments: readonly NewsCommentView[]): FreeBoardCommentView[] {
  const commentViews = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: formatFreeBoardDate(comment.createdAt),
    author: { ...comment.author, displayAuthorName: comment.displayAuthorName },
    parentId: comment.parentId || null,
    isReal: comment.isReal ?? true,
    reactionSummary: comment.reactionSummary || [],
  }));

  return buildShallowCommentTree(commentViews);
}

export function buildFreeBoardPostList(
  posts: readonly FreePostView[],
  typeFilter: FreeBoardTypeFilter,
  searchQuery: string,
): FreeBoardPostListItem[] {
  const query = searchQuery.trim().toLowerCase();

  return posts
    .map((post) => {
      const registeredAtRaw = post.registeredAt || post.createdAt;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        postType: normalizeFreePostType(post.postType, true),
        viewCount: post.viewCount ?? 0,
        likeCount: post.likeCount ?? 0,
        likedByCurrentUser: !!post.likedByCurrentUser,
        isStarred: !!post.isStarred,
        registeredAt: formatFreeBoardDate(registeredAtRaw),
        registeredAtRaw,
        attachmentPath: post.attachmentPath ?? null,
        attachmentName: post.attachmentName ?? null,
        attachmentSize: post.attachmentSize ?? null,
        socialImagePath: post.socialImagePath ?? null,
        isPublicShareEnabled: !!post.isPublicShareEnabled,
        publicShareEnabledAt: post.publicShareEnabledAt ?? null,
        author: { ...post.author, displayAuthorName: post.displayAuthorName },
        comments: buildFreeBoardCommentTree(post.comments || []),
        commentCount: (post.comments || []).length,
        isReal: true,
        isBookmarkedByCurrentUser: !!post.isBookmarkedByCurrentUser,
      };
    })
    .filter((post) => {
      const typeMatches = typeFilter === "ALL" || post.postType === typeFilter;
      const queryMatches =
        !query ||
        post.title.toLowerCase().includes(query) ||
        getPlainNoticeText(post.content).toLowerCase().includes(query);

      return typeMatches && queryMatches;
    });
}
