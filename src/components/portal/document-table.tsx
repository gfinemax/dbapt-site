"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PdfViewerModal } from "./pdf-viewer-modal";
import { getPdfRelatedDocument } from "@/lib/document-relations";
import { formatViewCount } from "@/lib/view-count";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [starringId, setStarringId] = useState<string | null>(null);
  const [activeViewDoc, setActiveViewDoc] = useState<Document | null>(null);
  const activeViewDocRelation = activeViewDoc ? getPdfRelatedDocument(activeViewDoc, documents) : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  const filtered = documents
    .filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // 별표 문서를 항상 상단에 정렬
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return 0;
    });

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
          onClick={() => handleStarToggle(doc)}
          disabled={starringId === doc.id}
          className="text-base leading-none transition-transform duration-150 active:scale-125 cursor-pointer disabled:opacity-50 select-none"
          title={doc.isStarred ? "중요 해제" : "중요 표시"}
        >
          {doc.isStarred ? "⭐" : "☆"}
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
        onClick={() => handleDelete(doc.id, doc.title)}
        disabled={deletingId === doc.id}
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
      className={`stone-card bg-white p-4.5 rounded-2xl border hover:shadow-xs transition-all duration-200 flex flex-col gap-3.5 ${
        doc.isStarred
          ? "border-amber-orange/30 bg-amber-50/20"
          : "border-[#f2f0ed] hover:border-ember-orange/45"
      }`}
    >
      {/* 구분 뱃지, 별표 및 일자 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {renderStarButton(doc)}
          {renderCategoryBadge(doc)}
        </div>
        <span className="text-graphite/60 font-mono text-[11px]">
          {formatDate(doc.documentDate || doc.publishedAt || doc.createdAt)}
        </span>
      </div>

      {/* 제목 및 설명 */}
      <div className="space-y-1">
        <h4 className="text-[13px] font-bold text-charcoal-primary leading-snug break-all">
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
        </h4>
        {doc.description && (
          <p className="text-[11px] text-graphite/70 leading-relaxed font-normal break-all">
            {doc.description}
          </p>
        )}
      </div>

      {/* 파일명, 용량 및 CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-[#f2f0ed] gap-4">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span
            className="text-[10px] text-ash font-mono truncate max-w-[260px] block"
            title={doc.fileName}
          >
            {doc.fileName}
          </span>
          <span className="text-[9px] text-[#848281] font-mono">
            {formatSize(doc.fileSize)}
          </span>
          <span className="text-[9px] text-ash font-mono">
            {formatViewCount(doc.viewCount, "열람")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                doc.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {doc.status === "APPROVED" ? "공개됨" : "대기중"}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => openViewDoc(doc)}
            className="text-[11px] h-8 px-3 rounded-full border-[#f2f0ed] hover:border-ember-orange hover:text-ember-orange active:scale-95 transition-all duration-200 cursor-pointer"
          >
            열람
          </Button>
          {renderDeleteButton(doc)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="문서 제목으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs rounded-xl border border-[#f2f0ed] bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "DISCLOSURE", "ACCOUNTING", "NOTICE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
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

      {filtered.length === 0 ? (
        <div className="stone-card px-6 py-12 text-center text-graphite text-sm">
          조건에 일치하는 문서가 없습니다.
        </div>
      ) : isDrawerMode ? (
        /* 드로어 전용 모드: 컴팩트한 카드형 모바일 최적화 레이아웃 */
        <div className="space-y-3.5">
          {filtered.map((doc) => renderCard(doc))}
        </div>
      ) : (
        /* 일반 데스크톱 모드: PC 화면에서는 기존 테이블, 모바일 화면에서는 카드 리스트 자동 변환 */
        <>
          {/* 1) 모바일 뷰 카드 리스트 (block md:hidden) */}
          <div className="block md:hidden space-y-3.5">
            {filtered.map((doc) => renderCard(doc))}
          </div>

          {/* 2) 데스크톱 뷰 테이블 (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#f2f0ed] bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#f2f0ed] bg-[#f8f7f4] text-xs font-semibold text-charcoal-primary uppercase tracking-wider">
                  <th className="px-3 py-4 w-10 text-center">★</th>
                  <th className="px-5 py-4">발생일</th>
                  <th className="px-5 py-4">구분</th>
                  <th className="px-5 py-4">문서 제목</th>
                  <th className="px-5 py-4">파일명</th>
                  <th className="px-5 py-4">크기</th>
                  {isAdmin && <th className="px-5 py-4">상태</th>}
                  <th className="px-5 py-4 text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f0ed] text-graphite">
                {filtered.map((doc) => (
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
