"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { readOpenChatAnnouncementResponse } from "@/lib/openchat-announcement-response";
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
import { getUserDisplayName } from "@/lib/user-display-name";
import { NoticeRichContent, NoticeRichEditor, getPlainNoticeText } from "./notice-rich-editor";

type FreeBoardProps = {
  session: any;
  posts: any[];
  onRefresh: () => Promise<void>;
};

type FreeBoardCommentView = {
  id: string;
  content: string;
  createdAt: string;
  author: any;
  parentId: string | null;
  replies: FreeBoardCommentView[];
  isReal: boolean;
};

function formatFreeBoardDate(value: string) {
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

function buildCommentTree(comments: any[]): FreeBoardCommentView[] {
  const commentViews = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: formatFreeBoardDate(comment.createdAt),
    author: { ...comment.author, displayAuthorName: comment.displayAuthorName },
    parentId: comment.parentId || null,
    replies: [] as FreeBoardCommentView[],
    isReal: comment.isReal ?? true,
  }));
  const byId = new Map(commentViews.map((comment) => [comment.id, comment]));
  const topLevelComments: FreeBoardCommentView[] = [];

  for (const comment of commentViews) {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)?.replies.push(comment);
    } else {
      topLevelComments.push(comment);
    }
  }

  return topLevelComments;
}

function FreeBoardPostRows({
  post,
  index,
  authorLabel,
  showDeletePost,
  showOpenChatCopy,
  openChatCopyStatus,
  onOpen,
  onDelete,
  onOpenChatCopy,
}: {
  post: any;
  index: number;
  authorLabel: string;
  showDeletePost: boolean;
  showOpenChatCopy: boolean;
  openChatCopyStatus?: "copying" | "copied" | "error";
  onOpen: () => void;
  onDelete: (params: { postId?: string; commentId?: string }) => void;
  onOpenChatCopy: (post: any) => void;
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
        {post.createdAt}
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
        {(showOpenChatCopy || showDeletePost) && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
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
}: FreeBoardProps) {
  const currentUserId = session?.id;
  const isAdmin = session?.role === "ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FreePostType | "ALL">("ALL");
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
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [writeIsStarred, setWriteIsStarred] = useState(false);
  const [writePostType, setWritePostType] = useState<FreePostType>("FREE");
  const [writeDisplayAuthorName, setWriteDisplayAuthorName] = useState<NewsDisplayAuthorName>("운영자");

  const handleCloseWriteModal = () => {
    setShowWriteModal(false);
    setEditingPost(null);
    setWriteTitle("");
    setWriteContent("");
    setWriteIsStarred(false);
    setWritePostType("FREE");
    setWriteDisplayAuthorName("운영자");
  };


  // New Comment Form State (Mapped by Post ID)
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [commentDisplayAuthorName, setCommentDisplayAuthorName] = useState<NewsDisplayAuthorName>("운영자");

  const uploadPublicFile = async (file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", "image");
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error || "이미지 업로드에 실패했습니다.");
    }
    return uploadData as { url: string; name: string; size: number };
  };

  // Anonymize/Mask user details for privacy protection
  const getMaskedAuthorName = (author: {
    signupName?: string | null;
    name?: string | null;
    loginId: string | null;
    role: string;
    id?: string;
    displayAuthorName?: string | null;
  }) => {
    const displayName = author.role === "ADMIN"
      ? author.displayAuthorName || "사무국"
      : getUserDisplayName(author);
    if (author.id === currentUserId) {
      return `${displayName} (나)`;
    }
    if (author.role === "ADMIN") {
      return displayName;
    }
    const cleanName = displayName;
    const maskedId = author.loginId 
      ? `${author.loginId.slice(0, 2)}***`
      : "social";
    return `${cleanName.slice(0, 1)}*조합원 (${maskedId})`;
  };

  // Show only database-backed free-board posts. Demo copy must not appear in operations.
  const combinedPosts = useMemo(() => {
    const realPosts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      postType: normalizeFreePostType(p.postType, true),
      isStarred: p.isStarred,
      createdAt: formatFreeBoardDate(p.createdAt),
      author: { ...p.author, displayAuthorName: p.displayAuthorName },
      comments: buildCommentTree(p.comments || []),
      commentCount: (p.comments || []).length,
      isReal: true,
    }));

    let filteredPosts = realPosts;

    if (typeFilter !== "ALL") {
      filteredPosts = filteredPosts.filter((p) => p.postType === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredPosts = filteredPosts.filter((p) => p.title.toLowerCase().includes(q) || getPlainNoticeText(p.content).toLowerCase().includes(q));
    }

    return filteredPosts;
  }, [posts, searchQuery, typeFilter]);

  const focusedPost = useMemo(
    () => combinedPosts.find((post) => post.id === focusedPostId) || null,
    [combinedPosts, focusedPostId],
  );
  const focusedPostTypeMeta = focusedPost ? getFreePostTypeMeta(focusedPost.postType) : null;

  const updateFocusedPostUrl = (postId: string | null) => {
    if (typeof window === "undefined") return;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("tab", "free");
    if (postId) {
      nextUrl.searchParams.set("post", postId);
    } else {
      nextUrl.searchParams.delete("post");
    }
    window.history.pushState({}, "", `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`);
  };

  const openFocusedPost = (postId: string) => {
    setFocusedPostId(postId);
    updateFocusedPostUrl(postId);
  };

  const closeFocusedPost = () => {
    setFocusedPostId(null);
    updateFocusedPostUrl(null);
  };

  useEffect(() => {
    const syncFocusedPostFromUrl = () => {
      const postId = new URLSearchParams(window.location.search).get("post");
      setFocusedPostId(postId && combinedPosts.some((post) => post.id === postId) ? postId : null);
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
          body: JSON.stringify({
            postId: editingPost.id,
            title: writeTitle,
            content: writeContent,
            postType: writePostType,
            isStarred: writeIsStarred,
            ...(isAdmin ? { displayAuthorName: writeDisplayAuthorName } : {}),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "게시글 수정 과정에서 문제가 발생했습니다.");
          return;
        }

        setEditingPost(null);
        setWriteTitle("");
        setWriteContent("");
        setWriteIsStarred(false);
        setWritePostType("FREE");
        setWriteDisplayAuthorName("운영자");
        setShowWriteModal(false);
        await onRefresh();
      } else {
        const res = await fetch("/api/news/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: writeTitle,
            content: writeContent,
            postType: writePostType,
            isStarred: writeIsStarred,
            ...(isAdmin ? { displayAuthorName: writeDisplayAuthorName } : {}),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "게시글 게시 과정에서 문제가 발생했습니다.");
          return;
        }

        setWriteTitle("");
        setWriteContent("");
        setWritePostType("FREE");
        setWriteDisplayAuthorName("운영자");
        setShowWriteModal(false);
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
        body: JSON.stringify({
          postId,
          content: text,
          ...(parentCommentId ? { parentCommentId } : {}),
          ...(isAdmin ? { displayAuthorName: commentDisplayAuthorName } : {}),
        }),
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

  const openReplyInput = (topLevelComment: FreeBoardCommentView, targetAuthor?: any) => {
    setReplyingCommentId(topLevelComment.id);
    setExpandedReplies((prev) => ({ ...prev, [topLevelComment.id]: true }));
    if (targetAuthor) {
      const authorName = getMaskedAuthorName(targetAuthor).split(" ")[0];
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
      let url = "/api/news/free";
      if (params.postId) url += `?postId=${params.postId}`;
      else if (params.commentId) url += `?commentId=${params.commentId}`;

      const res = await fetch(url, { method: "DELETE" });
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

  const handleOpenChatCopy = async (post: any) => {
    if (!post.isReal) return;

    setOpenChatCopyStatus((prev) => ({ ...prev, [post.id]: "copying" }));
    try {
      const res = await fetch(`/api/openchat/announcements?freePostId=${encodeURIComponent(post.id)}`);
      const data = await readOpenChatAnnouncementResponse(res);

      await copyTextToClipboard(data.announcement.message);
      await fetch("/api/openchat/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: data.announcement.id }),
      });

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
              조합원 인증 완료 🔓
            </span>
          </div>
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
              onChange={(event) => setTypeFilter(event.target.value as FreePostType | "ALL")}
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
                setEditingPost(null);
                setWriteTitle("");
                setWriteContent("");
                setWritePostType("FREE");
                setWriteIsStarred(false);
                setWriteDisplayAuthorName("운영자");
                setShowWriteModal(true);
              }}
              className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              ✍️ 새 게시글 작성
            </Button>
          </div>
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
                <th className="px-5 py-3.5 w-32 text-center">작성일</th>
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
                  const authorLabel = getMaskedAuthorName(post.author);
                  const showDeletePost = post.isReal && (post.author.id === currentUserId || isAdmin);
                  const showOpenChatCopy = post.isReal && isAdmin;

                  return (
                    <FreeBoardPostRows
                      key={post.id}
                      post={post}
                      index={index}
                      authorLabel={authorLabel}
                      showDeletePost={showDeletePost}
                      showOpenChatCopy={showOpenChatCopy}
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
                  {focusedPost.isReal && (focusedPost.author.id === currentUserId || isAdmin) && (
                    <button
                      type="button"
                      aria-label="게시글 수정"
                      onClick={() => {
                        setEditingPost(focusedPost);
                        setWriteTitle(focusedPost.title);
                        setWriteContent(focusedPost.content);
                        setWritePostType(normalizeFreePostType(focusedPost.postType, isAdmin));
                        setWriteIsStarred(!!focusedPost.isStarred);
                        setWriteDisplayAuthorName(
                          NEWS_DISPLAY_AUTHOR_NAMES.includes(focusedPost.author.displayAuthorName as NewsDisplayAuthorName)
                            ? focusedPost.author.displayAuthorName
                            : "운영자",
                        );
                        setShowWriteModal(true);
                      }}
                      className="shrink-0 rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                    >
                      수정
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 border-y border-stone-surface/65 py-2.5 text-[11px] font-bold text-ash font-mono">
                  {focusedPostTypeMeta && (
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-extrabold", focusedPostTypeMeta.badgeClassName)}>
                      {focusedPostTypeMeta.label}
                    </span>
                  )}
                  <span>작성자: {getMaskedAuthorName(focusedPost.author)}</span>
                  <span>•</span>
                  <span>{focusedPost.createdAt}</span>
                  <span>•</span>
                  <span>댓글 {focusedPost.commentCount}개</span>
                </div>
              </div>

              <div className="pt-2">
                <NoticeRichContent content={focusedPost.content} />
              </div>

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
                      const commAuthor = getMaskedAuthorName(comm.author);
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
                                const replyAuthor = getMaskedAuthorName(reply.author);
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

              {isAdmin && (
                <div className="flex items-center gap-2.5 py-1 select-none">
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
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  게시글 본문 내용 *
                </label>
                <NoticeRichEditor
                  value={writeContent}
                  onChange={setWriteContent}
                  onUploadImage={uploadPublicFile}
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
