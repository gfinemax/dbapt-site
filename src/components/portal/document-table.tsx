"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfViewerModal } from "./pdf-viewer-modal";
import { ContentLikeButton } from "@/components/content-like-button";
import { getPdfRelatedDocument } from "@/lib/document-relations";
import { formatViewCount } from "@/lib/view-count";
import { DocumentBookmarkButton } from "./document-bookmark-button";
import {
  DOCUMENT_BOOKMARK_CHANGED_EVENT,
  type DocumentBookmarkChangedDetail,
} from "@/lib/document-bookmark-events";

const PAGE_SIZE = 20;

export type Attachment = {
  id: string;
  documentId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  originalFileSize?: number | null;
  storedFileSize?: number | null;
  fileOptimized?: boolean;
  fileSizeReductionPercent?: number | null;
  createdAt: string;
};

export type Document = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  subCategory?: string | null;
  correspondenceType?: "발신" | "수신" | "회신" | null;
  replyToDocumentId?: string | null;
  replyNotRequired?: boolean;
  replyDueDate?: string | null;
  fileName: string;
  fileSize: number;
  originalFileSize?: number | null;
  storedFileSize?: number | null;
  fileOptimized?: boolean;
  fileSizeReductionPercent?: number | null;
  viewCount?: number;
  likeCount?: number;
  likedByCurrentUser?: boolean;
  status: string;
  isStarred?: boolean;
  publishedAt: string | null;
  documentDate?: string;
  createdAt: string;
  attachmentName?: string | null;
  attachmentPath?: string | null;
  attachmentSize?: number | null;
  socialImagePath?: string | null;
  attachments?: Attachment[];
  isViewedByCurrentUser?: boolean;
  isBookmarkedByCurrentUser?: boolean;
};

type DocumentTableProps = {
  documents: Document[];
  role: string;
  isDrawerMode?: boolean;
  initialCategory?: string;
  initialSearch?: string;
  onOpenDocument?: (doc: Document) => void;
  onDocumentDeleted?: (id: string) => void;
  onDocumentStarToggled?: (id: string, isStarred: boolean) => void;
};

export function DocumentTable({
  documents,
  role,
  isDrawerMode = false,
  initialCategory = "all",
  initialSearch = "",
  onOpenDocument,
  onDocumentDeleted,
  onDocumentStarToggled,
}: DocumentTableProps) {
  const isAdmin = role.toUpperCase() === "ADMIN";
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [statusFilter, setStatusFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [bookmarkOverrides, setBookmarkOverrides] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [starringId, setStarringId] = useState<string | null>(null);
  const [activeViewDoc, setActiveViewDoc] = useState<Document | null>(null);

  useEffect(() => {
    const handleExternalBookmarkChange = (event: Event) => {
      const { documentId, isBookmarked } = (event as CustomEvent<DocumentBookmarkChangedDetail>).detail;
      setBookmarkOverrides((current) => ({ ...current, [documentId]: isBookmarked }));
    };

    window.addEventListener(DOCUMENT_BOOKMARK_CHANGED_EVENT, handleExternalBookmarkChange);
    return () => window.removeEventListener(DOCUMENT_BOOKMARK_CHANGED_EVENT, handleExternalBookmarkChange);
  }, []);
  const activeViewDocRelation = activeViewDoc ? getPdfRelatedDocument(activeViewDoc, documents) : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  const localDocuments = useMemo(
    () =>
      documents.map((document) => ({
        ...document,
        ...(bookmarkOverrides[document.id] === undefined
          ? {}
          : { isBookmarkedByCurrentUser: bookmarkOverrides[document.id] }),
      })),
    [bookmarkOverrides, documents],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = localDocuments
    .filter((doc) => {
      const matchesSearch = [doc.title, doc.fileName, doc.description || ""]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
      const matchesFavorite = !favoritesOnly || doc.isBookmarkedByCurrentUser;
      return matchesSearch && matchesCategory && matchesStatus && matchesFavorite;
    })
    .sort((a, b) => {
      // 별표 문서를 항상 상단에 정렬
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return 0;
    });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedDocuments = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleBookmarkChange = (documentId: string, isBookmarked: boolean) => {
    setBookmarkOverrides((current) => ({ ...current, [documentId]: isBookmarked }));
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `"${title}" 문서를 정말 삭제하시겠습니까?\n\n삭제된 문서와 첨부파일은 복구할 수 없습니다.`
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "문서 삭제에 실패했습니다.");
        return;
      }
      onDocumentDeleted?.(id);
    } catch (e) {
      console.error(e);
      alert("문서 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStarToggle = async (doc: Document) => {
    const newStarred = !doc.isStarred;
    setStarringId(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: newStarred }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "문서 상태 변경에 실패했습니다.");
        return;
      }
      onDocumentStarToggled?.(doc.id, newStarred);
    } catch (e) {
      console.error(e);
      alert("문서 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setStarringId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  // 3일 이내 신규 업로드 판별 함수
  const isRecent = (dateStr: string | null) => {
    if (!dateStr) return false;
    const uploadTime = new Date(dateStr).getTime();
    const nowTime = new Date().getTime();
    const diffDays = (nowTime - uploadTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "DISCLOSURE":
        return "의무 정보 공개";
      case "ACCOUNTING":
        return "회계 및 자금 보고";
      case "NOTICE":
        return "조합원 공지";
      default:
        return cat;
    }
  };

  // 별표 버튼 렌더
  const renderStarButton = (doc: Document) => {
    if (isAdmin) {
      return (
        <button
          type="button"
          onClick={() => handleStarToggle(doc)}
          disabled={starringId === doc.id}
          aria-label={`${doc.title} ${doc.isStarred ? "중요 해제" : "중요 지정"}`}
          className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[10px] font-bold transition disabled:opacity-50 ${
            doc.isStarred
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-stone-surface bg-white text-graphite hover:border-amber-300 hover:text-amber-700"
          }`}
          title="중요 표시는 모든 사용자에게 공통 적용되며 개인 즐겨찾기와 다릅니다."
        >
          <span aria-hidden="true">{doc.isStarred ? "★" : "☆"}</span>
          {starringId === doc.id ? "처리 중" : doc.isStarred ? "중요 해제" : "중요 지정"}
        </button>
      );
    }
    if (doc.isStarred) {
      return (
        <span className="text-base leading-none select-none" title="중요 문서">
          ⭐
        </span>
      );
    }
    return null;
  };

  // 삭제 버튼 렌더
  const renderDeleteButton = (doc: Document) => {
    if (!isAdmin) return null;
    return (
      <button
        type="button"
        onClick={() => handleDelete(doc.id, doc.title)}
        disabled={deletingId === doc.id}
        aria-label={`${doc.title} 삭제`}
        className="flex items-center justify-center size-8 rounded-full text-ash hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all duration-150 cursor-pointer disabled:opacity-40"
        title="문서 삭제"
      >
        {deletingId === doc.id ? (
          <span className="size-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
    );
  };

  // 카테고리 뱃지 렌더
  const renderCategoryBadge = (doc: Document) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
        doc.category === "DISCLOSURE"
          ? "bg-sky-blue/10 text-sky-blue"
          : doc.category === "ACCOUNTING"
          ? "bg-meadow-green/10 text-midnight"
          : "bg-sunburst-yellow/15 text-charcoal-primary"
      }`}
    >
      {getCategoryLabel(doc.category)}
    </span>
  );

  // 첨부파일 뱃지 렌더
  const renderAttachmentBadge = (doc: Document) => {
    if (!doc.attachments || doc.attachments.length === 0) return null;
    return (
      <span
        className="inline-flex items-center gap-0.5 rounded bg-[#ff3e00]/5 border border-[#ff3e00]/10 px-1.5 py-0.5 text-[9px] font-bold text-ember-orange select-none animate-pulse-subtle"
        title={`추가 첨부파일 ${doc.attachments.length}개`}
      >
        📎 첨부 ({doc.attachments.length})
      </span>
    );
  };

  // 문서 열람 핸들러
  const openViewDoc = (doc: Document) => {
    if (onOpenDocument) {
      onOpenDocument(doc);
      return;
    }
    setActiveViewDoc(doc);
  };

  // 카드 뷰 렌더 (드로어 모바일 공용)
  const renderCard = (doc: Document) => (
    <div
      key={doc.id}
      className={`group w-full min-w-0 rounded-xl border bg-white px-4 py-3 transition-colors hover:bg-warm-canvas/60 ${
        doc.isStarred
          ? "border-amber-orange/30"
          : "border-[#f2f0ed]"
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {renderStarButton(doc)}
          {renderCategoryBadge(doc)}
          {isAdmin && (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                doc.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {doc.status === "APPROVED" ? "공개됨" : "공개 대기"}
            </span>
          )}
        </div>
        <span className="shrink-0 font-mono text-[11px] text-ash">
          {formatDate(doc.documentDate || doc.publishedAt || doc.createdAt)}
        </span>
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => openViewDoc(doc)}
          aria-label={`${doc.title} 열람`}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue/40"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-bold leading-5 text-charcoal-primary">{doc.title}</span>
            {isRecent(doc.publishedAt || doc.createdAt) && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" /> NEW
              </span>
            )}
            {renderAttachmentBadge(doc)}
          </span>
          <span className="mt-0.5 block truncate text-xs leading-5 text-graphite/70">
            {doc.description || doc.fileName}
          </span>
        </button>
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ash transition-transform group-hover:translate-x-0.5 group-hover:text-charcoal-primary" />
      </div>

    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <input
          type="text"
          placeholder="제목·파일명·설명 검색..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full lg:max-w-md rounded-xl border border-[#f2f0ed] bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "DISCLOSURE", "ACCOUNTING", "NOTICE"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                categoryFilter === cat
                  ? "bg-midnight text-white"
                  : "bg-white text-graphite border border-[#f2f0ed] hover:bg-parchment-card"
              }`}
            >
              {cat === "all" ? "전체 보기" : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 border-t border-stone-surface pt-3">
            <span className="mr-1 text-[11px] font-semibold text-ash">관리 필터</span>
            {[
              ["all", "전체 상태"],
              ["APPROVED", "공개됨"],
              ["PENDING", "공개 대기"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  statusFilter === value
                    ? "bg-midnight text-white"
                    : "bg-parchment-card text-graphite hover:bg-stone-surface"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={favoritesOnly}
              onClick={() => {
                setFavoritesOnly((current) => !current);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                favoritesOnly
                  ? "bg-sky-blue text-white"
                  : "bg-parchment-card text-graphite hover:bg-stone-surface"
              }`}
            >
              즐겨찾기 문서
            </button>
            <span className="ml-auto text-[11px] text-ash">검색 결과 {filtered.length}건</span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="stone-card px-6 py-12 text-center text-graphite text-sm">
          조건에 일치하는 문서가 없습니다.
        </div>
      ) : isDrawerMode ? (
        /* 드로어 전용 모드: 컴팩트한 카드형 모바일 최적화 레이아웃 */
        <div className="space-y-3.5">
          {pagedDocuments.map((doc) => renderCard(doc))}
        </div>
      ) : (
        /* 일반 데스크톱 모드: PC 화면에서는 기존 테이블, 모바일 화면에서는 카드 리스트 자동 변환 */
        <>
          {/* 1) 모바일 뷰 카드 리스트 (block md:hidden) */}
          <div className="block md:hidden space-y-3.5">
            {pagedDocuments.map((doc) => renderCard(doc))}
          </div>

          {/* 2) 데스크톱 뷰 테이블 (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#f2f0ed] bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#f2f0ed] bg-[#f8f7f4] text-xs font-semibold text-charcoal-primary uppercase tracking-wider">
                  <th className="px-3 py-4 w-14 text-center">중요</th>
                  <th className="px-5 py-4">발생일</th>
                  <th className="px-5 py-4">구분</th>
                  <th className="px-5 py-4">문서 제목</th>
                  <th className="px-5 py-4">파일명</th>
                  <th className="px-5 py-4">크기</th>
                  <th className="px-5 py-4 text-center">공감</th>
                  <th className="px-5 py-4 text-center">즐겨찾기</th>
                  {isAdmin && <th className="px-5 py-4">상태</th>}
                  <th className="px-5 py-4 text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f0ed] text-graphite">
                {pagedDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${
                      doc.isStarred
                        ? "bg-amber-50/40 hover:bg-amber-50/60"
                        : "hover:bg-[#fbfaf9]"
                    }`}
                  >
                    <td className="px-3 py-4 text-center">
                      {renderStarButton(doc)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatDate(
                        doc.documentDate || doc.publishedAt || doc.createdAt
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          doc.category === "DISCLOSURE"
                            ? "bg-sky-blue/10 text-sky-blue"
                            : doc.category === "ACCOUNTING"
                            ? "bg-meadow-green/10 text-midnight"
                            : "bg-sunburst-yellow/15 text-charcoal-primary"
                        }`}
                      >
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-charcoal-primary">
                      <div className="leading-snug break-all">
                        {doc.isStarred && (
                          <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                            ★ 중요
                          </span>
                        )}
                        <span>{doc.title}</span>
                        {isRecent(doc.publishedAt || doc.createdAt) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full select-none shrink-0 shadow-3xs ml-1.5 align-middle">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            NEW
                          </span>
                        )}
                        {renderAttachmentBadge(doc)}
                      </div>
                      {doc.description && (
                        <div className="mt-1 text-xs text-graphite/70 font-normal">
                          {doc.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      {doc.fileName}
                      <div className="mt-1 text-[10px] font-mono text-ash">
                        {formatViewCount(doc.viewCount, "열람")}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatSize(doc.fileSize)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      <ContentLikeButton
                        title={doc.title}
                        targetType="DOCUMENT"
                        targetId={doc.id}
                        initialLikeCount={doc.likeCount}
                        initialLikedByCurrentUser={doc.likedByCurrentUser}
                        canLike={role.toUpperCase() !== "PUBLIC"}
                        className="h-7 px-2 py-0 text-[10px] font-bold"
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      <DocumentBookmarkButton
                        document={doc}
                        onBookmarkChange={handleBookmarkChange}
                        includeDocumentTitleInLabel
                      />
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            doc.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.status === "APPROVED" ? "공개됨" : "대기중"}
                        </span>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openViewDoc(doc)}
                          className="text-xs h-8 rounded-full border-[#f2f0ed] hover:border-ember-orange hover:text-ember-orange"
                        >
                          열람
                        </Button>
                        {renderDeleteButton(doc)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filtered.length > PAGE_SIZE && (
        <nav aria-label="문서 목록 페이지" className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            className="rounded-full bg-parchment-card px-4 py-2 text-xs font-semibold text-graphite transition hover:bg-stone-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          <span className="min-w-16 text-center text-xs font-semibold text-charcoal-primary">
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={currentPage === pageCount}
            className="rounded-full bg-parchment-card px-4 py-2 text-xs font-semibold text-graphite transition hover:bg-stone-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </nav>
      )}

      {/* 실시간 보안 인라인 PDF 뷰어 모달 */}
      {activeViewDoc && (
        <PdfViewerModal
          documentId={activeViewDoc.id}
          documentTitle={activeViewDoc.title}
          fileName={activeViewDoc.fileName}
          onClose={() => setActiveViewDoc(null)}
          documentDate={activeViewDoc.documentDate || activeViewDoc.publishedAt || activeViewDoc.createdAt || undefined}
          createdAt={activeViewDoc.createdAt}
          publishedAt={activeViewDoc.publishedAt || undefined}
          fileSize={activeViewDoc.fileSize}
          category={activeViewDoc.category}
          subCategory={activeViewDoc.subCategory}
          description={activeViewDoc.description}
          attachments={activeViewDoc.attachments}
          relatedDocument={activeViewDocRelation?.document}
          relatedDocumentLabel={activeViewDocRelation?.label}
        />
      )}
    </div>
  );
}
