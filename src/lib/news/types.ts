import type { FreePostType } from "@/lib/free-post-type";
import type { CommentReactionSummaryItem } from "@/lib/news/comment-reactions";

export type NewsUserView = {
  id: string;
  name: string | null;
  signupName?: string | null;
  loginId: string | null;
  role: string;
  displayAuthorName?: string | null;
};

export type NewsSessionView = {
  id: string;
  loginId: string | null;
  name: string | null;
  role: string;
  email?: string;
};

export type NewsCommentView = {
  id: string;
  content: string;
  createdAt: string;
  newsId?: string;
  postId?: string;
  parentId: string | null;
  displayAuthorName?: string | null;
  author: NewsUserView;
  reactionSummary?: CommentReactionSummaryItem[];
  isReal?: boolean;
};

export type CoopNewsView = {
  id: string;
  category: string;
  title: string;
  content: string;
  viewCount?: number;
  isStarred?: boolean;
  imagePath?: string | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  displayAuthorName?: string | null;
  registeredAt?: string;
  createdAt: string;
  updatedAt?: string;
  author: NewsUserView;
  comments: NewsCommentView[];
  isReal?: boolean;
  isBookmarkedByCurrentUser?: boolean;
};

export type FreePostView = {
  id: string;
  title: string;
  content: string;
  postType: FreePostType | string;
  displayAuthorName?: string | null;
  isStarred?: boolean;
  isPublicShareEnabled?: boolean;
  publicShareEnabledAt?: string | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  registeredAt?: string;
  createdAt: string;
  updatedAt?: string;
  author: NewsUserView;
  comments: NewsCommentView[];
  isReal?: boolean;
  isBookmarkedByCurrentUser?: boolean;
};

export type FAQView = {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  isReal?: boolean;
};

export function getNewsComments(
  news: { comments?: readonly NewsCommentView[] | null } | null | undefined,
): NewsCommentView[] {
  return Array.isArray(news?.comments) ? news.comments : [];
}
