"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Document } from "./document-table";
import { DocumentBookmarkButton } from "./document-bookmark-button";
import type { PersonalLibraryContentBookmark } from "@/lib/personal-library-data";

type PersonalDocumentHubProps = {
  documents: Document[];
  role: string;
  contentBookmarks?: PersonalLibraryContentBookmark[];
  isDrawerMode?: boolean;
  onOpenDocument?: (doc: Document) => void;
};

type ActiveTab = "recommended" | "saved" | "content";
type DocumentFlagOverrides = Record<
  string,
  Pick<Document, "isViewedByCurrentUser" | "isBookmarkedByCurrentUser">
>;

const RECENT_DAYS = 14;
const RECOMMENDED_LIMIT = 6;
const TAB_GUIDANCE: Record<ActiveTab, string> = {
  recommended: "아직 열람하지 않은 중요 문서와 최근 14일 이내 등록된 공개 문서를 보여드립니다.",
  saved: "공개자료실에서 직접 보관한 PDF·공개 문서를 모아 보여드립니다.",
  content: "공지사항·조합뉴스·자유게시판에서 직접 보관한 게시글을 모아 보여드립니다.",
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getDocumentTime = (doc: Document) =>
  new Date(doc.documentDate || doc.publishedAt || doc.createdAt).getTime();

const isRecentDocument = (doc: Document) => {
  const documentTime = getDocumentTime(doc);
  const diffDays = (Date.now() - documentTime) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= RECENT_DAYS;
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "DISCLOSURE":
      return "의무 정보 공개";
    case "ACCOUNTING":
      return "회계 및 자금 보고";
    case "NOTICE":
      return "조합원 공지";
    default:
      return category;
  }
};

export function PersonalDocumentHub({
  documents,
  role,
  contentBookmarks = [],
  isDrawerMode = false,
  onOpenDocument,
}: PersonalDocumentHubProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("recommended");
  const [documentFlagOverrides, setDocumentFlagOverrides] = useState<DocumentFlagOverrides>({});

  const localDocs = useMemo(
    () =>
      documents.map((doc) => ({
        ...doc,
        ...documentFlagOverrides[doc.id],
      })),
    [documents, documentFlagOverrides],
  );

  const savedDocs = useMemo(
    () =>
      localDocs
        .filter((doc) => doc.isBookmarkedByCurrentUser)
        .sort((a, b) => getDocumentTime(b) - getDocumentTime(a)),
    [localDocs],
  );

  const recommendedDocs = useMemo(
    () =>
      localDocs
        .filter((doc) => !doc.isViewedByCurrentUser)
        .filter((doc) => doc.isStarred || isRecentDocument(doc))
        .sort((a, b) => {
          if (a.isStarred && !b.isStarred) return -1;
          if (!a.isStarred && b.isStarred) return 1;
          return getDocumentTime(b) - getDocumentTime(a);
        })
        .slice(0, RECOMMENDED_LIMIT),
    [localDocs],
  );

  const activeDocs = activeTab === "recommended" ? recommendedDocs : savedDocs;

  const handleOpen = (doc: Document) => {
    setDocumentFlagOverrides((current) => ({
      ...current,
      [doc.id]: {
        ...current[doc.id],
        isViewedByCurrentUser: true,
      },
    }));
    onOpenDocument?.(doc);
  };

  const handleBookmarkChange = (documentId: string, nextBookmarked: boolean) => {
    setDocumentFlagOverrides((current) => ({
      ...current,
      [documentId]: {
        ...current[documentId],
        isBookmarkedByCurrentUser: nextBookmarked,
      },
    }));
    if (nextBookmarked) {
      setActiveTab("saved");
    }
    if (!nextBookmarked && activeTab === "saved" && savedDocs.length === 1) {
      setActiveTab("recommended");
    }
  };

  const renderCard = (doc: Document) => {
    const recent = isRecentDocument(doc);
    return (
      <article
        key={doc.id}
        className="w-full min-w-0 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_#f2f0ed] transition-colors hover:bg-warm-canvas/60"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-bold text-sky-blue">
              {getCategoryLabel(doc.category)}
            </span>
            {doc.isStarred && (
              <span className="rounded-full bg-sunburst-yellow/20 px-2.5 py-1 text-[10px] font-bold text-charcoal-primary">
                중요
              </span>
            )}
            {recent && (
              <span className="rounded-full bg-meadow-green/10 px-2.5 py-1 text-[10px] font-bold text-midnight">
                최근
              </span>
            )}
            {doc.isBookmarkedByCurrentUser && (
              <span className="rounded-full bg-ember-orange/10 px-2.5 py-1 text-[10px] font-bold text-ember-orange">
                보관됨
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-ash">
            {formatDate(doc.documentDate || doc.publishedAt || doc.createdAt)}
          </span>
        </div>

        <h4 className="mt-3 break-all text-sm font-bold leading-snug text-charcoal-primary">
          {doc.title}
        </h4>
        {doc.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-graphite/75">
            {doc.description}
          </p>
        )}

        <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-stone-surface pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="break-all font-mono text-[11px] text-graphite" title={doc.fileName}>
              {doc.fileName}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-ash">{formatSize(doc.fileSize)}</p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <DocumentBookmarkButton
              document={doc}
              onBookmarkChange={handleBookmarkChange}
              className="h-8 px-3 text-[11px]"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleOpen(doc)}
              className="h-8 rounded-full bg-midnight px-3 text-[11px] font-bold text-white hover:bg-charcoal-primary"
            >
              열람
            </Button>
          </div>
        </div>
      </article>
    );
  };

  const renderContentCard = (item: PersonalLibraryContentBookmark) => (
    <article
      key={item.id}
      className="w-full min-w-0 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_#f2f0ed] transition-colors hover:bg-warm-canvas/60"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-bold text-sky-blue">
            {item.sourceLabel}
          </span>
          {item.isStarred && (
            <span className="rounded-full bg-sunburst-yellow/20 px-2.5 py-1 text-[10px] font-bold text-charcoal-primary">
              중요
            </span>
          )}
          <span className="rounded-full bg-ember-orange/10 px-2.5 py-1 text-[10px] font-bold text-ember-orange">
            보관됨
          </span>
        </div>
        <span className="font-mono text-[11px] text-ash">
          {formatDate(item.registeredAt)}
        </span>
      </div>

      <h4 className="mt-3 break-all text-sm font-bold leading-snug text-charcoal-primary">
        {item.title}
      </h4>
      {item.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-graphite/75">
          {item.description}
        </p>
      )}

      <div className="mt-4 flex justify-end border-t border-stone-surface pt-3">
        <Link
          href={item.href}
          aria-label={`${item.title} 열기`}
          className="inline-flex h-8 items-center rounded-full bg-midnight px-3 text-[11px] font-bold text-white transition hover:bg-charcoal-primary"
        >
          열기
        </Link>
      </div>
    </article>
  );

  return (
    <section
      id="portal-documents-section"
      className={cn(
        "w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_#f2f0ed] sm:max-w-none",
        isDrawerMode ? "space-y-4" : "space-y-5 sm:p-6",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[11px] font-bold text-ember-orange">
            개인자료 큐레이션
          </span>
          <h3 className="mt-3 text-xl font-semibold text-charcoal-primary">오늘 확인할 공개자료</h3>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-graphite">
            전체 자료를 모두 펼치지 않고, 중요 표시 또는 최근 등록된 미열람 자료만 먼저 보여줍니다. 필요한 문서는 보관한 문서에서 다시 볼 수 있습니다.
          </p>
        </div>

      </div>

      <div className="flex flex-wrap gap-2 border-b border-stone-surface pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("recommended")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            activeTab === "recommended"
              ? "bg-midnight text-white"
              : "bg-parchment-card text-graphite hover:bg-stone-surface",
          )}
        >
          추천자료 {recommendedDocs.length}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            activeTab === "saved"
              ? "bg-midnight text-white"
              : "bg-parchment-card text-graphite hover:bg-stone-surface",
          )}
        >
          보관한 문서 {savedDocs.length}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            activeTab === "content"
              ? "bg-midnight text-white"
              : "bg-parchment-card text-graphite hover:bg-stone-surface",
          )}
        >
          보관한 게시글 {contentBookmarks.length}
        </button>
      </div>

      <p
        aria-live="polite"
        className="rounded-xl bg-parchment-card px-4 py-3 text-xs leading-5 text-graphite"
      >
        {TAB_GUIDANCE[activeTab]}
      </p>

      {activeTab === "content" ? (
        contentBookmarks.length === 0 ? (
          <div className="rounded-2xl bg-parchment-card px-5 py-10 text-center text-sm text-graphite">
            <p className="font-bold text-charcoal-primary">아직 보관한 게시글이 없습니다.</p>
            <p className="mt-2 text-xs leading-5 text-graphite/75">
              공지사항, 조합뉴스, 자유게시판에서 보관 버튼을 누르면 이곳에 모입니다.
            </p>
          </div>
        ) : (
          <div aria-label="보관한 게시글 목록" className="grid gap-3">
            {contentBookmarks.map((item) => renderContentCard(item))}
          </div>
        )
      ) : activeDocs.length === 0 ? (
        <div className="rounded-2xl bg-parchment-card px-5 py-10 text-center text-sm text-graphite">
          <p className="font-bold text-charcoal-primary">
            {activeTab === "recommended"
              ? "새로 확인할 중요/최근 자료가 없습니다."
              : "아직 보관한 자료가 없습니다."}
          </p>
          <p className="mt-2 text-xs leading-5 text-graphite/75">
            {activeTab === "recommended"
              ? "이미 열람한 자료는 추천 목록에서 제외되며, 전체 자료는 공개자료실에서 검색할 수 있습니다."
              : "추천자료에서 보관 버튼을 누르면 이곳에 개인적으로 저장됩니다."}
          </p>
        </div>
      ) : (
        <div
          aria-label={activeTab === "recommended" ? "추천자료 목록" : "보관한 문서 목록"}
          className="grid gap-3"
        >
          {activeDocs.map((doc) => renderCard(doc))}
        </div>
      )}

      {role.toUpperCase() !== "ADMIN" && (
        <p className="text-[11px] leading-5 text-ash">
          보관함은 개인 편의를 위한 표시이며, 문서의 공식 공개 상태나 열람 감사 로그에는 영향을 주지 않습니다.
        </p>
      )}
    </section>
  );
}
