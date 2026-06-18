"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { readOpenChatAnnouncementResponse } from "@/lib/openchat-announcement-response";
import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
  getNewsDisplayAuthorName,
} from "@/lib/news-display-author";
import { cn } from "@/lib/utils";
import { NoticeRichContent, NoticeRichEditor, getPlainNoticeText } from "./notice-rich-editor";

type NoticeBoardProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  newsList: any[];
  onViewNotice?: (notice: any) => void;
  onRefresh: () => Promise<void>;
};

function getNoticeComments(notice: any) {
  return Array.isArray(notice?.comments) ? notice.comments : [];
}

function getNoticeCommentAuthorName(comment: any) {
  if (comment.author?.role === "ADMIN") {
    return comment.displayAuthorName || "운영자";
  }
  return comment.author?.name || "조합원";
}

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

export function NoticeBoard({
  isLoggedIn,
  isAdmin,
  newsList = [],
  onViewNotice,
  onRefresh,
}: NoticeBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeViewNotice, setActiveViewNotice] = useState<any | null>(null);
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
  const [uploadIsStarred, setUploadIsStarred] = useState(false);
  const [uploadDisplayAuthorName, setUploadDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show only database-backed notices. Demo copy must not appear in operations.
  const combinedData = useMemo(() => {
    const realNotices = newsList.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      viewCount: item.viewCount,
      isStarred: item.isStarred,
      author: {
        ...item.author,
        name: getNewsDisplayAuthorName(item),
      },
      displayAuthorName: item.displayAuthorName,
      createdAt: item.createdAt.slice(0, 10).replace(/-/g, "."),
      imagePath: item.imagePath,
      attachmentPath: item.attachmentPath,
      attachmentName: item.attachmentName,
      attachmentSize: item.attachmentSize,
      comments: getNoticeComments(item),
      isReal: true,
    }));

    let filteredNotices = realNotices;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredNotices = filteredNotices.filter((n) => n.title.toLowerCase().includes(q));
    }

    // Starred notices go on top
    return filteredNotices.sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [newsList, searchQuery]);

  const uploadPublicFile = async (file: File, kind: "image" | "attachment") => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error || "파일 업로드에 실패했습니다.");
    }
    return uploadData as { url: string; name: string; size: number };
  };

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

  const handleDeleteNotice = async (notice: any) => {
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

  const handleOpenChatCopy = async (notice: any) => {
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
          <table className="w-full text-left text-sm border-collapse" aria-label="공지사항 목록">
            <thead className="bg-[#f7f6f3] border-b border-stone-surface text-xs font-bold text-ash">
              <tr>
                <th className="px-5 py-3.5 w-14 text-center">No.</th>
                <th className="px-5 py-3.5">제목</th>
                <th className="px-5 py-3.5 w-24 text-center">등록자</th>
                <th className="px-5 py-3.5 w-28 text-center">작성일</th>
                <th className="px-5 py-3.5 w-28 text-center">댓글</th>
                {isAdmin && <th className="px-5 py-3.5 w-36 text-center">관리</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-surface/50 text-graphite font-medium">
              {combinedData.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-5 py-16 text-center text-xs text-graphite/70 font-normal">
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
                    <td className="px-5 py-4 text-center text-xs text-ash font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] leading-snug flex items-center gap-1.5 flex-wrap">
                        {notice.isStarred && (
                          <span className="inline-flex items-center gap-1.5 rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                            <ImportantNoticeStar />
                            <span>중요</span>
                          </span>
                        )}
                        <span className={cn(notice.isStarred ? "font-bold text-charcoal-primary" : "text-charcoal-primary/90")}>
                          {notice.title}
                        </span>
                        {notice.isReal && (
                          <span className="bg-sky-blue/10 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1 shrink-0 select-none">실제자료</span>
                        )}
                        {notice.attachmentPath && (
                          <span className="bg-stone-surface text-graphite text-[8px] font-black scale-90 rounded px-1 shrink-0 select-none">첨부</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-xs text-graphite/80 font-normal">
                      {notice.author.name}
                    </td>
                    <td className="px-5 py-4 text-center text-xs text-ash font-mono">
                      {notice.createdAt}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (onViewNotice) {
                            onViewNotice(notice);
                          } else {
                            setActiveViewNotice(notice);
                          }
                        }}
                        className="rounded-full bg-sky-blue/10 px-3 py-1.5 text-[10.5px] font-extrabold text-sky-blue hover:bg-sky-blue/15"
                      >
                        댓글 {getNoticeComments(notice).length}개 보기
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-center">
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
          <div className="relative w-full max-w-xl rounded-3xl bg-warm-canvas border border-stone-surface shadow-2xl p-6.5 text-left animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
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

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <h3 className="text-base font-extrabold text-charcoal-primary leading-snug">
                {activeViewNotice.isStarred && (
                  <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
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

              <div className="text-xs sm:text-[13px] text-graphite/90 leading-7 font-normal pt-2">
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
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-charcoal-primary">
                    댓글 {getNoticeComments(activeViewNotice).length}개
                  </h4>
                  {!isLoggedIn && (
                    <span className="text-[10px] font-bold text-ash">
                      로그인 후 작성 가능
                    </span>
                  )}
                </div>
                {getNoticeComments(activeViewNotice).length === 0 ? (
                  <p className="rounded-2xl border border-stone-surface bg-white px-4 py-4 text-[11px] text-ash font-medium">
                    아직 등록된 댓글이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {getNoticeComments(activeViewNotice).map((comment: any) => (
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
                  <button
                    type="button"
                    aria-label="공지 삭제"
                    onClick={() => void handleDeleteNotice(activeViewNotice)}
                    className="rounded-full border border-coral-red/20 bg-coral-red/10 px-3 py-1.5 text-[11px] font-bold text-coral-red hover:bg-coral-red/15"
                  >
                    공지 삭제
                  </button>
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
            className="fixed inset-y-0 right-0 z-[130] w-full max-w-lg bg-warm-canvas border-l border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 ease-out"
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

            <form onSubmit={handleUploadSubmit} className="space-y-5 flex-1">
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
