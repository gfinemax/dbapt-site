"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FREE_POST_TYPES,
  type FreePostType,
  getFreePostTypeMeta,
  getFreePostTypeOptions,
  normalizeFreePostType,
} from "@/lib/free-post-type";
import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
} from "@/lib/news-display-author";
import {
  buildFreeBoardPostList,
  type FreeBoardCommentView,
  type FreeBoardPostListItem,
  type FreeBoardTypeFilter,
} from "@/lib/news/free-board-list";
import { getFreeBoardAuthorLabel } from "@/lib/news/free-board-author";
import {
  buildFreeBoardFocusedPostUrl,
  findFocusedFreePostId,
} from "@/lib/news/free-board-deep-links";
import {
  buildFreeBoardCommentCreatePayload,
  buildFreeBoardDeleteUrl,
  buildFreeBoardPostCreatePayload,
  buildFreeBoardPostUpdatePayload,
} from "@/lib/news/free-board-api";
import { uploadPublicFile } from "@/lib/news/public-upload";
import { copyFreeBoardOpenChatAnnouncement } from "@/lib/news/free-board-openchat";
import type { FreePostView, NewsSessionView, NewsUserView } from "@/lib/news/types";
import { NoticeRichContent, NoticeRichEditor, getPlainNoticeText } from "./notice-rich-editor";
import { PersonalBookmarkButton } from "./personal-bookmark-button";

type FreeBoardProps = {
  session: NewsSessionView | null | undefined;
  posts: FreePostView[];
  onRefresh: () => Promise<void>;
  isPublicShareView?: boolean;
};

function formatAttachmentSize(size: number | null | undefined) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024)).toLocaleString("ko-KR")}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function toKoreaDateTimeLocalValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(" ", "T");
}

function FreeBoardPostRows({
  post,
  index,
  authorLabel,
  showDeletePost,
  showOpenChatCopy,
  showBookmark,
  openChatCopyStatus,
  onOpen,
  onDelete,
  onOpenChatCopy,
}: {
  post: FreeBoardPostListItem;
  index: number;
  authorLabel: string;
  showDeletePost: boolean;
  showOpenChatCopy: boolean;
  showBookmark: boolean;
  openChatCopyStatus?: "copying" | "copied" | "error";
  onOpen: () => void;
  onDelete: (params: { postId?: string; commentId?: string }) => void;
  onOpenChatCopy: (post: FreeBoardPostListItem) => void;
}) {
  const typeMeta = getFreePostTypeMeta(post.postType);

  return (
    <tr
      onClick={onOpen}
      className={cn(
        "cursor-pointer transition-all duration-150 hover:bg-sky-blue/[0.03]",
        index % 2 === 1 ? "bg-[#fdfcfa]" : "bg-white",
      )}
    >
      <td className="px-5 py-4 text-center text-xs text-ash font-mono tabular-nums">
        {index + 1}
      </td>
      <td className="px-5 py-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.isStarred && (
              <span className="rounded bg-amber-500/15 text-amber-600 text-[9px] font-extrabold px-1.5 py-0.5 border border-amber-500/20 select-none">
                ★ 중요
              </span>
            )}
            <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-extrabold", typeMeta.badgeClassName)}>
              {typeMeta.label}
            </span>
            <span className="text-[13px] font-bold text-charcoal-primary leading-snug">
              {post.title}
            </span>
          </div>
          <p className="line-clamp-1 text-[11px] font-normal text-graphite/75">
            {getPlainNoticeText(post.content)}
          </p>
        </div>
      </td>
      <td className="px-5 py-4 text-center text-xs text-graphite/80 font-normal">
        {authorLabel}
      </td>
      <td className="px-5 py-4 text-center text-xs text-ash font-mono">
        {post.registeredAt}
      </td>
      <td className="px-5 py-4 text-center">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-extrabold text-sky-blue hover:bg-sky-blue/15"
        >
          댓글 {post.commentCount}개 보기
        </button>
      </td>
      <td className="px-5 py-4 text-center">
        {(showBookmark || showOpenChatCopy || showDeletePost) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {showBookmark && (
              <PersonalBookmarkButton
                title={post.title}
                targetType="FREE_POST"
                targetId={post.id}
                initialBookmarked={post.isBookmarkedByCurrentUser}
              />
            )}
            {showOpenChatCopy && (
              <button
                type="button"
                aria-label={`${post.title} 오픈채팅 공지문 복사`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenChatCopy(post);
                }}
                disabled={openChatCopyStatus === "copying"}
                className="rounded-full border border-meadow-green/25 bg-meadow-green/10 px-2.5 py-1 text-[10px] font-bold text-meadow-green hover:bg-meadow-green/15 disabled:opacity-60"
              >
                {openChatCopyStatus === "copying" ? "복사 중" : "공지문 복사"}
              </button>
            )}
            {showOpenChatCopy && openChatCopyStatus === "copied" && (
              <span className="text-[9px] font-bold text-meadow-green">복사됨</span>
            )}
            {showOpenChatCopy && openChatCopyStatus === "error" && (
              <span className="text-[9px] font-bold text-ember-orange">실패</span>
            )}
            {showDeletePost && (
              <button
                type="button"
                aria-label="게시글 삭제"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete({ postId: post.id });
                }}
                className="rounded-full border border-coral-red/20 bg-coral-red/10 px-2.5 py-1 text-[10px] font-bold text-coral-red hover:bg-coral-red/15"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export function FreeBoard({
  session,
  posts = [],
  onRefresh,
  isPublicShareView = false,
}: FreeBoardProps) {
  const currentUserId = session?.id;
  const isAdmin = session?.role === "ADMIN";
  const isReadOnlyPublicShare = isPublicShareView && !session;

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FreeBoardTypeFilter>("ALL");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [openChatCopyStatus, setOpenChatCopyStatus] = useState<Record<string, "copying" | "copied" | "error">>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showWriteModal || focusedPostId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showWriteModal, focusedPostId]);

  // New Post Form State
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<FreeBoardPostListItem | null>(null);
  const [writeIsStarred, setWriteIsStarred] = useState(false);
  const [writeIsPublicShareEnabled, setWriteIsPublicShareEnabled] = useState(false);
  const [writePostType, setWritePostType] = useState<FreePostType>("FREE");
  const [writeDisplayAuthorName, setWriteDisplayAuthorName] = useState<NewsDisplayAuthorName>("운영자");
  const [writeAttachmentPath, setWriteAttachmentPath] = useState<string | null>(null);
  const [writeAttachmentName, setWriteAttachmentName] = useState<string | null>(null);
  const [writeAttachmentSize, setWriteAttachmentSize] = useState<number | null>(null);
  const [writeRegisteredAt, setWriteRegisteredAt] = useState("");
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const resetWriteForm = () => {
    setEditingPost(null);
    setWriteTitle("");
    setWriteContent("");
    setWriteIsStarred(false);
    setWriteIsPublicShareEnabled(false);
    setWritePostType("FREE");
    setWriteDisplayAuthorName("운영자");
    setWriteAttachmentPath(null);
    setWriteAttachmentName(null);
    setWriteAttachmentSize(null);
    setWriteRegisteredAt("");
  };

  const handleCloseWriteModal = () => {
    setShowWriteModal(false);
    resetWriteForm();
  };

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingAttachment(true);
    try {
      const uploadData = await uploadPublicFile(file, "free-attachment");
      setWriteAttachmentPath(uploadData.url);
      setWriteAttachmentName(uploadData.name);
      setWriteAttachmentSize(uploadData.size);
    } catch (err) {
      alert(err instanceof Error ? err.message : "첨부파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingAttachment(false);
    }
  };


  // New Comment Form State (Mapped by Post ID)
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [commentDisplayAuthorName, setCommentDisplayAuthorName] = useState<NewsDisplayAuthorName>("운영자");

  const combinedPosts = useMemo(
    () => buildFreeBoardPostList(posts, typeFilter, searchQuery),
    [posts, searchQuery, typeFilter],
  );

  const focusedPost = useMemo(
    () => combinedPosts.find((post) => post.id === focusedPostId) || null,
    [combinedPosts, focusedPostId],
  );
  const focusedPostTypeMeta = focusedPost ? getFreePostTypeMeta(focusedPost.postType) : null;

  const updateFocusedPostUrl = (postId: string | null) => {
    if (typeof window === "undefined") return;
    window.history.pushState({}, "", buildFreeBoardFocusedPostUrl(window.location.href, postId));
  };

  const openFocusedPost = (postId: string) => {
    setFocusedPostId(postId);
    updateFocusedPostUrl(postId);
  };

  const openFocusedPostFromLink = (href: string) => {
    if (typeof window === "undefined") return;
    const nextUrl = new URL(href, window.location.href);
    const postId = findFocusedFreePostId(nextUrl.searchParams, combinedPosts);
    if (!postId) return;
    openFocusedPost(postId);
  };

  const closeFocusedPost = () => {
    setFocusedPostId(null);
    updateFocusedPostUrl(null);
  };

  useEffect(() => {
    const syncFocusedPostFromUrl = () => {
      setFocusedPostId(findFocusedFreePostId(new URLSearchParams(window.location.search), combinedPosts));
    };

    syncFocusedPostFromUrl();
    window.addEventListener("popstate", syncFocusedPostFromUrl);
    return () => window.removeEventListener("popstate", syncFocusedPostFromUrl);
  }, [combinedPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeTitle.trim() || !getPlainNoticeText(writeContent).trim()) {
      alert("제목과 본문을 모두 작성해 주십시오.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPost) {
        const res = await fetch("/api/news/free", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildFreeBoardPostUpdatePayload({
            postId: editingPost.id,
            title: writeTitle,
            content: writeContent,
            postType: writePostType,
            isStarred: writeIsStarred,
            isAdmin,
            displayAuthorName: writeDisplayAuthorName,
            attachmentPath: writeAttachmentPath,
            attachmentName: writeAttachmentName,
            attachmentSize: writeAttachmentSize,
            registeredAt: writeRegisteredAt,
            isPublicShareEnabled: writeIsPublicShareEnabled,
          })),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "게시글 수정 과정에서 문제가 발생했습니다.");
          return;
        }

        setShowWriteModal(false);
        resetWriteForm();
        await onRefresh();
      } else {
        const res = await fetch("/api/news/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildFreeBoardPostCreatePayload({
            title: writeTitle,
            content: writeContent,
            postType: writePostType,
            isStarred: writeIsStarred,
            isAdmin,
            displayAuthorName: writeDisplayAuthorName,
            attachmentPath: writeAttachmentPath,
            attachmentName: writeAttachmentName,
            attachmentSize: writeAttachmentSize,
            registeredAt: writeRegisteredAt,
            isPublicShareEnabled: writeIsPublicShareEnabled,
          })),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "게시글 게시 과정에서 문제가 발생했습니다.");
          return;
        }

        setShowWriteModal(false);
        resetWriteForm();
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "게시글 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCreateComment = async (postId: string, parentCommentId?: string) => {
    const key = parentCommentId || postId;
    const text = parentCommentId ? replyContents[parentCommentId] || "" : commentContents[postId] || "";
    if (!text.trim()) {
      alert(parentCommentId ? "답글 내용을 입력해 주십시오." : "댓글 내용을 입력해 주십시오.");
      return;
    }

    setCommentSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/news/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildFreeBoardCommentCreatePayload({
          postId,
          content: text,
          parentCommentId,
          isAdmin,
          displayAuthorName: commentDisplayAuthorName,
        })),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "댓글 작성에 실패했습니다.");
        return;
      }

      if (parentCommentId) {
        setReplyContents((prev) => ({ ...prev, [parentCommentId]: "" }));
        setReplyingCommentId(null);
        setExpandedReplies((prev) => ({ ...prev, [parentCommentId]: true }));
      } else {
        setCommentContents((prev) => ({ ...prev, [postId]: "" }));
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert(parentCommentId ? "답글 저장 중 오류가 발생했습니다." : "댓글 저장 중 오류가 발생했습니다.");
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const openReplyInput = (topLevelComment: FreeBoardCommentView, targetAuthor?: NewsUserView) => {
    setReplyingCommentId(topLevelComment.id);
    setExpandedReplies((prev) => ({ ...prev, [topLevelComment.id]: true }));
    if (targetAuthor) {
      const authorName = getFreeBoardAuthorLabel(targetAuthor, currentUserId).split(" ")[0];
      setReplyContents((prev) => ({
        ...prev,
        [topLevelComment.id]: prev[topLevelComment.id]?.trim() ? prev[topLevelComment.id] : `@${authorName} `,
      }));
    }
  };

  const handleDeletePostOrComment = async (params: { postId?: string; commentId?: string }) => {
    if (!confirm("정말 이 대상을 영구 삭제하시겠습니까?\n\n삭제 후에는 복구할 수 없습니다.")) {
      return;
    }

    try {
      const res = await fetch(buildFreeBoardDeleteUrl(params), { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "삭제 작업에 실패했습니다.");
        return;
      }

      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  const handleOpenChatCopy = async (post: FreeBoardPostListItem) => {
    if (!post.isReal) return;

    setOpenChatCopyStatus((prev) => ({ ...prev, [post.id]: "copying" }));
    try {
      await copyFreeBoardOpenChatAnnouncement({ postId: post.id });
      setOpenChatCopyStatus((prev) => ({ ...prev, [post.id]: "copied" }));
    } catch (e) {
      console.error(e);
      setOpenChatCopyStatus((prev) => ({ ...prev, [post.id]: "error" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#f2f0ed] pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                <span>💬</span> 자유게시판
              </h3>
              <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                Cooperative Community Board
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-bold text-meadow-green bg-meadow-green/10 border border-meadow-green/20 rounded-full px-2.5 py-0.5 select-none lg:hidden">
              {isReadOnlyPublicShare ? "공개 공유 링크" : "조합원 인증 완료 🔓"}
            </span>
          </div>
          {!isReadOnlyPublicShare && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <span className="hidden shrink-0 text-[10px] font-bold text-meadow-green bg-meadow-green/10 border border-meadow-green/20 rounded-full px-2.5 py-0.5 select-none lg:inline-flex">
              조합원 인증 완료 🔓
            </span>
            <div className="relative w-full sm:w-80">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="자유게시판 제목/내용 검색…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
              />
            </div>
            <label htmlFor="free-post-type-filter" className="sr-only">
              글 유형 필터
            </label>
            <select
              id="free-post-type-filter"
              aria-label="글 유형 필터"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as FreeBoardTypeFilter)}
              className="h-9.5 w-full rounded-xl border border-stone-surface bg-white px-3 text-xs font-bold text-charcoal-primary shadow-2xs outline-none transition focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/30 sm:w-32"
            >
              <option value="ALL">전체 유형</option>
              {FREE_POST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getFreePostTypeMeta(type).label}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                resetWriteForm();
                if (isAdmin) {
                  setWriteRegisteredAt(toKoreaDateTimeLocalValue(new Date().toISOString()));
                }
                setShowWriteModal(true);
              }}
              className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              ✍️ 새 게시글 작성
            </Button>
          </div>
          )}
          {isReadOnlyPublicShare && (
            <span className="hidden shrink-0 text-[10px] font-bold text-meadow-green bg-meadow-green/10 border border-meadow-green/20 rounded-full px-2.5 py-0.5 select-none lg:inline-flex">
              공개 공유 링크
            </span>
          )}
        </div>
      </div>

      {/* 자유게시판 글 목록 */}
      <div className="bg-white rounded-2xl border border-stone-surface overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table aria-label="자유게시판 게시글 목록" className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#f7f6f3] border-b border-stone-surface text-xs font-bold text-ash">
              <tr>
                <th className="px-5 py-3.5 w-14 text-center">No.</th>
                <th className="px-5 py-3.5">제목</th>
                <th className="px-5 py-3.5 w-36 text-center">작성자</th>
                <th className="px-5 py-3.5 w-32 text-center">등록일</th>
                <th className="px-5 py-3.5 w-24 text-center">댓글</th>
                <th className="px-5 py-3.5 w-36 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-surface/50 text-graphite font-medium">
              {combinedPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-xs text-graphite/70 font-normal">
                    검색 조건에 맞는 자유게시판 글이 없습니다.
                  </td>
                </tr>
              ) : (
                combinedPosts.map((post, index) => {
                  const authorLabel = getFreeBoardAuthorLabel(post.author, currentUserId);
                  const showDeletePost = post.isReal && (post.author.id === currentUserId || isAdmin);
                  const showOpenChatCopy = post.isReal && isAdmin;
                  const showBookmark = !!session && post.isReal && !isReadOnlyPublicShare;

                  return (
                    <FreeBoardPostRows
                      key={post.id}
                      post={post}
                      index={index}
                      authorLabel={authorLabel}
                      showDeletePost={showDeletePost}
                      showOpenChatCopy={showOpenChatCopy}
                      showBookmark={showBookmark}
                      openChatCopyStatus={openChatCopyStatus[post.id]}
                      onOpen={() => openFocusedPost(post.id)}
                      onDelete={handleDeletePostOrComment}
                      onOpenChatCopy={handleOpenChatCopy}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 토론 집중 패널 */}
      {mounted && focusedPost && createPortal(
        <>
          <div
            onClick={closeFocusedPost}
            className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />
          <aside
            aria-label="토론 집중 패널"
            className="fixed inset-y-0 left-0 z-[130] flex w-full max-w-2xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 shadow-2xl animate-in slide-in-from-left duration-300 ease-out sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-stone-surface pb-6">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                  💬
                </span>
                <div>
                  <h2 className="text-base font-bold text-charcoal-primary">
                    자유게시판 글 열람
                  </h2>
                  <p className="mt-0.5 text-[11px] font-medium text-ash">
                    대방동 지역주택조합 조합원 소통
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeFocusedPost}
                className="flex items-center justify-center gap-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] px-3 py-1.5 text-xs font-medium text-graphite transition duration-200 hover:bg-stone-surface active:bg-[#e8e6e1]"
              >
                <svg className="size-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                목록으로
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-extrabold text-charcoal-primary leading-snug">
                  {focusedPost.isStarred && (
                    <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-extrabold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                      ★ 중요
                    </span>
                  )}
                  {focusedPost.title}
                  </h3>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {session && focusedPost.isReal && !isReadOnlyPublicShare && (
                      <PersonalBookmarkButton
                        title={focusedPost.title}
                        targetType="FREE_POST"
                        targetId={focusedPost.id}
                        initialBookmarked={focusedPost.isBookmarkedByCurrentUser}
                      />
                    )}
                    {focusedPost.isReal && (focusedPost.author.id === currentUserId || isAdmin) && (
                      <button
                        type="button"
                        aria-label="게시글 수정"
                        onClick={() => {
                          const displayAuthorName = focusedPost.author.displayAuthorName;
                          setEditingPost(focusedPost);
                          setWriteTitle(focusedPost.title);
                          setWriteContent(focusedPost.content);
                          setWritePostType(normalizeFreePostType(focusedPost.postType, isAdmin));
                          setWriteIsStarred(!!focusedPost.isStarred);
                          setWriteIsPublicShareEnabled(!!focusedPost.isPublicShareEnabled);
                          setWriteAttachmentPath(focusedPost.attachmentPath);
                          setWriteAttachmentName(focusedPost.attachmentName);
                          setWriteAttachmentSize(focusedPost.attachmentSize);
                          setWriteRegisteredAt(toKoreaDateTimeLocalValue(focusedPost.registeredAtRaw));
                          setWriteDisplayAuthorName(
                            displayAuthorName && NEWS_DISPLAY_AUTHOR_NAMES.includes(displayAuthorName as NewsDisplayAuthorName)
                              ? displayAuthorName as NewsDisplayAuthorName
                              : "운영자",
                          );
                          setShowWriteModal(true);
                        }}
                        className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                      >
                        수정
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-y border-stone-surface/65 py-2.5 text-[11px] font-bold text-ash font-mono">
                  {focusedPostTypeMeta && (
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-extrabold", focusedPostTypeMeta.badgeClassName)}>
                      {focusedPostTypeMeta.label}
                    </span>
                  )}
                  <span>작성자: {getFreeBoardAuthorLabel(focusedPost.author, currentUserId)}</span>
                  <span>•</span>
                  <span>{focusedPost.registeredAt}</span>
                  <span>•</span>
                  <span>댓글 {focusedPost.commentCount}개</span>
                </div>
                {focusedPost.attachmentPath && focusedPost.attachmentName && (
                  <a
                    href={focusedPost.attachmentPath}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${focusedPost.attachmentName} 다운로드`}
                    className="inline-flex max-w-full items-center gap-2 rounded-xl border border-sky-blue/20 bg-sky-blue/10 px-3 py-2 text-[11px] font-extrabold text-sky-blue hover:bg-sky-blue/15"
                  >
                    <span aria-hidden="true">첨부</span>
                    <span className="truncate">{focusedPost.attachmentName}</span>
                    {focusedPost.attachmentSize ? (
                      <span className="shrink-0 font-mono text-[10px] text-sky-blue/75">
                        {formatAttachmentSize(focusedPost.attachmentSize)}
                      </span>
                    ) : null}
                  </a>
                )}
              </div>

              <div className="pt-2">
                <NoticeRichContent
                  content={focusedPost.content}
                  onInternalLinkClick={openFocusedPostFromLink}
                />
              </div>

              {isReadOnlyPublicShare ? (
                <section className="space-y-3 border-t border-stone-surface pt-5">
                  <div className="rounded-2xl border border-stone-surface bg-white px-4 py-4">
                    <p className="text-[11px] font-medium leading-relaxed text-ash">
                      댓글과 답글은 조합원 로그인 후 확인하거나 작성할 수 있습니다.
                    </p>
                  </div>
                </section>
              ) : (
              <section className="space-y-4 border-t border-stone-surface pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black text-charcoal-primary">
                    댓글 {focusedPost.commentCount}개
                  </h4>
                  <span className="text-[10px] font-bold text-ash">댓글 의견</span>
                </div>

                {focusedPost.comments.length === 0 ? (
                  <div className="rounded-2xl border border-stone-surface bg-white px-4 py-5 text-center">
                    <p className="text-[11px] font-medium text-ash">
                      아직 등록된 댓글이 없습니다. 첫 의견을 남겨보세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {focusedPost.comments.map((comm: FreeBoardCommentView) => {
                      const commAuthor = getFreeBoardAuthorLabel(comm.author, currentUserId);
                      const showDeleteComm = comm.isReal && (comm.author.id === currentUserId || isAdmin);
                      const repliesExpanded = expandedReplies[comm.id] || false;
                      return (
                        <article key={comm.id} className="rounded-2xl border border-stone-surface bg-white px-4 py-3.5">
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="flex size-6 items-center justify-center rounded-full bg-meadow-green/10 text-[10px] font-black text-meadow-green">
                                  말
                                </span>
                                <span className="text-[11px] font-black text-charcoal-primary">
                                  {commAuthor}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9.5px] font-mono font-bold text-ash">{comm.createdAt}</span>
                                {showDeleteComm && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePostOrComment({ commentId: comm.id })}
                                    className="rounded-full bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="mt-2.5 text-[12px] text-graphite font-normal leading-relaxed whitespace-pre-wrap">
                              {comm.content}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {focusedPost.isReal && (
                                <button
                                  type="button"
                                  aria-label="답글 작성"
                                  onClick={() => openReplyInput(comm)}
                                  className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-graphite hover:bg-stone-surface"
                                >
                                  답글
                                </button>
                              )}
                              {comm.replies.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedReplies((prev) => ({ ...prev, [comm.id]: !repliesExpanded }))}
                                  className="rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-extrabold text-sky-blue hover:bg-sky-blue/15"
                                >
                                  답글 {comm.replies.length}개 {repliesExpanded ? "숨기기" : "보기"}
                                </button>
                              )}
                            </div>
                          </div>

                          {repliesExpanded && comm.replies.length > 0 && (
                            <div className="mt-3 space-y-2 border-l-2 border-stone-surface pl-3">
                              {comm.replies.map((reply) => {
                                const replyAuthor = getFreeBoardAuthorLabel(reply.author, currentUserId);
                                const showDeleteReply = reply.isReal && (reply.author.id === currentUserId || isAdmin);
                                return (
                                  <div key={reply.id} className="rounded-xl bg-[#f8f7f4] px-3 py-2.5">
                                    <div className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-bold text-ash font-mono">
                                      <span>작성자: {replyAuthor}</span>
                                      <div className="flex items-center gap-2">
                                        <span>{reply.createdAt}</span>
                                        {showDeleteReply && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeletePostOrComment({ commentId: reply.id })}
                                            className="rounded-full bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red"
                                          >
                                            삭제
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-[12px] text-graphite/90 font-normal leading-relaxed">
                                      {reply.content}
                                    </p>
                                    {focusedPost.isReal && (
                                      <button
                                        type="button"
                                        aria-label="답글에 답글 작성"
                                        onClick={() => openReplyInput(comm, reply.author)}
                                        className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-graphite hover:bg-stone-surface"
                                      >
                                        답글
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {replyingCommentId === comm.id && focusedPost.isReal && (
                            <div className="mt-3 space-y-2 border-l-2 border-sky-blue/30 pl-3">
                              {isAdmin && (
                                <div className="space-y-1">
                                  <label htmlFor={`free-reply-author-${comm.id}`} className="text-[10px] font-bold text-charcoal-primary font-mono">
                                    답글 작성자
                                  </label>
                                  <select
                                    id={`free-reply-author-${comm.id}`}
                                    aria-label="답글 작성자"
                                    value={commentDisplayAuthorName}
                                    onChange={(event) => setCommentDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                                    className="h-8 rounded-xl border border-stone-surface bg-white px-3 text-[11px] font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                                  >
                                    {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                                      <option key={name} value={name}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="원댓글에 답글을 작성해 주세요…"
                                  value={replyContents[comm.id] || ""}
                                  onChange={(event) => setReplyContents((prev) => ({ ...prev, [comm.id]: event.target.value }))}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      handleCreateComment(focusedPost.id, comm.id);
                                    }
                                  }}
                                  className="flex-1 rounded-xl border border-stone-surface bg-white px-3 py-2 text-[12px] text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue"
                                />
                                <Button
                                  type="button"
                                  onClick={() => handleCreateComment(focusedPost.id, comm.id)}
                                  disabled={commentSubmitting[comm.id]}
                                  className="rounded-xl bg-midnight px-3 text-[11px] font-bold text-white disabled:opacity-50"
                                >
                                  답글 등록
                                </Button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!focusedPost.isReal) {
                      alert("시연용 아카이브 포스트에는 댓글 전송이 차단되어 있습니다.\n실제 게시판 연동을 확인하시려면, 새 게시글을 직접 작성한 후 댓글을 작성하십시오!");
                      return;
                    }
                    handleCreateComment(focusedPost.id);
                  }}
                  className="space-y-3 rounded-2xl border border-stone-surface bg-white p-3.5"
                >
                  {isAdmin && (
                    <div className="space-y-1.5">
                      <label htmlFor={`free-comment-author-${focusedPost.id}`} className="text-[10px] font-bold text-charcoal-primary font-mono">
                        댓글 작성자
                      </label>
                      <select
                        id={`free-comment-author-${focusedPost.id}`}
                        aria-label="댓글 작성자"
                        value={commentDisplayAuthorName}
                        onChange={(event) => setCommentDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                        className="h-9 rounded-xl border border-stone-surface bg-white px-3 text-[11px] font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                      >
                        {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <label htmlFor={`free-comment-${focusedPost.id}`} className="sr-only">
                    자유게시판 댓글 작성
                  </label>
                  <textarea
                    id={`free-comment-${focusedPost.id}`}
                    placeholder={focusedPost.isReal ? "안전하고 고운 의견 댓글을 작성해 주세요…" : "가상 데모 보존 게시글에는 댓글을 추가하실 수 없습니다."}
                    value={commentContents[focusedPost.id] || ""}
                    disabled={!focusedPost.isReal}
                    rows={3}
                    onChange={(event) => setCommentContents((prev) => ({ ...prev, [focusedPost.id]: event.target.value }))}
                    className="w-full resize-none rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-xs text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={commentSubmitting[focusedPost.id] || !focusedPost.isReal}
                      className="rounded-full bg-midnight px-5 h-9 text-xs font-bold text-white disabled:opacity-50"
                    >
                      의견 등록
                    </Button>
                  </div>
                </form>
              </section>
              )}
            </div>
          </aside>
        </>,
        document.body,
      )}

      {/* 새 글 작성 드로어 */}
      {mounted && showWriteModal && createPortal(
        <>
          <div
            onClick={handleCloseWriteModal}
            className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />
          <div
            className="fixed inset-y-0 right-0 z-[130] w-full max-w-lg bg-warm-canvas border-l border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 ease-out"
            aria-label={editingPost ? "게시글 수정 드로어" : "새 게시글 작성 드로어"}
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface mb-6">
              <h3 className="text-base font-black text-charcoal-primary flex items-center gap-1.5">
                <span>✍️</span> {editingPost ? "게시글 수정" : "새 게시글 작성"}
              </h3>
              <button
                onClick={handleCloseWriteModal}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5 flex-1">
              {isAdmin && (
                <div className="space-y-1.5">
                  <label htmlFor="free-post-display-author" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                    게시글 작성자
                  </label>
                  <select
                    id="free-post-display-author"
                    aria-label="게시글 작성자"
                    value={writeDisplayAuthorName}
                    onChange={(event) => setWriteDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                    className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                  >
                    {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="free-post-type" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  글 유형
                </label>
                <select
                  id="free-post-type"
                  aria-label="글 유형"
                  value={writePostType}
                  onChange={(event) => setWritePostType(normalizeFreePostType(event.target.value, isAdmin))}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                >
                  {getFreePostTypeOptions(isAdmin).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label htmlFor="free-post-registered-at" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                    등록일
                  </label>
                  <input
                    id="free-post-registered-at"
                    aria-label="등록일"
                    type="datetime-local"
                    value={writeRegisteredAt}
                    onChange={(event) => setWriteRegisteredAt(event.target.value)}
                    className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  게시글 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="의견을 명확하게 요약한 제목을 입력해 주십시오."
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="free-post-attachment" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  첨부파일
                </label>
                <input
                  id="free-post-attachment"
                  aria-label="첨부파일"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.hwpx,.zip"
                  onChange={handleAttachmentChange}
                  disabled={isUploadingAttachment}
                  className="block w-full rounded-xl border border-dashed border-stone-surface bg-white px-4 py-2.5 text-xs text-graphite file:mr-3 file:rounded-full file:border-0 file:bg-midnight file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-white disabled:opacity-60"
                />
                {writeAttachmentName ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-surface bg-white px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-extrabold text-charcoal-primary">
                        {writeAttachmentName}
                      </p>
                      {writeAttachmentSize ? (
                        <p className="mt-0.5 text-[10px] font-bold text-ash font-mono">
                          {formatAttachmentSize(writeAttachmentSize)}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setWriteAttachmentPath(null);
                        setWriteAttachmentName(null);
                        setWriteAttachmentSize(null);
                      }}
                      className="shrink-0 rounded-full border border-coral-red/20 bg-coral-red/10 px-2.5 py-1 text-[10px] font-bold text-coral-red hover:bg-coral-red/15"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] font-medium text-ash">
                    PDF, 한글, 오피스 문서, ZIP 파일을 20MB 이하로 첨부할 수 있습니다.
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="space-y-2 rounded-2xl border border-stone-surface bg-white px-3 py-3">
                  <div className="flex items-center gap-2.5 select-none">
                    <input
                      type="checkbox"
                      id="write-star-checkbox"
                      checked={writeIsStarred}
                      onChange={(e) => setWriteIsStarred(e.target.checked)}
                      className="size-4.5 border border-stone-surface rounded focus:ring-sky-blue/30 text-midnight cursor-pointer bg-white"
                    />
                    <label htmlFor="write-star-checkbox" className="text-[11.5px] font-extrabold text-graphite/95 cursor-pointer font-mono">
                      중요 게시글로 상단 고정 표시 (★)
                    </label>
                  </div>
                  <div className="flex items-start gap-2.5 select-none">
                    <input
                      type="checkbox"
                      id="write-public-share-checkbox"
                      checked={writeIsPublicShareEnabled}
                      onChange={(e) => setWriteIsPublicShareEnabled(e.target.checked)}
                      className="mt-0.5 size-4.5 border border-stone-surface rounded focus:ring-sky-blue/30 text-midnight cursor-pointer bg-white"
                    />
                    <label htmlFor="write-public-share-checkbox" className="cursor-pointer">
                      <span className="block text-[11.5px] font-extrabold text-graphite/95 font-mono">
                        카톡 공유 허용
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium leading-relaxed text-ash">
                        체크하면 로그인하지 않아도 이 게시글 본문을 읽을 수 있습니다.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  게시글 본문 내용 *
                </label>
                <NoticeRichEditor
                  value={writeContent}
                  onChange={setWriteContent}
                  onUploadImage={(file) => uploadPublicFile(file, "image")}
                  ariaLabel="자유게시판 본문 편집창"
                  placeholder="조합원님들과 공유하고 싶은 소통과 상생 의견을 자유롭게 기록해 주십시오."
                />
                <p className="text-[10px] font-medium text-ash">
                  이미지 버튼 또는 Ctrl+V로 본문에 이미지를 바로 넣고, 선택한 이미지는 크기를 조절할 수 있습니다.
                </p>
              </div>

              <div className="pt-5 border-t border-stone-surface flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-10 cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95"
                >
                  {isSubmitting ? "작성 중…" : editingPost ? "수정 완료" : "게시글 작성 완료"}
                </Button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
