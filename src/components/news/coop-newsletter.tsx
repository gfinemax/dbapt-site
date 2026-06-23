"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { readOpenChatAnnouncementResponse } from "@/lib/openchat-announcement-response";
import { buildNewsletterList, type NewsletterListItem } from "@/lib/news/newsletter-list";
import { uploadPublicFile } from "@/lib/news/public-upload";
import type { CoopNewsView } from "@/lib/news/types";
import { cn } from "@/lib/utils";

type CoopNewsletterProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  newsList: CoopNewsView[];
  initialOpenNewsId?: string | null;
  onRefresh: () => Promise<void>;
};

// Dynamic harmony premium HSL gradients for cards if thumbnail image is empty
const PREMIUM_GRADIENTS = [
  "from-sky-blue/30 via-violet-500/10 to-stone-surface/30",
  "from-violet-500/20 via-sky-blue/10 to-stone-surface/30",
  "from-emerald-500/20 via-meadow-green/10 to-stone-surface/30",
  "from-amber-500/20 via-sunburst-yellow/10 to-stone-surface/30",
];

function toDateInputValue(value: Date | string = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

export function CoopNewsletter({
  isLoggedIn,
  isAdmin,
  newsList = [],
  initialOpenNewsId = null,
  onRefresh,
}: CoopNewsletterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeViewNewsId, setActiveViewNewsId] = useState<string | null>(null);
  const [dismissedOpenNewsId, setDismissedOpenNewsId] = useState<string | null>(null);
  const [openChatCopyStatus, setOpenChatCopyStatus] = useState<Record<string, "copying" | "copied" | "error">>({});

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
  const [uploadAttachmentFile, setUploadAttachmentFile] = useState<File | null>(null);
  const [uploadRegisteredAt, setUploadRegisteredAt] = useState(() => toDateInputValue());
  const [uploadIsStarred, setUploadIsStarred] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImagePath, setEditImagePath] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editAttachmentPath, setEditAttachmentPath] = useState<string | null>(null);
  const [editAttachmentName, setEditAttachmentName] = useState<string | null>(null);
  const [editAttachmentSize, setEditAttachmentSize] = useState<number | null>(null);
  const [editAttachmentFile, setEditAttachmentFile] = useState<File | null>(null);
  const [editRegisteredAt, setEditRegisteredAt] = useState("");
  const [editIsStarred, setEditIsStarred] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Combine real database data with the single upcoming issue preview.
  const combinedData = useMemo(() => buildNewsletterList(newsList, searchQuery), [newsList, searchQuery]);

  const selectedViewNews = activeViewNewsId
    ? combinedData.find((news) => news.id === activeViewNewsId) || null
    : null;
  const deepLinkedViewNews = initialOpenNewsId && dismissedOpenNewsId !== initialOpenNewsId
    ? combinedData.find((news) => news.id === initialOpenNewsId && news.isReal) || null
    : null;
  const activeViewNews = selectedViewNews ?? deepLinkedViewNews;
  const portalRoot = typeof document === "undefined" ? null : document.body;

  const scrollViewportToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const openNewsletterDetail = (news: NewsletterListItem) => {
    scrollViewportToTop();
    setActiveViewNewsId(news.id);
    setDismissedOpenNewsId(null);
  };

  const openNewsletterCreate = () => {
    scrollViewportToTop();
    setShowUploadModal(true);
  };

  const closeNewsletterDetail = () => {
    if (activeViewNews?.id === initialOpenNewsId) {
      setDismissedOpenNewsId(initialOpenNewsId);
    }
    cancelNewsEdit();
    setActiveViewNewsId(null);
  };

  const handlePasteImage = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFile = Array.from(e.clipboardData.files).find((file) => file.type.startsWith("image/"));
    if (!imageFile) return;

    e.preventDefault();
    setUploadImageFile(imageFile);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      alert("조합뉴스 제목과 본문 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imagePath: string | null = null;
      let attachmentPath: string | null = null;
      let attachmentName: string | null = null;
      let attachmentSize: number | null = null;

      if (uploadImageFile) {
        const uploadData = await uploadPublicFile(uploadImageFile, "image");
        imagePath = uploadData.url;
      }
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
          category: "WEEKLY_MONTHLY",
          registeredAt: uploadRegisteredAt,
          imagePath,
          attachmentPath,
          attachmentName,
          attachmentSize,
          isStarred: uploadIsStarred,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "조합뉴스 등록에 실패했습니다.");
        return;
      }

      setUploadTitle("");
      setUploadContent("");
      setUploadImageFile(null);
      setUploadAttachmentFile(null);
      setUploadRegisteredAt(toDateInputValue());
      setUploadIsStarred(false);
      setShowUploadModal(false);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "조합뉴스 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (news: NewsletterListItem) => {
    if (!news.isReal) return;
    if (!confirm(`"${news.title}" 조합뉴스를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/news?id=${encodeURIComponent(news.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "조합뉴스 삭제에 실패했습니다.");
        return;
      }

      if (activeViewNews?.id === news.id) {
        closeNewsletterDetail();
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("조합뉴스 삭제 중 오류가 발생했습니다.");
    }
  };

  const beginNewsEdit = (news: NewsletterListItem) => {
    setEditingNewsId(news.id);
    setEditTitle(news.title);
    setEditContent(news.content);
    setEditImagePath(news.imagePath || null);
    setEditImageFile(null);
    setEditAttachmentPath(news.attachmentPath || null);
    setEditAttachmentName(news.attachmentName || null);
    setEditAttachmentSize(news.attachmentSize || null);
    setEditAttachmentFile(null);
    setEditRegisteredAt(toDateInputValue(news.registeredAt ?? news.createdAtRaw ?? new Date()));
    setEditIsStarred(!!news.isStarred);
  };

  const cancelNewsEdit = () => {
    setEditingNewsId(null);
    setEditTitle("");
    setEditContent("");
    setEditImagePath(null);
    setEditImageFile(null);
    setEditAttachmentPath(null);
    setEditAttachmentName(null);
    setEditAttachmentSize(null);
    setEditAttachmentFile(null);
    setEditRegisteredAt("");
    setEditIsStarred(false);
  };

  const handleEditSubmit = async (e: React.FormEvent, news: NewsletterListItem) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      alert("조합뉴스 제목과 본문 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSavingEdit(true);
    try {
      let imagePath = editImagePath;
      let attachmentPath = editAttachmentPath;
      let attachmentName = editAttachmentName;
      let attachmentSize = editAttachmentSize;

      if (editImageFile) {
        const uploadData = await uploadPublicFile(editImageFile, "image");
        imagePath = uploadData.url;
      }
      if (editAttachmentFile) {
        const uploadData = await uploadPublicFile(editAttachmentFile, "attachment");
        attachmentPath = uploadData.url;
        attachmentName = uploadData.name;
        attachmentSize = uploadData.size;
      }

      const res = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: news.id,
          title: editTitle,
          content: editContent,
          category: "WEEKLY_MONTHLY",
          registeredAt: editRegisteredAt,
          imagePath,
          attachmentPath,
          attachmentName,
          attachmentSize,
          isStarred: editIsStarred,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "조합뉴스 수정에 실패했습니다.");
        return;
      }
      cancelNewsEdit();
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "조합뉴스 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenChatCopy = async (news: NewsletterListItem) => {
    if (!news.isReal) return;

    setOpenChatCopyStatus((prev) => ({ ...prev, [news.id]: "copying" }));
    try {
      const res = await fetch(`/api/openchat/announcements?newsId=${encodeURIComponent(news.id)}`);
      const data = await readOpenChatAnnouncementResponse(res);

      await copyTextToClipboard(data.announcement.message);
      await fetch("/api/openchat/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: data.announcement.id }),
      });

      setOpenChatCopyStatus((prev) => ({ ...prev, [news.id]: "copied" }));
    } catch (e) {
      console.error(e);
      setOpenChatCopyStatus((prev) => ({ ...prev, [news.id]: "error" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 바 및 등록 버튼 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="주/월간 소식 제목 검색…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
          />
        </div>

        {isLoggedIn && isAdmin && (
          <Button
            onClick={openNewsletterCreate}
            className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            + 신규 주/월간소식 등록
          </Button>
        )}
      </div>

      {/* 카드 그리드 내역 */}
      {combinedData.length === 0 ? (
        <div className="stone-card bg-white border border-stone-surface rounded-2xl px-6 py-12 text-center text-xs text-graphite/70 font-normal">
          조건에 일치하는 조합뉴스가 없습니다.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {combinedData.map((news, idx) => {
            const gradientClass = PREMIUM_GRADIENTS[idx % PREMIUM_GRADIENTS.length];
            return (
              <div
                key={news.id}
                onClick={() => openNewsletterDetail(news)}
                className="stone-card bg-white rounded-2xl border border-stone-surface/80 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group relative"
              >
                {/* 상단 썸네일/그라데이션 영역 */}
                <div className={cn("h-32 bg-gradient-to-br flex items-center justify-center p-6 border-b border-stone-surface/40 select-none relative", gradientClass)}>
                  {news.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={news.imagePath} alt="Thumbnail" className="absolute inset-0 size-full object-cover opacity-80 filter blur-[0.2px] hover:blur-none transition-all duration-300" />
                  ) : (
                    <span className="text-3xl leading-none filter drop-shadow-xs">
                      {news.title.includes("월간") ? "📅" : "⚡"}
                    </span>
                  )}
                  {news.isReal && (
                    <span className="absolute top-3 left-3 bg-sky-blue/15 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1.5 py-0.5 select-none shadow-3xs z-2">
                      실제자료
                    </span>
                  )}
                  {news.isPreview && (
                    <span className="absolute top-3 left-3 bg-sky-blue/15 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1.5 py-0.5 select-none shadow-3xs z-2">
                      오픈 예정
                    </span>
                  )}
                  {news.isStarred && (
                    <span className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[8px] font-extrabold scale-90 rounded px-1.5 py-0.5 select-none shadow-3xs z-2">
                      ★ 중요 브리핑
                    </span>
                  )}
                </div>

                {/* 중앙 텍스트 영역 */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-extrabold text-charcoal-primary leading-snug break-all group-hover:text-sky-blue transition-colors line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-[11px] text-graphite/80 font-normal leading-relaxed line-clamp-3 break-all">
                      {news.content}
                    </p>
                    {news.attachmentPath && (
                      <span className="inline-flex rounded-full bg-stone-surface px-2 py-1 text-[9px] font-bold text-graphite">
                        첨부파일
                      </span>
                    )}
                  </div>

                  {/* 하단 메타 영역 */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-ash font-mono border-t border-stone-surface/40 pt-3">
                    <span>작성자: {news.author.name}</span>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span>등록일 {news.createdAt}</span>
                      {isAdmin && news.isReal && (
                        <button
                          type="button"
                          aria-label={`${news.title} 목록 오픈채팅 공지문 복사`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleOpenChatCopy(news);
                          }}
                          disabled={openChatCopyStatus[news.id] === "copying"}
                          className="rounded-full border border-meadow-green/25 bg-meadow-green/10 px-2 py-0.5 text-[9px] font-bold text-meadow-green hover:bg-meadow-green/15 disabled:opacity-60"
                        >
                          {openChatCopyStatus[news.id] === "copying" ? "복사 중" : "공지문 복사"}
                        </button>
                      )}
                      {isAdmin && news.isReal && openChatCopyStatus[news.id] === "copied" && (
                        <span className="text-[9px] font-bold text-meadow-green">
                          복사됨
                        </span>
                      )}
                      {isAdmin && news.isReal && openChatCopyStatus[news.id] === "error" && (
                        <span className="text-[9px] font-bold text-ember-orange">
                          실패
                        </span>
                      )}
                      {isAdmin && news.isReal && (
                        <button
                          type="button"
                          aria-label="조합뉴스 삭제"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteNews(news);
                          }}
                          className="rounded-full border border-coral-red/20 bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red hover:bg-coral-red/15"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. 조합뉴스 상세 열람 패널 */}
      {portalRoot && activeViewNews && createPortal(
        <>
          <div
            className="fixed inset-0 z-[110] bg-black/35 backdrop-blur-xs animate-in fade-in duration-300 motion-reduce:animate-none"
            onClick={closeNewsletterDetail}
          />
          <aside
            aria-label="조합뉴스 상세 패널"
            className="fixed inset-y-0 left-0 z-[130] flex w-full max-w-2xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 text-left shadow-2xl animate-in slide-in-from-left duration-300 ease-out motion-reduce:animate-none sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-stone-surface pb-4">
              <div className="min-w-0 space-y-1">
                <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-sky-blue">
                  Coop Newsletter
                </span>
                <h2 className="text-lg font-black text-charcoal-primary">조합뉴스 열람</h2>
              </div>
              <button
                onClick={closeNewsletterDetail}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                목록으로
              </button>
            </div>

            <div className="space-y-4 pt-5">
              {editingNewsId === activeViewNews.id ? (
                <form onSubmit={(event) => void handleEditSubmit(event, activeViewNews)} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-charcoal-primary">조합뉴스 수정</h3>
                    <button
                      type="button"
                      onClick={cancelNewsEdit}
                      className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                    >
                      수정 취소
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-edit-title" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      소식지 제목 *
                    </label>
                    <input
                      id="newsletter-edit-title"
                      aria-label="조합뉴스 제목 수정"
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-edit-content" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      상세 본문 내용 *
                    </label>
                    <textarea
                      id="newsletter-edit-content"
                      aria-label="조합뉴스 내용 수정"
                      required
                      rows={6}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full resize-none rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs leading-relaxed text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-edit-registered-at" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      등록일
                    </label>
                    <input
                      id="newsletter-edit-registered-at"
                      aria-label="조합뉴스 등록일 수정"
                      type="datetime-local"
                      value={editRegisteredAt}
                      onChange={(e) => setEditRegisteredAt(e.target.value)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-edit-image-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      카드 썸네일 이미지 파일 (선택)
                    </label>
                    {editImagePath && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-surface bg-white px-3 py-2 text-[11px] font-bold text-graphite">
                        <span>현재 썸네일 이미지가 등록되어 있습니다.</span>
                        <button
                          type="button"
                          onClick={() => setEditImagePath(null)}
                          className="rounded-full bg-stone-surface px-2.5 py-1 text-[10px] font-bold text-graphite"
                        >
                          이미지 제거
                        </button>
                      </div>
                    )}
                    <input
                      id="newsletter-edit-image-file"
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                    />
                    {editImageFile && (
                      <p className="text-[10px] font-bold text-sky-blue">새 이미지: {editImageFile.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-edit-attachment-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      첨부파일 (선택)
                    </label>
                    {editAttachmentPath && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-surface bg-white px-3 py-2 text-[11px] font-bold text-graphite">
                        <span>현재 첨부파일: {editAttachmentName || "다운로드"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditAttachmentPath(null);
                            setEditAttachmentName(null);
                            setEditAttachmentSize(null);
                          }}
                          className="rounded-full bg-stone-surface px-2.5 py-1 text-[10px] font-bold text-graphite"
                        >
                          첨부 제거
                        </button>
                      </div>
                    )}
                    <input
                      id="newsletter-edit-attachment-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.hwpx,.zip"
                      onChange={(e) => setEditAttachmentFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                    />
                    {editAttachmentFile && (
                      <p className="text-[10px] font-bold text-sky-blue">새 첨부파일: {editAttachmentFile.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 py-1 select-none">
                    <input
                      type="checkbox"
                      id="newsletter-edit-starred-checkbox"
                      checked={editIsStarred}
                      onChange={(e) => setEditIsStarred(e.target.checked)}
                      className="size-4.5 border border-stone-surface rounded focus:ring-sky-blue text-midnight cursor-pointer"
                    />
                    <label htmlFor="newsletter-edit-starred-checkbox" className="text-[11.5px] font-extrabold text-graphite/90 cursor-pointer font-mono">
                      주요 브리핑(중요 배지)으로 표시
                    </label>
                  </div>
                  <div className="flex justify-end border-t border-stone-surface pt-4">
                    <Button
                      type="submit"
                      disabled={isSavingEdit}
                      className="h-9 rounded-full bg-midnight px-5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
                    >
                      {isSavingEdit ? "저장 중…" : "수정사항 저장"}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-extrabold text-charcoal-primary leading-snug">
                      {activeViewNews.title}
                    </h3>
                    {isAdmin && activeViewNews.isReal && (
                      <button
                        type="button"
                        onClick={() => beginNewsEdit(activeViewNews)}
                        className="shrink-0 rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                      >
                        수정
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10.5px] font-bold text-ash font-mono border-y border-stone-surface/60 py-2">
                    <span>📂 분류: 주/월간 조합소식지</span>
                    <span>•</span>
                    <span>작성자: {activeViewNews.author.name}</span>
                    <span>•</span>
                    <span>등록일: {activeViewNews.createdAt}</span>
                  </div>

                  <div className="text-xs sm:text-[13px] text-graphite/90 leading-7 font-normal whitespace-pre-wrap pt-2">
                    {activeViewNews.imagePath && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeViewNews.imagePath}
                        alt=""
                        className="mb-4 max-h-72 w-full rounded-2xl object-cover border border-stone-surface"
                      />
                    )}
                    {activeViewNews.content}
                  </div>
                  {activeViewNews.attachmentPath && (
                    <a
                      href={activeViewNews.attachmentPath}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-stone-surface bg-white px-4 py-3 text-xs font-bold text-charcoal-primary hover:border-sky-blue"
                    >
                      <span>첨부파일: {activeViewNews.attachmentName || "다운로드"}</span>
                      <span className="text-[10px] text-sky-blue">열기</span>
                    </a>
                  )}
                </>
              )}
              {isAdmin && activeViewNews.isReal && editingNewsId !== activeViewNews.id && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-stone-surface">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`${activeViewNews.title} 오픈채팅 공지문 복사`}
                    onClick={() => void handleOpenChatCopy(activeViewNews)}
                    disabled={openChatCopyStatus[activeViewNews.id] === "copying"}
                    className="h-8 rounded-full border-meadow-green/30 px-3 text-[11px] font-bold text-meadow-green hover:bg-meadow-green/5 disabled:opacity-60"
                  >
                    {openChatCopyStatus[activeViewNews.id] === "copying" ? "복사 중" : "공지문 복사"}
                  </Button>
                  {openChatCopyStatus[activeViewNews.id] === "copied" && (
                    <span className="text-[10px] font-bold text-meadow-green">
                      공지문 복사됨
                    </span>
                  )}
                  {openChatCopyStatus[activeViewNews.id] === "error" && (
                    <span className="text-[10px] font-bold text-ember-orange">
                      복사 실패
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="조합뉴스 삭제"
                    onClick={() => void handleDeleteNews(activeViewNews)}
                    className="rounded-full border border-coral-red/20 bg-coral-red/10 px-3 py-1.5 text-[11px] font-bold text-coral-red hover:bg-coral-red/15"
                  >
                    조합뉴스 삭제
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>,
        portalRoot,
      )}

      {/* 2. 신규 조합뉴스 등록 패널 (관리자용) */}
      {portalRoot && showUploadModal && createPortal(
        <>
          <div
            className="fixed inset-0 z-[110] bg-black/35 backdrop-blur-xs animate-in fade-in duration-300 motion-reduce:animate-none"
            onClick={() => setShowUploadModal(false)}
          />
          <aside
            aria-label="조합뉴스 작성 패널"
            className="fixed inset-y-0 left-0 z-[130] flex w-full max-w-2xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 text-left shadow-2xl animate-in slide-in-from-left duration-300 ease-out motion-reduce:animate-none sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-stone-surface pb-4">
              <div className="min-w-0 space-y-1">
                <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-sky-blue">
                  Coop Newsletter
                </span>
                <h2 className="text-lg font-black text-charcoal-primary">신규 주/월간소식 작성</h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                목록으로
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 pt-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  소식지 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 대방동 2026년 6월 조합 월간 소식지 (제25호)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  상세 본문 내용 *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="주간/월간 소식의 상세 실적 보고 내용을 작성해 주십시오."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  onPaste={handlePasteImage}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue resize-none leading-relaxed"
                />
                <p className="text-[10px] font-medium text-ash">
                  본문 영역에 이미지를 복사한 뒤 Ctrl+V로 붙여넣으면 썸네일 이미지로 등록됩니다.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="newsletter-image-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  카드 썸네일 이미지 파일 (선택)
                </label>
                <input
                  id="newsletter-image-file"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(e) => setUploadImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                />
                {uploadImageFile && (
                  <p className="text-[10px] font-bold text-sky-blue">
                    선택된 이미지: {uploadImageFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="newsletter-registered-at" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  등록일
                </label>
                <input
                  id="newsletter-registered-at"
                  aria-label="등록일"
                  type="datetime-local"
                  value={uploadRegisteredAt}
                  onChange={(e) => setUploadRegisteredAt(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="newsletter-attachment-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  첨부파일 (선택)
                </label>
                <input
                  id="newsletter-attachment-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.hwpx,.zip"
                  onChange={(e) => setUploadAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                />
                {uploadAttachmentFile && (
                  <p className="text-[10px] font-bold text-sky-blue">
                    선택된 첨부파일: {uploadAttachmentFile.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  type="checkbox"
                  id="starred-checkbox"
                  checked={uploadIsStarred}
                  onChange={(e) => setUploadIsStarred(e.target.checked)}
                  className="size-4.5 border border-stone-surface rounded focus:ring-sky-blue text-midnight cursor-pointer"
                />
                <label htmlFor="starred-checkbox" className="text-[11.5px] font-extrabold text-graphite/90 cursor-pointer font-mono">
                  주요 브리핑(중요 배지)으로 표시
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-9.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "등록 중…" : "조합뉴스 즉시 등록"}
                </Button>
              </div>
            </form>
          </aside>
        </>,
        portalRoot,
      )}
    </div>
  );
}
