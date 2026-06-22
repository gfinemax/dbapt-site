"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
} from "@/lib/news-display-author";
import { buildShallowCommentTree } from "@/lib/news/comment-tree";
import {
  DEVELOPMENT_LOG_CATEGORIES,
  buildDevelopmentLogList,
  getDevelopmentLogStatus,
} from "@/lib/news/development-log";
import {
  buildNoticeCommentCreatePayload,
  buildNoticeCommentUpdatePayload,
} from "@/lib/news/notice-comment-payload";
import { buildNoticeCommentEditDraft } from "@/lib/news/notice-access";
import { getNoticeCommentAuthorName } from "@/lib/news/comment-author";
import type { CoopNewsView, NewsCommentView, NewsSessionView } from "@/lib/news/types";
import { cn } from "@/lib/utils";

type DevelopmentLogProps = {
  isAdmin: boolean;
  session?: NewsSessionView | null;
  logs: CoopNewsView[];
  onRefresh: () => Promise<void> | void;
};

const statusStyles = {
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-meadow-green/20 bg-meadow-green/10 text-meadow-green",
  hidden: "border-stone-surface bg-stone-surface/70 text-ash",
  request: "border-sky-blue/20 bg-sky-blue/10 text-sky-blue",
} as const;

type ComposeMode = "log" | "request";

export function DevelopmentLog({ isAdmin, session, logs, onRefresh }: DevelopmentLogProps) {
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode | null>(null);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentDisplayAuthorName, setCommentDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentDisplayAuthorName, setEditCommentDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const visibleLogs = useMemo(
    () => buildDevelopmentLogList(logs, { includeAdminOnly: isAdmin }),
    [isAdmin, logs],
  );

  const isLoggedIn = !!session;

  const resetCompose = () => {
    setComposeMode(null);
    setComposeTitle("");
    setComposeContent("");
  };

  const refresh = async () => {
    await onRefresh();
  };

  const createDraft = async () => {
    setIsCreatingDraft(true);
    try {
      const res = await fetch("/api/news/development-log/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "개발일지 초안 생성에 실패했습니다.");
        return;
      }
      await refresh();
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const submitPost = async (event: FormEvent) => {
    event.preventDefault();
    const title = composeTitle.trim();
    const content = composeContent.trim();
    if (!composeMode || !title || !content) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSubmittingPost(true);
    try {
      const category =
        composeMode === "request"
          ? DEVELOPMENT_LOG_CATEGORIES.request
          : DEVELOPMENT_LOG_CATEGORIES.draft;
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          isStarred: false,
          ...(isAdmin ? { displayAuthorName: "운영자" } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "게시글 등록에 실패했습니다.");
        return;
      }
      resetCompose();
      await refresh();
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const updateLogCategory = async (log: CoopNewsView, category: string) => {
    setMutatingId(log.id);
    try {
      const res = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: log.id,
          title: log.title,
          content: log.content,
          category,
          imagePath: log.imagePath || null,
          isStarred: !!log.isStarred,
          attachmentPath: log.attachmentPath || null,
          attachmentName: log.attachmentName || null,
          attachmentSize: log.attachmentSize || null,
          displayAuthorName: log.displayAuthorName || "운영자",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "개발일지 상태 변경에 실패했습니다.");
        return;
      }
      await refresh();
    } finally {
      setMutatingId(null);
    }
  };

  const deleteLog = async (log: CoopNewsView) => {
    if (!confirm("이 글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) return;

    setMutatingId(log.id);
    try {
      const res = await fetch(`/api/news?id=${encodeURIComponent(log.id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "글 삭제에 실패했습니다.");
        return;
      }
      await refresh();
    } finally {
      setMutatingId(null);
    }
  };

  const submitComment = async (logId: string, parentCommentId?: string) => {
    const key = parentCommentId || logId;
    const content = (parentCommentId ? replyContents[parentCommentId] : commentContents[logId] || "").trim();
    if (!content) {
      alert(parentCommentId ? "답글 내용을 입력해 주세요." : "댓글 내용을 입력해 주세요.");
      return;
    }

    setMutatingId(key);
    try {
      const res = await fetch("/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNoticeCommentCreatePayload({
          newsId: logId,
          content,
          parentCommentId,
          isAdmin,
          displayAuthorName: commentDisplayAuthorName,
        })),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "댓글 등록에 실패했습니다.");
        return;
      }
      if (parentCommentId) {
        setReplyContents((prev) => ({ ...prev, [parentCommentId]: "" }));
        setReplyingCommentId(null);
        setExpandedReplies((prev) => ({ ...prev, [parentCommentId]: true }));
      } else {
        setCommentContents((prev) => ({ ...prev, [logId]: "" }));
      }
      await refresh();
    } finally {
      setMutatingId(null);
    }
  };

  const beginCommentEdit = (comment: NewsCommentView) => {
    const draft = buildNoticeCommentEditDraft(comment);
    setEditingCommentId(draft.id);
    setEditCommentContent(draft.content);
    setEditCommentDisplayAuthorName(draft.displayAuthorName);
  };

  const saveCommentEdit = async (comment: NewsCommentView) => {
    const content = editCommentContent.trim();
    if (!content) {
      alert("댓글 내용을 입력해 주세요.");
      return;
    }

    setMutatingId(comment.id);
    try {
      const res = await fetch("/api/news/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNoticeCommentUpdatePayload({
          commentId: comment.id,
          content,
          isAdmin,
          displayAuthorName: editCommentDisplayAuthorName,
        })),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "댓글 수정에 실패했습니다.");
        return;
      }
      setEditingCommentId(null);
      setEditCommentContent("");
      await refresh();
    } finally {
      setMutatingId(null);
    }
  };

  const deleteComment = async (comment: NewsCommentView) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    setMutatingId(comment.id);
    try {
      const res = await fetch(`/api/news/comments?commentId=${encodeURIComponent(comment.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "댓글 삭제에 실패했습니다.");
        return;
      }
      await refresh();
    } finally {
      setMutatingId(null);
    }
  };

  const canMutateComment = (comment: NewsCommentView) => {
    return isAdmin || comment.author?.id === session?.id;
  };

  const canDeleteLog = (log: CoopNewsView) => {
    return isAdmin || (
      log.category === DEVELOPMENT_LOG_CATEGORIES.request &&
      log.author?.id === session?.id
    );
  };

  const composeLabel = composeMode === "log" ? "개발일지" : "요구사항";
  const selectedLog = visibleLogs.find((log) => log.id === selectedLogId) || null;
  const closeSelectedLog = () => setSelectedLogId(null);
  const canUseDocument = typeof document !== "undefined";

  return (
    <>
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-[#f2f0ed] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-black text-charcoal-primary">
            <span>개발일지</span>
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-ash font-mono">
            Development Log & Request History
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-sky-blue/20 bg-sky-blue/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-blue select-none">
            전체 공개
          </span>
          {isLoggedIn && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setComposeMode("request")}
              className="h-8 rounded-full border-stone-surface px-4 text-[11px] font-bold text-graphite hover:bg-stone-surface/40"
            >
              요구사항 작성
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setComposeMode("log")}
                className="h-8 rounded-full border-stone-surface px-4 text-[11px] font-bold text-graphite hover:bg-stone-surface/40"
              >
                새 개발일지 작성
              </Button>
              <Button
                type="button"
                onClick={createDraft}
                disabled={isCreatingDraft}
                className="h-8 rounded-full bg-midnight px-4 text-[11px] font-bold text-white hover:bg-black"
              >
                {isCreatingDraft ? "생성 중" : "자동 초안 생성"}
              </Button>
            </>
          )}
        </div>
      </div>

      {composeMode && (
        <form onSubmit={submitPost} className="stone-card space-y-3 rounded-2xl border border-stone-surface bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-black text-charcoal-primary">
              {composeLabel} 작성
            </h4>
            <button
              type="button"
              onClick={resetCompose}
              className="rounded-full border border-stone-surface bg-[#f8f7f4] px-3 py-1 text-[11px] font-bold text-graphite hover:bg-stone-surface"
            >
              취소
            </button>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="development-compose-title" className="text-[11px] font-bold text-charcoal-primary">
              {composeLabel} 제목
            </label>
            <input
              id="development-compose-title"
              aria-label={`${composeLabel} 제목`}
              value={composeTitle}
              onChange={(event) => setComposeTitle(event.target.value)}
              className="w-full rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
              placeholder={composeMode === "log" ? "개발일지 제목을 입력해 주세요." : "요구사항을 짧게 요약해 주세요."}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="development-compose-content" className="text-[11px] font-bold text-charcoal-primary">
              {composeLabel} 내용
            </label>
            <textarea
              id="development-compose-content"
              aria-label={`${composeLabel} 내용`}
              value={composeContent}
              onChange={(event) => setComposeContent(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-xs leading-relaxed text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
              placeholder={composeMode === "log" ? "반영 내용과 이용자 변경점을 적어 주세요." : "필요한 기능이나 수정 요청을 구체적으로 적어 주세요."}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmittingPost}
              className="h-9 rounded-full bg-midnight px-5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
            >
              {isSubmittingPost ? "등록 중" : `${composeLabel} 등록`}
            </Button>
          </div>
        </form>
      )}

      {visibleLogs.length === 0 ? (
        <div className="stone-card rounded-2xl border border-stone-surface bg-white p-8 text-center">
          <p className="text-sm font-bold text-charcoal-primary">아직 공개된 개발일지가 없습니다.</p>
          <p className="mt-2 text-xs text-graphite">
            주요 기능 반영이나 오류 수정이 정리되면 이곳에 게시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="stone-card overflow-hidden rounded-2xl border border-stone-surface bg-white">
            <div className="overflow-x-auto">
              <table aria-label="개발일지 목록" className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-[#f8f7f4] text-[10px] font-black text-ash">
                  <tr>
                    <th scope="col" className="px-4 py-3">상태</th>
                    <th scope="col" className="px-4 py-3">제목</th>
                    <th scope="col" className="px-4 py-3">등록일</th>
                    <th scope="col" className="px-4 py-3 text-center">댓글</th>
                    <th scope="col" className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-surface">
                  {visibleLogs.map((log) => {
                    const status = getDevelopmentLogStatus(log.category);
                    const version = extractVersion(log.content);
                    const isDraft = log.category === DEVELOPMENT_LOG_CATEGORIES.draft;
                    const isHidden = log.category === DEVELOPMENT_LOG_CATEGORIES.hidden;
                    const isPublished = log.category === DEVELOPMENT_LOG_CATEGORIES.published;
                    const isRequest = log.category === DEVELOPMENT_LOG_CATEGORIES.request;
                    const isSelected = selectedLog?.id === log.id;

                    return (
                      <tr key={log.id} className={cn(isSelected ? "bg-sky-blue/[0.04]" : "bg-white hover:bg-[#fbfaf9]")}>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {version && !isRequest && (
                              <span className="rounded-full border border-stone-surface bg-[#fbfaf9] px-2 py-0.5 text-[9px] font-extrabold text-charcoal-primary font-mono">
                                {version}
                              </span>
                            )}
                            <span className={cn(
                              "rounded-full border px-2 py-0.5 text-[9px] font-bold",
                              statusStyles[status.tone],
                            )}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <button
                            type="button"
                            onClick={() => setSelectedLogId(log.id)}
                            className="line-clamp-1 text-left text-[13px] font-black text-charcoal-primary hover:text-sky-blue"
                          >
                            {log.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 align-middle text-[11px] font-medium text-ash">
                          {String(log.createdAt).slice(0, 10).replace(/-/g, ".")}
                        </td>
                        <td className="px-4 py-3 text-center align-middle text-[11px] font-bold text-graphite">
                          {log.comments?.length || 0}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {isAdmin && !isRequest && (
                              <>
                                {(isDraft || isHidden) && (
                                  <Button
                                    type="button"
                                    onClick={() => updateLogCategory(log, DEVELOPMENT_LOG_CATEGORIES.published)}
                                    disabled={mutatingId === log.id}
                                    className="h-7 rounded-full bg-midnight px-3 text-[10px] font-bold text-white hover:bg-black"
                                  >
                                    게시
                                  </Button>
                                )}
                                {isPublished && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => updateLogCategory(log, DEVELOPMENT_LOG_CATEGORIES.hidden)}
                                    disabled={mutatingId === log.id}
                                    className="h-7 rounded-full border-stone-surface px-3 text-[10px] font-bold text-graphite hover:bg-stone-surface/40"
                                  >
                                    숨김
                                  </Button>
                                )}
                              </>
                            )}
                            {canDeleteLog(log) && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => deleteLog(log)}
                                disabled={mutatingId === log.id}
                                className="h-7 rounded-full border-coral-red/20 bg-coral-red/10 px-3 text-[10px] font-bold text-coral-red hover:bg-coral-red/15"
                              >
                                삭제
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {canUseDocument && selectedLog && createPortal((() => {
            const comments = buildShallowCommentTree(selectedLog.comments || []);

            return (
              <>
                <div
                  onClick={closeSelectedLog}
                  className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in motion-reduce:animate-none motion-reduce:transition-none"
                />
                <aside
                  aria-label="개발일지 상세 패널"
                  className="fixed inset-y-0 left-0 z-[130] flex w-full max-w-2xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 shadow-2xl animate-in slide-in-from-left duration-300 ease-out motion-reduce:animate-none sm:p-8"
                >
                <div className="flex items-center justify-between gap-4 border-b border-stone-surface pb-6">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                      D
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-charcoal-primary">
                        개발일지 열람
                      </h2>
                      <p className="mt-0.5 text-[11px] font-medium text-ash">
                        Development Log & Request History
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeSelectedLog}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] px-3 py-1.5 text-xs font-medium text-graphite transition duration-200 hover:bg-stone-surface focus:outline-none focus:ring-2 focus:ring-sky-blue/30 active:bg-[#e8e6e1]"
                  >
                    <svg className="size-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    목록으로
                  </button>
                </div>
                <div className="mt-6 flex-1 space-y-4">
                  <section aria-label="개발일지 상세" className="space-y-3">
                    <div className="flex flex-col gap-1 border-b border-stone-surface pb-3">
                      <h4 id={`development-detail-title-${selectedLog.id}`} className="text-[15px] font-black leading-snug text-charcoal-primary">
                        {selectedLog.title}
                      </h4>
                      <p className="text-[10px] font-medium text-ash">
                        등록일 {String(selectedLog.createdAt).slice(0, 10).replace(/-/g, ".")}
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap rounded-xl bg-[#fbfaf9] p-4 text-[12px] leading-7 text-graphite">
                      {selectedLog.content}
                    </div>
                  </section>

                  <section className="space-y-3 border-t border-stone-surface pt-4" aria-label={`${selectedLog.title} 댓글`}>
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-black text-charcoal-primary">댓글 {selectedLog.comments?.length || 0}개</h5>
                      {!isLoggedIn && (
                        <span className="text-[10px] font-medium text-ash">댓글 작성은 로그인 후 가능합니다.</span>
                      )}
                    </div>

                    {comments.length > 0 && (
                      <div className="space-y-2">
                        {comments.map((comment) => {
                          const repliesExpanded = expandedReplies[comment.id] ?? false;
                          return (
                            <div key={comment.id} className="rounded-xl border border-stone-surface bg-[#fbfaf9] p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-black text-charcoal-primary">
                                  {getNoticeCommentAuthorName(comment)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono font-bold text-ash">
                                    {String(comment.createdAt).slice(0, 10).replace(/-/g, ".")}
                                  </span>
                                  {canMutateComment(comment) && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => beginCommentEdit(comment)}
                                        className="rounded-full border border-stone-surface bg-white px-2 py-0.5 text-[9px] font-bold text-graphite hover:bg-stone-surface"
                                      >
                                        수정
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteComment(comment)}
                                        className="rounded-full bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red hover:bg-coral-red/15"
                                      >
                                        삭제
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              {editingCommentId === comment.id ? (
                                <div className="mt-2 space-y-2">
                                  {isAdmin && (
                                    <select
                                      aria-label="댓글 수정 작성자"
                                      value={editCommentDisplayAuthorName}
                                      onChange={(event) => setEditCommentDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                                      className="h-8 rounded-xl border border-stone-surface bg-white px-3 text-[11px] font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                                    >
                                      {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                                        <option key={name} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <textarea
                                    aria-label="댓글 수정 내용"
                                    value={editCommentContent}
                                    onChange={(event) => setEditCommentContent(event.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingCommentId(null)}
                                      className="rounded-full border border-stone-surface bg-white px-3 py-1 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                                    >
                                      취소
                                    </button>
                                    <Button
                                      type="button"
                                      onClick={() => saveCommentEdit(comment)}
                                      className="h-8 rounded-full bg-midnight px-4 text-xs font-bold text-white hover:bg-black"
                                    >
                                      수정 완료
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-graphite">
                                  {comment.content}
                                </p>
                              )}

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {isLoggedIn && (
                                  <button
                                    type="button"
                                    aria-label="답글 작성"
                                    onClick={() => setReplyingCommentId((prev) => prev === comment.id ? null : comment.id)}
                                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-graphite hover:bg-stone-surface"
                                  >
                                    답글
                                  </button>
                                )}
                                {comment.replies.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment.id]: !repliesExpanded }))}
                                    className="rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-extrabold text-sky-blue hover:bg-sky-blue/15"
                                  >
                                    답글 {comment.replies.length}개 {repliesExpanded ? "숨기기" : "보기"}
                                  </button>
                                )}
                              </div>

                              {repliesExpanded && comment.replies.length > 0 && (
                                <div className="mt-3 space-y-2 border-l-2 border-stone-surface pl-3">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="rounded-xl bg-white px-3 py-2.5">
                                      <div className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-bold text-ash font-mono">
                                        <span>작성자: {getNoticeCommentAuthorName(reply)}</span>
                                        <div className="flex items-center gap-2">
                                          <span>{String(reply.createdAt).slice(0, 10).replace(/-/g, ".")}</span>
                                          {canMutateComment(reply) && (
                                            <button
                                              type="button"
                                              onClick={() => deleteComment(reply)}
                                              className="rounded-full bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red"
                                            >
                                              삭제
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-graphite/90">
                                        {reply.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {replyingCommentId === comment.id && isLoggedIn && (
                                <div className="mt-3 space-y-2 border-l-2 border-sky-blue/30 pl-3">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="댓글에 답글을 작성해 주세요..."
                                      value={replyContents[comment.id] || ""}
                                      onChange={(event) => setReplyContents((prev) => ({ ...prev, [comment.id]: event.target.value }))}
                                      className="flex-1 rounded-xl border border-stone-surface bg-white px-3 py-2 text-[12px] text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue"
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => submitComment(selectedLog.id, comment.id)}
                                      disabled={mutatingId === comment.id}
                                      className="rounded-xl bg-midnight px-3 text-[11px] font-bold text-white disabled:opacity-50"
                                    >
                                      답글 등록
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {isLoggedIn && (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submitComment(selectedLog.id);
                        }}
                        className="space-y-2 rounded-2xl border border-stone-surface bg-white p-3"
                      >
                        {isAdmin && (
                          <select
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
                        )}
                        <textarea
                          aria-label="개발일지 댓글 작성"
                          value={commentContents[selectedLog.id] || ""}
                          onChange={(event) => setCommentContents((prev) => ({ ...prev, [selectedLog.id]: event.target.value }))}
                          placeholder="개발일지나 요구사항에 댓글을 남겨 주세요..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-xs text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={mutatingId === selectedLog.id}
                            className="h-9 rounded-full bg-midnight px-5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
                          >
                            댓글 등록
                          </Button>
                        </div>
                      </form>
                    )}
                  </section>
                </div>
                </aside>
              </>
            );
          })(), document.body)}
        </div>
      )}
    </div>
    </>
  );
}

function extractVersion(content: string) {
  return content.match(/v\d{4}\.\d{2}\.\d+(?:-hotfix\.\d+)?/)?.[0] ?? null;
}
