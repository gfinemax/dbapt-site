"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { readOpenChatAnnouncementResponse } from "@/lib/openchat-announcement-response";
import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
} from "@/lib/news-display-author";
import { getNoticeCommentAuthorName } from "@/lib/news/comment-author";
import {
  NEWS_ARTICLE_CONTENT_MAX_WIDTH_CLASS,
  NEWS_ARTICLE_CONTENT_MAX_WIDTH_STYLE,
  NEWS_ARTICLE_SHELL_MAX_WIDTH_CLASS,
  NEWS_ARTICLE_SHELL_MAX_WIDTH_STYLE,
} from "@/lib/news/content-layout";
import { buildNoticeBoardList, type NoticeBoardListItem } from "@/lib/news/notice-board-list";
import { uploadPublicFile } from "@/lib/news/public-upload";
import { getNewsComments, type CoopNewsView, type NewsCommentView } from "@/lib/news/types";
import { cn } from "@/lib/utils";
import { NoticeRichContent, NoticeRichEditor, getPlainNoticeText } from "./notice-rich-editor";
import { PersonalBookmarkButton } from "./personal-bookmark-button";

type NoticeBoardProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  newsList: CoopNewsView[];
  onViewNotice?: (notice: NoticeBoardListItem) => void;
  onRefresh: () => Promise<void>;
};

function ImportantNoticeStar() {
  return (
    <span
      data-testid="notice-important-star"
      className="inline-block text-ember-orange animate-ping motion-reduce:animate-none"
    >
      ★
    </span>
  );
}

function toDateInputValue(value: Date | string = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

export function NoticeBoard({
  isLoggedIn,
  isAdmin,
  newsList = [],
  onViewNotice,
  onRefresh,
}: NoticeBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeViewNotice, setActiveViewNotice] = useState<NoticeBoardListItem | null>(null);
  const [openChatCopyStatus, setOpenChatCopyStatus] = useState<Record<string, "copying" | "copied" | "error">>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showUploadModal || activeViewNotice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showUploadModal, activeViewNotice]);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadAttachmentFile, setUploadAttachmentFile] = useState<File | null>(null);
  const [uploadRegisteredAt, setUploadRegisteredAt] = useState(() => toDateInputValue());
  const [uploadIsStarred, setUploadIsStarred] = useState(false);
  const [uploadDisplayAuthorName, setUploadDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const combinedData = useMemo(
    () => buildNoticeBoardList(newsList, searchQuery),
    [newsList, searchQuery],
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !getPlainNoticeText(uploadContent).trim()) {
      alert("공지 제목과 본문 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentPath: string | null = null;
      let attachmentName: string | null = null;
      let attachmentSize: number | null = null;

      if (uploadAttachmentFile) {
        const uploadData = await uploadPublicFile(uploadAttachmentFile, "attachment");
        attachmentPath = uploadData.url;
        attachmentName = uploadData.name;
        attachmentSize = uploadData.size;
      }

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          content: uploadContent,
          category: "NOTICE",
          registeredAt: uploadRegisteredAt,
          attachmentPath,
          attachmentName,
          attachmentSize,
          isStarred: uploadIsStarred,
          displayAuthorName: uploadDisplayAuthorName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "공지사항 등록에 실패했습니다.");
        return;
      }

      setUploadTitle("");
      setUploadContent("");
      setUploadAttachmentFile(null);
      setUploadRegisteredAt(toDateInputValue());
      setUploadIsStarred(false);
      setUploadDisplayAuthorName("운영자");
      setShowUploadModal(false);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "공지사항 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (notice: NoticeBoardListItem) => {
    if (!notice.isReal) return;
    if (!confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/news?id=${encodeURIComponent(notice.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "공지사항 삭제에 실패했습니다.");
        return;
      }

      if (activeViewNotice?.id === notice.id) {
        setActiveViewNotice(null);
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCopyNoticeToFreeBoard = async (notice: NoticeBoardListItem) => {
    if (!notice.isReal) return;
    if (!confirm(`"${notice.title}" 공지사항을 자유게시판으로 복사하시겠습니까?\n\n원본 공지와 댓글은 그대로 유지됩니다.`)) {
      return;
    }

    try {
      const res = await fetch("/api/news/board-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: "COOP_NEWS", sourceId: notice.id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "자유게시판 복사에 실패했습니다.");
        return;
      }

      await onRefresh();
      alert("자유게시판으로 복사했습니다.");
    } catch (err) {
      console.error(err);
      alert("자유게시판 복사 중 오류가 발생했습니다.");
    }
  };

  const handleOpenChatCopy = async (notice: NoticeBoardListItem) => {
    if (!notice.isReal) return;

    setOpenChatCopyStatus((prev) => ({ ...prev, [notice.id]: "copying" }));
    try {
      const res = await fetch(`/api/openchat/announcements?newsId=${encodeURIComponent(notice.id)}`);
      const data = await readOpenChatAnnouncementResponse(res);

      await copyTextToClipboard(data.announcement.message);
      await fetch("/api/openchat/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: data.announcement.id }),
      });

      setOpenChatCopyStatus((prev) => ({ ...prev, [notice.id]: "copied" }));
    } catch (e) {
      console.error(e);
      setOpenChatCopyStatus((prev) => ({ ...prev, [notice.id]: "error" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#f2f0ed] pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                <span>📢</span> 공지사항
              </h3>
              <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                Official Announcements & Updates
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-bold text-sky-blue bg-sky-blue/10 border border-sky-blue/20 rounded-full px-2.5 py-0.5 select-none lg:hidden">
              전체 공개 🔓
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <span className="hidden shrink-0 text-[10px] font-bold text-sky-blue bg-sky-blue/10 border border-sky-blue/20 rounded-full px-2.5 py-0.5 select-none lg:inline-flex">
              전체 공개 🔓
            </span>
            <div className="relative w-full sm:w-80">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="공지사항 제목 검색…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
              />
            </div>
            {isLoggedIn && isAdmin && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                + 신규 공지사항 등록
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 공지사항 목록 테이블 */}
      <div className="bg-white rounded-2xl border border-stone-surface overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table
            className="w-full table-fixed text-left text-sm border-collapse"
            style={{ minWidth: isAdmin ? "820px" : "760px" }}
            aria-label="공지사항 목록"
          >
            <thead className="bg-[#f7f6f3] border-b border-stone-surface text-[11px] font-bold text-ash">
              <tr>
                <th className="w-10 px-3 py-3 text-center">No.</th>
                <th className="px-3 py-3">제목</th>
                <th className="w-20 px-3 py-3 text-center whitespace-nowrap">등록자</th>
                <th className="w-24 px-3 py-3 text-center whitespace-nowrap">등록일</th>
                <th className="w-20 px-3 py-3 text-center whitespace-nowrap">댓글</th>
                <th className="w-20 px-3 py-3 text-center whitespace-nowrap">보관</th>
                {isAdmin && <th className="w-28 px-3 py-3 text-center">관리</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-surface/50 text-graphite font-medium">
              {combinedData.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-16 text-center text-xs text-graphite/70 font-normal">
                    검색 조건에 맞는 공지사항이 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                combinedData.map((notice, idx) => (
                  <tr
                    key={notice.id}
                    onClick={() => {
                      if (onViewNotice) {
                        onViewNotice(notice);
                      } else {
                        setActiveViewNotice(notice);
                      }
                    }}
                    className={cn(
                      "cursor-pointer transition-all duration-150 hover:bg-sky-blue/[0.03]",
                      idx % 2 === 1 ? "bg-[#fdfcfa]" : "bg-white"
                    )}
                  >
                    <td className="px-3 py-3.5 text-center text-xs text-ash/75 font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex min-w-0 items-center gap-2">
                          {notice.isStarred && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 select-none">
                              <ImportantNoticeStar />
                              <span>중요</span>
                            </span>
                          )}
                          <span className={cn("min-w-0 text-[13.5px] leading-snug", notice.isStarred ? "font-bold text-charcoal-primary" : "font-semibold text-charcoal-primary/90")}>
                            {notice.title}
                          </span>
                        </div>
                        {(notice.isReal || notice.attachmentPath) && (
                          <div data-notice-title-meta="true" className="flex min-w-0 flex-wrap items-center gap-1.5">
                            {notice.isReal && (
                              <span className="rounded border border-sky-blue/15 bg-sky-blue/10 px-1.5 py-0.5 text-[9px] font-black text-sky-blue select-none">실제자료</span>
                            )}
                            {notice.attachmentPath && (
                              <span className="rounded bg-stone-surface/80 px-1.5 py-0.5 text-[9px] font-black text-graphite select-none">첨부</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center text-xs text-graphite/75 font-normal whitespace-nowrap">
                      {notice.author.name}
                    </td>
                    <td className="px-3 py-3.5 text-center text-xs text-ash font-mono whitespace-nowrap">
                      {notice.createdAt}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        aria-label={`댓글 ${getNewsComments(notice).length}개 보기`}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (onViewNotice) {
                            onViewNotice(notice);
                          } else {
                            setActiveViewNotice(notice);
                          }
                        }}
                        className="inline-flex min-w-16 items-center justify-center whitespace-nowrap rounded-full border border-sky-blue/15 bg-white px-2.5 py-1 text-[11px] font-bold text-sky-blue hover:bg-sky-blue/10"
                      >
                        댓글 {getNewsComments(notice).length}
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {isLoggedIn && notice.isReal ? (
                        <PersonalBookmarkButton
                          title={notice.title}
                          targetType="COOP_NEWS"
                          targetId={notice.id}
                          initialBookmarked={notice.isBookmarkedByCurrentUser}
                          className="h-6 px-2 py-0 text-[10px]"
                        />
                      ) : (
                        <span className="text-[10px] text-ash/50">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3.5 text-center">
                        {notice.isReal && (
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                              type="button"
                              aria-label={`${notice.title} 오픈채팅 공지문 복사`}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleOpenChatCopy(notice);
                              }}
                              disabled={openChatCopyStatus[notice.id] === "copying"}
                              className="rounded-full border border-meadow-green/25 bg-meadow-green/10 px-2.5 py-1 text-[10px] font-bold text-meadow-green hover:bg-meadow-green/15 disabled:opacity-60"
                            >
                              {openChatCopyStatus[notice.id] === "copying" ? "복사 중" : "공지문 복사"}
                            </button>
                            {openChatCopyStatus[notice.id] === "copied" && (
                              <span className="text-[9px] font-bold text-meadow-green">
                                복사됨
                              </span>
                            )}
                            {openChatCopyStatus[notice.id] === "error" && (
                              <span className="text-[9px] font-bold text-ember-orange">
                                실패
                              </span>
                            )}
                            <button
                              type="button"
                              aria-label={`${notice.title} 자유게시판으로 복사`}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleCopyNoticeToFreeBoard(notice);
                              }}
                              className="rounded-full border border-sky-blue/20 bg-sky-blue/10 px-2.5 py-1 text-[10px] font-bold text-sky-blue hover:bg-sky-blue/15"
                            >
                              자유게시판 복사
                            </button>
                            <button
                              type="button"
                              aria-label="공지 삭제"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteNotice(notice);
                              }}
                              className="rounded-full border border-coral-red/20 bg-coral-red/10 px-2.5 py-1 text-[10px] font-bold text-coral-red hover:bg-coral-red/15"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. 공지사항 상세 열람 모달 */}
      {activeViewNotice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setActiveViewNotice(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="공지사항 상세 열람"
            className={cn(
              "relative w-full rounded-3xl bg-warm-canvas border border-stone-surface shadow-2xl p-6.5 text-left animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]",
              NEWS_ARTICLE_SHELL_MAX_WIDTH_CLASS,
            )}
            style={{ maxWidth: NEWS_ARTICLE_SHELL_MAX_WIDTH_STYLE }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-surface mb-4">
              <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[9px] font-bold text-sky-blue uppercase tracking-wider">
                Official Notice
              </span>
              <button
                onClick={() => setActiveViewNotice(null)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <div
              data-news-article-content="notice-board-read"
              className={cn("mx-auto w-full flex-1 overflow-y-auto space-y-0 pr-1", NEWS_ARTICLE_CONTENT_MAX_WIDTH_CLASS)}
              style={{ maxWidth: NEWS_ARTICLE_CONTENT_MAX_WIDTH_STYLE }}
            >
              <h3 className="text-base font-extrabold text-charcoal-primary leading-snug">
                {activeViewNotice.isStarred && (
                  <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 mr-1.5 align-middle">
                    ★ 중요
                  </span>
                )}
                {activeViewNotice.title}
              </h3>
              
              <div className="flex items-center gap-3 text-[10.5px] font-bold text-ash font-mono border-y border-stone-surface/60 py-2">
                <span>📂 분류: 조합 공지사항</span>
                <span>•</span>
                <span>작성자: {activeViewNotice.author.name}</span>
                <span>•</span>
                <span>등록일: {activeViewNotice.createdAt}</span>
              </div>

              <div>
                {activeViewNotice.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeViewNotice.imagePath}
                    alt=""
                    className="mb-4 max-h-72 w-full rounded-2xl object-cover border border-stone-surface"
                  />
                )}
                <NoticeRichContent content={activeViewNotice.content} />
              </div>
              {activeViewNotice.attachmentPath && (
                <a
                  href={activeViewNotice.attachmentPath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-stone-surface bg-white px-4 py-3 text-xs font-bold text-charcoal-primary hover:border-sky-blue"
                >
                  <span>첨부파일: {activeViewNotice.attachmentName || "다운로드"}</span>
                  <span className="text-[10px] text-sky-blue">열기</span>
                </a>
              )}
              <div className="border-t border-stone-surface pt-4 space-y-3">
                {isLoggedIn && activeViewNotice.isReal && (
                  <PersonalBookmarkButton
                    title={activeViewNotice.title}
                    targetType="COOP_NEWS"
                    targetId={activeViewNotice.id}
                    initialBookmarked={activeViewNotice.isBookmarkedByCurrentUser}
                  />
                )}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-charcoal-primary">
                    댓글 {getNewsComments(activeViewNotice).length}개
                  </h4>
                  {!isLoggedIn && (
                    <span className="text-[10px] font-bold text-ash">
                      로그인 후 작성 가능
                    </span>
                  )}
                </div>
                {getNewsComments(activeViewNotice).length === 0 ? (
                  <p className="rounded-2xl border border-stone-surface bg-white px-4 py-4 text-[11px] text-ash font-medium">
                    아직 등록된 댓글이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {getNewsComments(activeViewNotice).map((comment: NewsCommentView) => (
                      <div key={comment.id} className="rounded-2xl border border-stone-surface bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black text-charcoal-primary">
                            {getNoticeCommentAuthorName(comment)}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-ash">
                            {String(comment.createdAt).slice(0, 10).replace(/-/g, ".")}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-graphite font-normal whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isAdmin && activeViewNotice.isReal && (
                <div className="pt-4 border-t border-stone-surface">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-label={`${activeViewNotice.title} 자유게시판으로 복사`}
                      onClick={() => void handleCopyNoticeToFreeBoard(activeViewNotice)}
                      className="rounded-full border border-sky-blue/20 bg-sky-blue/10 px-3 py-1.5 text-[11px] font-bold text-sky-blue hover:bg-sky-blue/15"
                    >
                      자유게시판으로 복사
                    </button>
                    <button
                      type="button"
                      aria-label="공지 삭제"
                      onClick={() => void handleDeleteNotice(activeViewNotice)}
                      className="rounded-full border border-coral-red/20 bg-coral-red/10 px-3 py-1.5 text-[11px] font-bold text-coral-red hover:bg-coral-red/15"
                    >
                      공지 삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 신규 공지사항 등록 드로어 (관리자용) */}
      {mounted && showUploadModal && createPortal(
        <>
          <div
            onClick={() => setShowUploadModal(false)}
            className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />
          <div
            className={cn(
              "fixed inset-y-0 right-0 z-[130] w-full bg-warm-canvas border-l border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 ease-out",
              NEWS_ARTICLE_SHELL_MAX_WIDTH_CLASS,
            )}
            style={{ maxWidth: NEWS_ARTICLE_SHELL_MAX_WIDTH_STYLE }}
            aria-label="신규 공지 작성 드로어"
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface mb-6">
              <h3 className="text-base font-black text-charcoal-primary flex items-center gap-1.5">
                <span>📢</span> 신규 공지사항 작성
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form
              data-news-article-content="notice-write"
              onSubmit={handleUploadSubmit}
              className={cn("mx-auto w-full space-y-5 flex-1", NEWS_ARTICLE_CONTENT_MAX_WIDTH_CLASS)}
              style={{ maxWidth: NEWS_ARTICLE_CONTENT_MAX_WIDTH_STYLE }}
            >
              <div className="space-y-1.5">
                <label htmlFor="notice-display-author" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  공지 작성자
                </label>
                <select
                  id="notice-display-author"
                  value={uploadDisplayAuthorName}
                  onChange={(e) => setUploadDisplayAuthorName(e.target.value as NewsDisplayAuthorName)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                >
                  {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  공지 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="공지사항의 제목을 입력하십시오."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  공지 내용 *
                </label>
                <NoticeRichEditor
                  value={uploadContent}
                  onChange={setUploadContent}
                  onUploadImage={(file) => uploadPublicFile(file, "image")}
                  ariaLabel="공지 내용 편집창"
                  placeholder="공지사항 세부 내용을 상세히 기술해 주십시오."
                />
                <p className="text-[10px] font-medium text-ash">
                  이미지 버튼 또는 Ctrl+V로 본문에 이미지를 넣고, 이미지를 선택하면 크기를 조절할 수 있습니다.
                </p>
              </div>

              <div className="flex items-center gap-2.5 py-1 select-none">
                <input
                  type="checkbox"
                  id="star-checkbox"
                  checked={uploadIsStarred}
                  onChange={(e) => setUploadIsStarred(e.target.checked)}
                  className="size-4.5 border border-stone-surface rounded focus:ring-sky-blue/30 text-midnight cursor-pointer bg-white"
                />
                <label htmlFor="star-checkbox" className="text-[11.5px] font-extrabold text-graphite/95 cursor-pointer font-mono">
                  중요 공지사항으로 상단 고정 표시 (★)
                </label>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notice-registered-at" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  등록일
                </label>
                <input
                  id="notice-registered-at"
                  aria-label="등록일"
                  type="datetime-local"
                  value={uploadRegisteredAt}
                  onChange={(e) => setUploadRegisteredAt(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notice-attachment-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  첨부파일 (선택)
                </label>
                <input
                  id="notice-attachment-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.hwpx,.zip"
                  onChange={(e) => setUploadAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                />
                {uploadAttachmentFile && (
                  <p className="text-[10px] font-bold text-sky-blue">
                    선택된 첨부파일: {uploadAttachmentFile.name}
                  </p>
                )}
              </div>

              <div className="pt-5 border-t border-stone-surface flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-10 cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95"
                >
                  {isSubmitting ? "등록 중…" : "공지사항 즉시 등록"}
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
