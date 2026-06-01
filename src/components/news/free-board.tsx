"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NoticeRichContent, NoticeRichEditor, getPlainNoticeText } from "./notice-rich-editor";

type FreeBoardProps = {
  session: any;
  posts: any[];
  onRefresh: () => Promise<void>;
};

const MOCK_POSTS = [
  {
    id: "mock-post-1",
    title: "최근 임시총회 의결서 공증 완료본 확인했습니다.",
    content: "공개자료실 문서함에서 총회의사록 신속하게 공증 완료된 버전 확인했습니다. 사무국에서 발빠르게 등재해주시니 기밀성 유지되면서도 투명함이 느껴져 든든하네요. 모두 고생 많으셨습니다. 앞으로도 화이팅입니다!",
    isStarred: false,
    createdAt: "2026.05.28",
    author: { name: "이조합", loginId: "member2", role: "MEMBER" },
    comments: [
      {
        id: "mock-comm-1",
        content: "동감합니다. 매 분기 예산 집행 세부 내역도 자금 입출금이랑 대조되어서 올라오니까 믿음직스럽네요.",
        createdAt: "2026.05.28 14:22",
        author: { name: "정조합", loginId: "member3", role: "MEMBER" },
      },
    ],
  },
  {
    id: "mock-post-2",
    title: "신규로 등재된 주간 실무 보고서 유익하네요.",
    content: "시공사 설계팀과의 도면 협의 및 주차 대수 추가 최적화 도면 수정 보고서가 신속하게 올라와서 좋네요. 다가오는 건축심의 본신청에서도 시정 지적 없이 깔끔하게 조치 결과 보고 수령하길 조합원 가족 모두 기원합니다.",
    isStarred: false,
    createdAt: "2026.05.27",
    author: { name: "박조합", loginId: "member4", role: "MEMBER" },
    comments: [],
  },
] as const;

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
  return value.includes("T") ? value.slice(0, 16).replace("T", " ") : value;
}

function buildCommentTree(comments: any[]): FreeBoardCommentView[] {
  const commentViews = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: formatFreeBoardDate(comment.createdAt),
    author: comment.author,
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
  onOpen,
  onDelete,
}: {
  post: any;
  index: number;
  authorLabel: string;
  showDeletePost: boolean;
  onOpen: () => void;
  onDelete: (params: { postId?: string; commentId?: string }) => void;
}) {
  return (
    <tr
      onClick={onOpen}
      className={cn(
        "cursor-pointer transition-all duration-150 hover:bg-sky-blue/[0.03]",
        index % 2 === 1 ? "bg-[#fdfcfa]" : "bg-white",
        !post.isReal && "border-dashed text-graphite/90",
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
            <span className="rounded bg-stone-surface px-1.5 py-0.5 text-[9px] font-extrabold text-charcoal-primary">
              {post.isReal ? "정식 토론" : "데모 피드"}
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
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const handleCloseWriteModal = () => {
    setShowWriteModal(false);
    setEditingPost(null);
    setWriteTitle("");
    setWriteContent("");
    setWriteIsStarred(false);
  };


  // New Comment Form State (Mapped by Post ID)
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

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
  const getMaskedAuthorName = (author: { name: string; loginId: string | null; role: string; id?: string }) => {
    if (author.id === currentUserId) {
      return `${author.name || "조합원"} (나)`;
    }
    if (author.role === "ADMIN") {
      return "사무국";
    }
    const cleanName = author.name || "조합원";
    const maskedId = author.loginId 
      ? `${author.loginId.slice(0, 2)}***`
      : "social";
    return `${cleanName.slice(0, 1)}*조합원 (${maskedId})`;
  };

  // Combine real database posts with simulated demonstration mocks
  const combinedPosts = useMemo(() => {
    const realPosts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      isStarred: p.isStarred,
      createdAt: formatFreeBoardDate(p.createdAt),
      author: p.author,
      comments: buildCommentTree(p.comments || []),
      commentCount: (p.comments || []).length,
      isReal: true,
    }));

    let filteredReal = realPosts;
    let filteredMock = MOCK_POSTS.map((p) => ({
      ...p,
      isReal: false,
      comments: buildCommentTree(p.comments.map((c) => ({
        ...c,
        isReal: false,
      }))),
      commentCount: p.comments.length,
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredReal = filteredReal.filter((p) => p.title.toLowerCase().includes(q) || getPlainNoticeText(p.content).toLowerCase().includes(q));
      filteredMock = filteredMock.filter((p) => p.title.toLowerCase().includes(q) || getPlainNoticeText(p.content).toLowerCase().includes(q));
    }

    return [...filteredReal, ...filteredMock];
  }, [posts, searchQuery]);

  const focusedPost = useMemo(
    () => combinedPosts.find((post) => post.id === focusedPostId) || null,
    [combinedPosts, focusedPostId],
  );

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
            isStarred: writeIsStarred,
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
        setShowWriteModal(false);
        await onRefresh();
      } else {
        const res = await fetch("/api/news/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: writeTitle,
            content: writeContent,
            isStarred: writeIsStarred,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "게시글 게시 과정에서 문제가 발생했습니다.");
          return;
        }

        setWriteTitle("");
        setWriteContent("");
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

  return (
    <div className="space-y-6">
      {/* 자유게시판 미니 대시보드 */}
      <div className="stone-card bg-[#fbfaf9] border border-stone-surface p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-300">
        <div>
          <span className="inline-flex rounded-full bg-meadow-green/10 px-2 py-0.5 text-[9px] font-bold text-meadow-green uppercase tracking-wider select-none mb-1">
            💬 토론 공간 현황
          </span>
          <h4 className="text-[13.5px] font-extrabold text-charcoal-primary leading-snug">
            조합원 전용 소통 게시판
          </h4>
          <p className="text-[11px] text-graphite/95 font-normal mt-1 leading-relaxed">
            자산 가치를 수호하고 투명한 정보를 나누기 위해 마련된 양방향 토론 구역입니다.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
          <div className="text-center bg-white px-4 py-2 border border-stone-surface rounded-xl shadow-2xs">
            <span className="text-ash block text-[9px] font-bold uppercase mb-0.5">실시간 소통 온도</span>
            <span className="text-meadow-green text-[13px] font-extrabold">36.5 °C</span>
          </div>
          <div className="text-center bg-white px-4 py-2 border border-stone-surface rounded-xl shadow-2xs">
            <span className="text-ash block text-[9px] font-bold uppercase mb-0.5">이달의 소통글</span>
            <span className="text-sky-blue text-[13px] font-extrabold">+{combinedPosts.length}건</span>
          </div>
        </div>
      </div>

      {/* 검색 바 & 새 글 작성 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
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

        <Button
          onClick={() => {
            setEditingPost(null);
            setWriteTitle("");
            setWriteContent("");
            setShowWriteModal(true);
          }}
          className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          ✍️ 새 토론 게시글 작성
        </Button>

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
                <th className="px-5 py-3.5 w-20 text-center">관리</th>
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

                  return (
                    <FreeBoardPostRows
                      key={post.id}
                      post={post}
                      index={index}
                      authorLabel={authorLabel}
                      showDeletePost={showDeletePost}
                      onOpen={() => openFocusedPost(post.id)}
                      onDelete={handleDeletePostOrComment}
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
            className="fixed inset-y-0 left-0 z-[130] flex w-full max-w-3xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 shadow-2xl animate-in slide-in-from-left duration-300 ease-out sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-surface pb-3">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={closeFocusedPost}
                  className="inline-flex items-center rounded-full border border-stone-surface bg-[#f8f7f4] px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                >
                  목록으로
                </button>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-ash font-mono">
                  <span className="rounded bg-stone-surface px-1.5 py-0.5 text-[9px] font-extrabold text-charcoal-primary">
                    {focusedPost.isReal ? "정식 토론" : "데모 피드"}
                  </span>
                  <span>작성자: {getMaskedAuthorName(focusedPost.author)}</span>
                  <span>•</span>
                  <span>{focusedPost.createdAt}</span>
                  <span>•</span>
                  <span>댓글 {focusedPost.commentCount}개</span>
                </div>
                <h3 className="text-xl font-extrabold text-charcoal-primary leading-snug">
                  {focusedPost.isStarred && (
                    <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-extrabold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                      ★ 중요
                    </span>
                  )}
                  {focusedPost.title}
                </h3>
              </div>
              {focusedPost.isReal && (focusedPost.author.id === currentUserId || isAdmin) && (
                <button
                  type="button"
                  aria-label="게시글 수정"
                  onClick={() => {
                    setEditingPost(focusedPost);
                    setWriteTitle(focusedPost.title);
                    setWriteContent(focusedPost.content);
                    setWriteIsStarred(!!focusedPost.isStarred);
                    setShowWriteModal(true);
                  }}
                  className="shrink-0 rounded-full border border-sky-blue/20 bg-sky-blue/10 px-3 py-1.5 text-[11px] font-bold text-sky-blue hover:bg-sky-blue/15"
                >
                  수정
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2.5 pt-1.5 pb-3">
              <article className="rounded-2xl border border-stone-surface bg-white px-5 pt-4 pb-2.5">
                <NoticeRichContent
                  content={focusedPost.content}
                  className="text-sm text-graphite/95 leading-8 [&_p]:mb-1.5 [&_p:last-child]:mb-0"
                />
              </article>

              <section className="rounded-2xl border border-stone-surface bg-[#f8f7f4] p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black text-charcoal-primary">
                    댓글 {focusedPost.commentCount}개
                  </h4>
                  <span className="text-[10px] font-bold text-ash">토론 의견</span>
                </div>

                {focusedPost.comments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-stone-surface bg-white px-4 py-6 text-center text-[11px] font-medium text-graphite/60">
                    첫 번째 의견 댓글을 남겨보세요.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {focusedPost.comments.map((comm: FreeBoardCommentView) => {
                      const commAuthor = getMaskedAuthorName(comm.author);
                      const showDeleteComm = comm.isReal && (comm.author.id === currentUserId || isAdmin);
                      const repliesExpanded = expandedReplies[comm.id] || false;
                      return (
                        <div key={comm.id} className="rounded-xl border border-stone-surface bg-white px-4 py-3">
                          <div>
                            <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-bold text-ash font-mono">
                              <span>작성자: {commAuthor}</span>
                              <div className="flex items-center gap-2">
                                <span>{comm.createdAt}</span>
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
                            <p className="text-[12px] text-graphite/90 font-normal leading-relaxed">
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
                            <div className="mt-3 flex gap-2 border-l-2 border-sky-blue/30 pl-3">
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="sticky bottom-0 flex gap-2 border-t border-stone-surface/50 bg-[#f8f7f4] pt-4">
                  <input
                    type="text"
                    placeholder={focusedPost.isReal ? "안전하고 고운 의견 댓글을 작성해 주세요…" : "가상 데모 보존 게시글에는 댓글을 추가하실 수 없습니다."}
                    value={commentContents[focusedPost.id] || ""}
                    disabled={!focusedPost.isReal}
                    onChange={(event) => setCommentContents((prev) => ({ ...prev, [focusedPost.id]: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && focusedPost.isReal) {
                        handleCreateComment(focusedPost.id);
                      }
                    }}
                    className="flex-1 rounded-xl border border-stone-surface bg-white px-3.5 py-2 text-[12px] text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!focusedPost.isReal) {
                        alert("시연용 아카이브 포스트에는 댓글 전송이 차단되어 있습니다.\n실제 토론 게시판 연동을 확인하시려면, 새 토론 게시글을 직접 작성한 후 댓글을 작성하십시오!");
                        return;
                      }
                      handleCreateComment(focusedPost.id);
                    }}
                    disabled={commentSubmitting[focusedPost.id] || !focusedPost.isReal}
                    className="rounded-xl bg-midnight px-4 text-[11px] font-bold text-white disabled:opacity-50"
                  >
                    의견 등록
                  </Button>
                </div>
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
            aria-label={editingPost ? "토론글 수정 드로어" : "새 토론글 게시 드로어"}
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface mb-6">
              <h3 className="text-base font-black text-charcoal-primary flex items-center gap-1.5">
                <span>✍️</span> {editingPost ? "토론 게시글 수정" : "새 토론 게시물 등록"}
              </h3>
              <button
                onClick={handleCloseWriteModal}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5 flex-1">
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
                    중요 토론글로 상단 고정 표시 (★)
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
