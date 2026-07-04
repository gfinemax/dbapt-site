"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, FolderOpen, LockKeyhole, Pencil, Search, Trash2, X } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import {
  featuredLibraryItemIds,
  libraryCategories,
  libraryItems,
  type LibraryAccess,
  type LibrarySourceKind,
} from "@/content/library";
import { DocumentBookmarkButton } from "@/components/portal/document-bookmark-button";
import { type Document } from "@/components/portal/document-table";
import { PdfViewerModal } from "@/components/portal/pdf-viewer-modal";
import { cn } from "@/lib/utils";
import { getPdfRelatedDocument } from "@/lib/document-relations";
import { getSearchQueryTerms, searchTextMatchesQuery } from "@/lib/search-normalization";

const accessLabel: Record<LibraryAccess, string> = {
  public: "공개",
  member: "조합원 전용",
  pending: "준비중",
};

const accessClassName: Record<LibraryAccess, string> = {
  public: "bg-meadow-green/10 text-meadow-green",
  member: "bg-ember-orange/10 text-ember-orange",
  pending: "bg-stone-surface text-graphite",
};

const sourceKindLabel: Record<LibrarySourceKind, string> = {
  disclosure: "의무공개 자료",
  "library-reference": "자료실 참고",
  "site-reference": "사이트 참고",
  news: "소통마당",
};

const sourceKindClassName: Record<LibrarySourceKind, string> = {
  disclosure: "bg-sky-blue/10 text-sky-blue",
  "library-reference": "bg-stone-surface/70 text-graphite",
  "site-reference": "bg-sunburst-yellow/15 text-charcoal-primary",
  news: "bg-ember-orange/10 text-ember-orange",
};

const sourceKindActionLabel: Record<LibrarySourceKind, string> = {
  disclosure: "자료 위치 보기",
  "library-reference": "자료실에서 보기",
  "site-reference": "관련 페이지 보기",
  news: "소통마당 보기",
};

const sourceKindLocationPrefix: Record<LibrarySourceKind, string> = {
  disclosure: "원본 위치",
  "library-reference": "자료 위치",
  "site-reference": "자료 위치",
  news: "자료 위치",
};

type LibraryClientProps = {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  documents?: Document[];
  initialCategory?: string;
  initialSearch?: string;
};

const EMPTY_DOCUMENTS: Document[] = [];

function getValidLibraryCategory(category?: string) {
  if (!category) return "all";
  return libraryCategories.some((item) => item.id === category) ? category : "all";
}

function getLibrarySearchText(item: (typeof libraryItems)[number]) {
  const categoryLabel = libraryCategories.find((category) => category.id === item.category)?.label || "";
  return [
    item.title,
    item.description,
    item.source,
    item.updatedAt,
    categoryLabel,
    sourceKindLabel[item.sourceKind],
  ].join(" ");
}

export function LibraryClient({
  isLoggedIn = false,
  isAdmin = false,
  documents = EMPTY_DOCUMENTS,
  initialCategory,
  initialSearch = "",
}: LibraryClientProps) {
  const [activeCategory, setActiveCategory] = useState(getValidLibraryCategory(initialCategory));
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch.trim());
  const [activeMaterial, setActiveMaterial] = useState<(typeof libraryItems)[number] | null>(null);
  const [managedDocuments, setManagedDocuments] = useState<Document[]>(documents);

  const filteredItems = useMemo(() => {
    const categoryItems =
      activeCategory === "all"
        ? libraryItems
        : libraryItems.filter((item) => item.category === activeCategory);
    const queryTerms = getSearchQueryTerms(searchQuery);

    if (queryTerms.length === 0) return categoryItems;
    return categoryItems.filter((item) =>
      searchTextMatchesQuery(getLibrarySearchText(item), searchQuery),
    );
  }, [activeCategory, searchQuery]);

  const featuredItems = libraryItems.filter((item) =>
    featuredLibraryItemIds.includes(item.id as (typeof featuredLibraryItemIds)[number]),
  );

  useEffect(() => {
    document.body.style.overflow = activeMaterial ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMaterial]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-warm-canvas">
      <section className="border-b border-stone-surface bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 py-20 text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-blue">
            Library Index
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-charcoal-primary sm:text-5xl">
            자료실
          </h1>
          <p className="mx-auto mt-6 max-w-[22rem] text-base leading-relaxed text-graphite/90 sm:max-w-2xl sm:text-lg">
            조합 운영, 사업 진행, 총회, 계약, 법령, 서식 자료를 한곳에서 찾을 수 있도록 정리했습니다.
          </p>
        </div>
      </section>

      <main className="site-container max-w-5xl px-4 py-16 sm:py-24">
        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="stone-card rounded-2xl border border-stone-surface bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-midnight text-white">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ember-orange">
                  전체 자료 통합 색인
                </p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-charcoal-primary sm:text-3xl">
                  메뉴가 달라도 자료는 한곳에서 찾습니다
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-graphite">
                  조합규약, 의사록, 계약서처럼 공개자료 메뉴에 있는 문서도 자료실에서 함께 안내합니다.
                  권한이 필요한 자료는 제목과 위치만 보여주고 실제 열람은 로그인 후 진행합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="soft-panel rounded-2xl border border-stone-surface/70 bg-[#f8f7f4] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-blue">
              Access Guide
            </p>
            <ul className="mt-5 space-y-3 text-sm text-graphite">
              <li className="flex gap-3">
                <span className="mt-1 size-2 rounded-full bg-meadow-green" />
                <span><strong className="text-charcoal-primary">공개</strong> 자료는 누구나 위치를 확인할 수 있습니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 size-2 rounded-full bg-ember-orange" />
                <span><strong className="text-charcoal-primary">조합원 전용</strong> 자료는 로그인 후 권한에 따라 열람합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 size-2 rounded-full bg-ash" />
                <span><strong className="text-charcoal-primary">준비중</strong> 자료는 확정 후 순차 등재합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 size-2 rounded-full bg-sky-blue" />
                <span><strong className="text-charcoal-primary">의무공개 자료</strong>와 <strong className="text-charcoal-primary">자료실 참고</strong>를 배지로 구분합니다.</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="featured" className="mt-16 sm:mt-24">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ember-orange">
                Frequently Used
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-charcoal-primary">
                자주 찾는 자료
              </h2>
            </div>
            <p className="text-sm text-graphite">
              중복 메뉴에 있어도 자료실에서 다시 찾을 수 있습니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <LibraryCard
                key={item.id}
                item={item}
                compact
                isLoggedIn={isLoggedIn}
                onOpenMaterial={setActiveMaterial}
              />
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-ember-orange">
              All Materials
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-charcoal-primary">
              전체 자료 목록
            </h2>
          </div>

          <form
            aria-label="자료 검색"
            onSubmit={handleSearchSubmit}
            className="mb-5 rounded-2xl border border-stone-surface bg-white p-4 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-5"
          >
            <label htmlFor="library-search" className="text-sm font-bold text-charcoal-primary">
              자료 찾기
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ash" aria-hidden="true" />
                <input
                  id="library-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="예: 2022-291, 결정고시, 지구단위계획"
                  className="h-12 w-full rounded-full border border-stone-surface bg-parchment-card pl-11 pr-4 text-sm text-charcoal-primary outline-none transition placeholder:text-ash focus:border-ember-orange focus:bg-white focus:ring-2 focus:ring-ember-orange/15"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-midnight px-5 text-sm font-bold text-white transition hover:bg-charcoal-primary cursor-pointer"
              >
                <Search className="size-4" aria-hidden="true" />
                찾기
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-stone-surface px-4 text-xs font-bold text-graphite transition hover:bg-white cursor-pointer"
                >
                  초기화
                </button>
              )}
            </div>
          </form>

          {searchQuery && (
            <p className="mb-5 rounded-2xl bg-parchment-card px-4 py-3 text-sm text-graphite">
              검색어 <strong className="text-charcoal-primary">{searchQuery}</strong> 기준으로 <strong className="text-charcoal-primary">{filteredItems.length}건</strong>의 자료를 찾았습니다.
            </p>
          )}

          <nav aria-label="자료실 분류" className="mb-6 overflow-x-auto">
            <div className="flex min-w-max gap-2 pb-1">
              {libraryCategories.map((category) => (
                <button
                  key={category.id}
                  id={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer",
                    activeCategory === category.id
                      ? "bg-midnight text-white"
                      : "bg-white text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] hover:text-charcoal-primary",
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  isLoggedIn={isLoggedIn}
                  onOpenMaterial={setActiveMaterial}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-stone-surface bg-white p-6 text-sm text-graphite">
                검색 조건에 맞는 자료가 없습니다. 다른 검색어를 입력하거나 분류를 전체로 변경해 주세요.
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      {activeMaterial && (
        <LibraryMaterialPanel
          item={activeMaterial}
          documents={managedDocuments}
          isAdmin={isAdmin}
          onDocumentUpdated={(document) => {
            setManagedDocuments((prev) => prev.map((item) => item.id === document.id ? document : item));
          }}
          onDocumentDeleted={(id) => {
            setManagedDocuments((prev) => prev.filter((document) => document.id !== id));
          }}
          onClose={() => setActiveMaterial(null)}
        />
      )}
    </div>
  );
}

function LibraryCard({
  item,
  compact = false,
  isLoggedIn = false,
  onOpenMaterial,
}: {
  item: (typeof libraryItems)[number];
  compact?: boolean;
  isLoggedIn?: boolean;
  onOpenMaterial: (item: (typeof libraryItems)[number]) => void;
}) {
  const isMemberOnly = item.access === "member";
  const isPending = item.access === "pending";
  const opensInsideLibrary = item.sourceKind === "library-reference" && !isPending;
  const actionLabel = item.actionLabel ?? sourceKindActionLabel[item.sourceKind];
  const locationPrefix = sourceKindLocationPrefix[item.sourceKind];

  return (
    <article
      data-testid={`library-item-${item.id}`}
      className={cn(
        "stone-card rounded-2xl border border-stone-surface bg-white p-5",
        compact ? "min-h-58" : "grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center",
      )}
    >
      <div className="flex gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f8f7f4] text-charcoal-primary">
          {isMemberOnly ? <LockKeyhole className="size-4" aria-hidden="true" /> : <FileText className="size-4" aria-hidden="true" />}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", accessClassName[item.access])}>
              {accessLabel[item.access]}
            </span>
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", sourceKindClassName[item.sourceKind])}>
              {sourceKindLabel[item.sourceKind]}
            </span>
            <span className="rounded-full bg-stone-surface/70 px-2.5 py-1 text-[10px] font-bold text-graphite">
              {libraryCategories.find((category) => category.id === item.category)?.label}
            </span>
          </div>
          <h3 className="mt-3 text-base font-extrabold tracking-tight text-charcoal-primary">
            {item.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-graphite">
            {item.description}
          </p>
          <p className="mt-3 text-[11px] font-semibold text-ash">
            {locationPrefix}: {item.source} · 업데이트: {item.updatedAt}
          </p>
        </div>
      </div>

      <div className={cn("mt-5 flex shrink-0", !compact && "sm:mt-0 sm:justify-end")}>
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-surface px-4 py-2 text-xs font-bold text-graphite">
            <FolderOpen className="size-3.5" aria-hidden="true" />
            준비중
          </span>
        ) : opensInsideLibrary ? (
          <button
            type="button"
            onClick={() => onOpenMaterial(item)}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-surface px-4 py-2 text-xs font-bold text-charcoal-primary transition hover:bg-white cursor-pointer"
          >
            {actionLabel}
          </button>
        ) : (
          isMemberOnly && isLoggedIn ? (
            <button
              type="button"
              onClick={() => onOpenMaterial(item)}
              className="inline-flex items-center gap-1.5 rounded-full bg-midnight px-4 py-2 text-xs font-bold text-white transition hover:bg-charcoal-primary cursor-pointer"
            >
              자료 확인
            </button>
          ) : (
            <Link
              href={isMemberOnly ? "/login" : item.sourceHref}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition",
                isMemberOnly
                  ? "bg-midnight text-white hover:bg-charcoal-primary"
                  : "bg-stone-surface text-charcoal-primary hover:bg-white",
              )}
            >
              {isMemberOnly ? "로그인 후 확인" : actionLabel}
            </Link>
          )
        )}
      </div>
    </article>
  );
}

type MaterialEntry = {
  title: string;
  description: string;
  meta: string;
  isReal?: boolean;
  document?: Document;
  actionLabel?: string;
  actionHref?: string;
  actionExternal?: boolean;
};

const fallbackMaterialEntries: Record<string, MaterialEntry[]> = {
  "cooperative-rules": [
    {
      title: "조합규약 및 정관",
      description: "총회·이사회 의결 절차, 조합원 권리와 의무를 확인하는 핵심 운영 문서입니다.",
      meta: "공개자료 · 규약",
    },
    {
      title: "정식 조합원 연명부",
      description: "설립인가 기준 조합원 명부 위치를 확인하기 위한 보호 색인입니다.",
      meta: "공개자료 · 연명부",
    },
  ],
  "assembly-book": [
    {
      title: "총회 책자",
      description: "총회 안건, 의결 설명, 참석 안내를 묶어 확인하는 조합원 안내 자료입니다.",
      meta: "소통마당 · 총회 개최 시",
    },
    {
      title: "총회 참석 안내문",
      description: "참석 방식, 위임장 제출, 의결권 행사 절차를 안내하는 자료입니다.",
      meta: "소통마당 · 안내문",
    },
  ],
  "meeting-minutes": [
    {
      title: "창립총회 의사록",
      description: "창립총회 의결 결과와 조합 설립 초기 결의 사항을 확인하는 의사록입니다.",
      meta: "의사록 리스트 · 총회",
    },
    {
      title: "정기총회 의사록",
      description: "결산, 예산, 규약 변경 등 정기총회 주요 결의 내용을 확인합니다.",
      meta: "의사록 리스트 · 총회",
    },
    {
      title: "이사회 의사록",
      description: "계약 심의, 예산 집행, 사업 추진 현황 등 이사회 의결 기록입니다.",
      meta: "의사록 리스트 · 이사회",
    },
  ],
  "service-contracts": [
    {
      title: "설계·용역 계약서",
      description: "설계, 행정, 법률, 용역 계약 관련 원본 위치를 확인합니다.",
      meta: "공개자료 · 계약",
    },
    {
      title: "협력사 업무협약서",
      description: "사업 추진 과정의 협약 및 변경 자료 색인입니다.",
      meta: "공개자료 · 협약",
    },
  ],
  "audit-report": [
    {
      title: "회계감사보고서",
      description: "정기 외부회계감사 보고서 및 자금 집행 확인 자료의 열람 위치를 안내합니다.",
      meta: "공개자료 · 회계감사",
    },
    {
      title: "월별 자금 입출금 명세서",
      description: "신탁사 에스크로 계좌를 통한 월별 자금 입출금 내역을 확인하는 보호 자료입니다.",
      meta: "공개자료 · 회계",
    },
  ],
  "housing-law": [
    {
      title: "국가법령정보센터",
      description: "주택법 현행 법령 원문과 개정 연혁은 법제처 국가법령정보센터에서 확인합니다.",
      meta: "공식 법령 · 주택법",
      actionLabel: "주택법 원문 보기",
      actionHref: "https://www.law.go.kr/LSW/lsInfoP.do?lsId=001809",
      actionExternal: true,
    },
    {
      title: "법령·제도 참고 방식",
      description: "법령 자료는 조합이 파일을 다시 올리기보다 공식 원문 위치를 안내해 최신성을 유지합니다.",
      meta: "자료실 참고 · 외부 공식 출처",
    },
  ],
  "district-plan-notice-2022": [
    {
      title: "서울특별시 고시 제2022-291호",
      description: "대방동 11-103번지 일대 도시관리계획(지구단위계획) 결정 및 지형도면 고시 원문을 보관할 공개자료 위치입니다.",
      meta: "공개자료 · 인허가·고시자료 · 2022.06.30",
    },
  ],
};

const disclosureUploadHrefByItemId: Record<string, string> = {
  "cooperative-rules": "/disclosure?tab=rules",
  "meeting-minutes": "/disclosure?tab=meetings",
  "service-contracts": "/disclosure?tab=operations",
  "audit-report": "/disclosure?tab=accounting",
};

function formatDate(value?: string | null) {
  if (!value) return "날짜 미상";
  return value.slice(0, 10).replace(/-/g, ".");
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function getRealMaterialEntries(itemId: string, documents: Document[]): MaterialEntry[] {
  const matcher = (doc: Document) => {
    const text = `${doc.title} ${doc.description ?? ""} ${doc.category} ${doc.subCategory ?? ""}`;

    switch (itemId) {
      case "cooperative-rules":
        return /규약|정관|연명부/.test(text);
      case "assembly-book":
        return /총회.*(책자|안내|안건|참석)|참석 안내/.test(text);
      case "meeting-minutes":
        return /회의록|의사록/.test(text);
      case "service-contracts":
        return /계약|협약|용역/.test(text);
      case "audit-report":
        return doc.category === "ACCOUNTING" || /회계|감사|자금|분담금/.test(text);
      case "district-plan-notice-2022":
        return /서울특별시 고시 제2022-291호|2022-291|지구단위계획|지형도면|결정고시|인허가|고시/.test(text);
      default:
        return false;
    }
  };

  return documents
    .filter(matcher)
    .map((doc) => ({
      title: doc.title,
      description: doc.description || "등록된 조합원 전용 문서입니다.",
      meta: `${doc.subCategory || doc.category} · ${formatDate(doc.documentDate || doc.publishedAt || doc.createdAt)}`,
      isReal: true,
      document: doc,
    }));
}

function LibraryMaterialPanel({
  item,
  documents,
  isAdmin,
  onDocumentUpdated,
  onDocumentDeleted,
  onClose,
}: {
  item: (typeof libraryItems)[number];
  documents: Document[];
  isAdmin: boolean;
  onDocumentUpdated: (document: Document) => void;
  onDocumentDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const [activeViewDocument, setActiveViewDocument] = useState<Document | null>(null);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const activeViewDocumentRelation = activeViewDocument ? getPdfRelatedDocument(activeViewDocument, documents) : null;
  const realEntries = getRealMaterialEntries(item.id, documents);
  const disclosureUploadHref = disclosureUploadHrefByItemId[item.id];
  const isPublicReference = item.access === "public";
  const materialPanelDescription = isPublicReference
    ? "자료실 안에서 바로 확인하는 공개 참고 색인입니다."
    : "자료실 안에서 바로 확인하는 조합원 전용 색인입니다.";
  const fallbackEntries = fallbackMaterialEntries[item.id] || [
    {
      title: item.title,
      description: item.description,
      meta: `${item.source} · ${item.updatedAt}`,
    },
  ];
  const entries = realEntries.length > 0 ? realEntries : fallbackEntries;
  const filteredEntries = useMemo(() => {
    const terms = getSearchQueryTerms(materialSearchQuery);
    if (terms.length === 0) return entries;
    return entries.filter((entry) =>
      searchTextMatchesQuery(
        [entry.title, entry.description, entry.meta, entry.document?.subCategory, entry.document?.category].filter(Boolean).join(" "),
        materialSearchQuery,
      ),
    );
  }, [entries, materialSearchQuery]);
  const listLabel =
    item.id === "meeting-minutes"
      ? "의사록 리스트"
      : item.id === "district-plan-notice-2022"
        ? "인허가·고시자료 리스트"
        : `${item.title} 리스트`;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="자료 목록 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-midnight/35 backdrop-blur-xs cursor-default"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} 자료 목록`}
        className="absolute inset-y-0 left-0 flex w-full max-w-6xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 shadow-2xl sm:p-10"
        style={{ maxWidth: "68rem" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-surface pb-9">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-midnight text-sunburst-yellow">
              <FolderOpen className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold tracking-tight text-charcoal-primary">
                {item.title} 문서함
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                {materialPanelDescription}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-stone-surface bg-white px-5 text-sm font-bold text-graphite transition hover:bg-stone-surface cursor-pointer"
            aria-label="닫기"
          >
            <X className="size-4" aria-hidden="true" />
            닫기
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-10 inline-flex h-12 w-fit items-center gap-2 rounded-full border border-stone-surface bg-white px-6 text-sm font-extrabold text-graphite shadow-sm transition hover:bg-stone-surface"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          폴더 카드로 보기
        </button>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="inline-flex min-h-12 items-center justify-between rounded-2xl border border-stone-surface bg-white px-4 text-sm font-extrabold text-charcoal-primary shadow-sm lg:w-64">
            <span className="sr-only">{listLabel}</span>
            <span className="truncate">{item.title}</span>
            <span className={cn("ml-3 rounded-full px-2.5 py-1 text-[10px] font-bold", accessClassName[item.access])}>
              {accessLabel[item.access]}
            </span>
          </div>
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">문서 제목 검색</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ash" aria-hidden="true" />
            <input
              type="search"
              aria-label="문서 제목 검색"
              value={materialSearchQuery}
              onChange={(event) => setMaterialSearchQuery(event.target.value)}
              placeholder="문서 제목 검색..."
              className="h-12 w-full rounded-2xl border border-stone-surface bg-white pl-11 pr-4 text-sm font-semibold text-charcoal-primary shadow-sm outline-none transition placeholder:text-ash focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
            />
          </label>
          {isAdmin && disclosureUploadHref && (
            <Link
              href={disclosureUploadHref}
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-midnight px-5 text-sm font-extrabold text-white transition hover:bg-charcoal-primary"
            >
              공개자료에서 신규 등록
            </Link>
          )}
          <span className="shrink-0 text-sm font-semibold text-graphite lg:pl-2">
            총 {filteredEntries.length}건
          </span>
        </div>

        <MaterialEntryTable
          item={item}
          entries={filteredEntries}
          isAdmin={isAdmin}
          onOpenDocument={(document) => setActiveViewDocument(document)}
          onUpdateDocument={onDocumentUpdated}
          onDeleteDocument={onDocumentDeleted}
        />

        {activeViewDocument && (
          <PdfViewerModal
            documentId={activeViewDocument.id}
            documentTitle={activeViewDocument.title}
            fileName={activeViewDocument.fileName}
            onClose={() => {
              setActiveViewDocument(null);
              requestAnimationFrame(() => {
                document.body.style.overflow = "hidden";
              });
            }}
            documentDate={activeViewDocument.documentDate}
            createdAt={activeViewDocument.createdAt}
            publishedAt={activeViewDocument.publishedAt || undefined}
            fileSize={activeViewDocument.fileSize}
            category={activeViewDocument.category}
            subCategory={activeViewDocument.subCategory}
            description={activeViewDocument.description}
            attachments={activeViewDocument.attachments}
            relatedDocument={activeViewDocumentRelation?.document}
            relatedDocumentLabel={activeViewDocumentRelation?.label}
          />
        )}
      </aside>
    </div>
  );
}

function getMaterialEntryDateLabel(entry: MaterialEntry) {
  const document = entry.document;
  if (document) {
    return formatDate(document.documentDate || document.publishedAt || document.createdAt);
  }
  const dateMatch = entry.meta.match(/\d{4}\.\d{2}\.\d{2}/);
  return dateMatch?.[0] || "-";
}

function getMaterialEntryCategoryLabel(entry: MaterialEntry) {
  if (entry.document) {
    return entry.document.subCategory || entry.document.category;
  }
  return entry.meta.split("·")[0]?.trim() || "자료실";
}

function MaterialEntryTable({
  item,
  entries,
  isAdmin,
  onOpenDocument,
  onUpdateDocument,
  onDeleteDocument,
}: {
  item: (typeof libraryItems)[number];
  entries: MaterialEntry[];
  isAdmin: boolean;
  onOpenDocument: (document: Document) => void;
  onUpdateDocument: (document: Document) => void;
  onDeleteDocument: (id: string) => void;
}) {
  return (
    <section
      role="table"
      aria-label={`${item.title} 자료 테이블`}
      className="mt-6 overflow-x-auto rounded-2xl border border-stone-surface bg-white shadow-sm"
    >
      <div
        role="row"
        className="grid border-b border-sky-blue/15 bg-sky-blue/5 text-xs font-bold text-charcoal-primary"
        style={{ minWidth: "48rem", gridTemplateColumns: "7rem minmax(0, 1fr) 6rem 7rem 6rem" }}
      >
        <span role="columnheader" className="px-4 py-3.5 text-center">
          발생일
        </span>
        <span role="columnheader" className="px-4 py-3.5">
          문서 제목
        </span>
        <span role="columnheader" className="px-3 py-3.5 text-center">
          회신기한
        </span>
        <span role="columnheader" className="px-3 py-3.5 text-center">
          보관
        </span>
        <span role="columnheader" className="px-3 py-3.5 text-center">
          관리
        </span>
      </div>
      <div role="rowgroup" className="divide-y divide-stone-surface/60">
        {entries.map((entry, index) => (
          <MaterialEntryRow
            key={`${entry.title}-${index}`}
            entry={entry}
            isAdmin={isAdmin}
            onOpenDocument={onOpenDocument}
            onUpdateDocument={onUpdateDocument}
            onDeleteDocument={onDeleteDocument}
          />
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-stone-surface bg-[#fdfcfa] px-5 py-4 text-xs font-semibold text-graphite">
        <span>
          {entries.length > 0 ? `1-${entries.length}` : "0-0"} / {entries.length}건
        </span>
        <div className="flex items-center gap-2" aria-label="자료 목록 페이지">
          <button
            type="button"
            disabled
            className="flex size-9 items-center justify-center rounded-full bg-white text-sm font-bold text-ash shadow-[inset_0_0_0_1px_var(--stone-surface)] disabled:opacity-60"
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          <span className="flex size-9 items-center justify-center rounded-full bg-charcoal-primary text-sm font-extrabold text-white">
            1
          </span>
          <button
            type="button"
            disabled
            className="flex size-9 items-center justify-center rounded-full bg-white text-sm font-bold text-ash shadow-[inset_0_0_0_1px_var(--stone-surface)] disabled:opacity-60"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}

function MaterialEntryRow({
  entry,
  isAdmin,
  onOpenDocument,
  onUpdateDocument,
  onDeleteDocument,
}: {
  entry: MaterialEntry;
  isAdmin: boolean;
  onOpenDocument: (document: Document) => void;
  onUpdateDocument: (document: Document) => void;
  onDeleteDocument: (id: string) => void;
}) {
  const document = entry.document;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(entry.title);
  const [draftDescription, setDraftDescription] = useState(entry.description);
  const [draftCategory, setDraftCategory] = useState(document?.category || "DISCLOSURE");
  const [draftSubCategory, setDraftSubCategory] = useState(document?.subCategory || "");
  const [draftDocumentDate, setDraftDocumentDate] = useState(toDateInputValue(document?.documentDate || document?.createdAt));
  const [draftPublishedAt, setDraftPublishedAt] = useState(toDateInputValue(document?.publishedAt || document?.createdAt));
  const [draftIsStarred, setDraftIsStarred] = useState(!!document?.isStarred);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!document) return;

    setIsSaving(true);
    try {
      const body = {
        title: draftTitle,
        description: draftDescription,
        category: draftCategory,
        subCategory: draftSubCategory,
        documentDate: draftDocumentDate,
        publishedAt: draftPublishedAt,
        isStarred: draftIsStarred,
      };
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "문서 수정에 실패했습니다.");
        return;
      }
      onUpdateDocument(data.document as Document);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("문서 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!document) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "문서 삭제에 실패했습니다.");
        return;
      }
      setIsDeleteModalOpen(false);
      onDeleteDocument(document.id);
    } catch (error) {
      console.error(error);
      alert("문서 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (document) {
    return (
      <div
        role="row"
        aria-label={`${entry.title} 관리`}
        className="grid items-center px-4 py-5 transition hover:bg-sky-blue/[0.04]"
        style={{ minWidth: "48rem", gridTemplateColumns: "7rem minmax(0, 1fr) 6rem 7rem 6rem" }}
      >
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 md:col-span-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-[10px] font-bold text-charcoal-primary">
                문서 제목
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs font-medium text-charcoal-primary outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                  required
                />
              </label>
              <label className="space-y-1 text-[10px] font-bold text-charcoal-primary">
                문서함 분류
                <select
                  value={draftCategory}
                  onChange={(event) => setDraftCategory(event.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs font-medium text-charcoal-primary outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                >
                  <option value="DISCLOSURE">공개자료</option>
                  <option value="ACCOUNTING">회계자료</option>
                  <option value="NOTICE">조합원 공지</option>
                </select>
              </label>
            </div>
            <label className="block space-y-1 text-[10px] font-bold text-charcoal-primary">
              문서 설명
              <textarea
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs leading-relaxed text-charcoal-primary outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-[10px] font-bold text-charcoal-primary">
                세부 분류
                <input
                  value={draftSubCategory}
                  onChange={(event) => setDraftSubCategory(event.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs font-medium text-charcoal-primary outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                />
              </label>
              <label className="space-y-1 text-[10px] font-bold text-charcoal-primary">
                문서 발생일
                <input
                  type="date"
                  value={draftDocumentDate}
                  onChange={(event) => setDraftDocumentDate(event.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs font-medium text-charcoal-primary outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                  required
                />
              </label>
              <label className="space-y-1 text-[10px] font-bold text-charcoal-primary">
                공개 등록일
                <input
                  type="date"
                  value={draftPublishedAt}
                  onChange={(event) => setDraftPublishedAt(event.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs font-medium text-charcoal-primary outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                  required
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-surface pt-3">
              <label className="flex items-center gap-2 text-[11px] font-bold text-graphite">
                <input
                  type="checkbox"
                  checked={draftIsStarred}
                  onChange={(event) => setDraftIsStarred(event.target.checked)}
                  className="size-4 rounded border-stone-surface text-midnight focus:ring-sky-blue/30"
                />
                중요 문서
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-midnight px-3 py-1.5 text-[11px] font-bold text-white hover:bg-charcoal-primary disabled:opacity-50"
                >
                  {isSaving ? "저장 중" : "저장"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div role="cell" className="text-center text-sm">
              <span className="hidden text-xs font-bold text-ash">발생일</span>
              <span className="font-mono text-xs font-semibold text-graphite">
                {getMaterialEntryDateLabel(entry)}
              </span>
            </div>
            <div role="cell" className="min-w-0">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-2xl leading-none text-charcoal-primary/80" aria-hidden="true">
                  {document.isStarred ? "★" : "☆"}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="sr-only">실제 업로드</span>
                  <span className="sr-only">{getMaterialEntryCategoryLabel(entry)}</span>
                  <span className="sr-only">{entry.meta}</span>
                  <p className="truncate text-sm font-extrabold leading-snug text-charcoal-primary">
                    {entry.title}
                  </p>
                </div>
              </div>
            </div>
            <div role="cell" className="text-center text-sm">
              <span className="hidden text-xs font-bold text-ash">회신기한</span>
              <span className="font-mono text-xs font-semibold text-ash">-</span>
            </div>
            <div role="cell" className="flex items-center justify-center">
              <span className="hidden text-xs font-bold text-ash">보관</span>
              <DocumentBookmarkButton document={document} includeDocumentTitleInLabel />
            </div>
            <div role="cell" className="flex items-center justify-center gap-2">
              <button
                type="button"
                aria-label="자료 열람"
                onClick={() => onOpenDocument(document)}
                className="inline-flex size-8 items-center justify-center rounded-full bg-midnight text-white transition hover:bg-charcoal-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue/35"
              >
                <FileText className="size-3.5" aria-hidden="true" />
              </button>
              {isAdmin && (
                <>
                <button
                  type="button"
                  aria-label="수정"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-stone-surface bg-white text-graphite hover:bg-stone-surface"
                >
                  <Pencil className="size-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="삭제"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-ember-orange/20 bg-ember-orange/10 text-ember-orange hover:bg-ember-orange/15 disabled:opacity-50"
                >
                  <Trash2 className="size-3" aria-hidden="true" />
                </button>
                </>
              )}
            </div>
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200">
                <button
                  type="button"
                  aria-label="삭제 확인 닫기"
                  onClick={() => {
                    if (!isDeleting) setIsDeleteModalOpen(false);
                  }}
                  className="absolute inset-0 cursor-default"
                />
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${entry.title} 삭제 확인`}
                  className="relative w-full max-w-md rounded-2xl border border-stone-surface bg-warm-canvas p-6 text-left shadow-2xl animate-in zoom-in-95 duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-orange/10 text-ember-orange">
                      <Trash2 className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-charcoal-primary">
                        문서를 삭제할까요?
                      </h3>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-charcoal-primary">
                        {entry.title}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-graphite">
                        삭제된 문서와 첨부파일은 복구할 수 없습니다.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      disabled={isDeleting}
                      className="rounded-full border border-stone-surface bg-white px-4 py-2 text-xs font-bold text-graphite hover:bg-stone-surface disabled:opacity-60"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="rounded-full bg-midnight px-5 py-2 text-xs font-bold text-white hover:bg-charcoal-primary disabled:opacity-60"
                    >
                      {isDeleting ? "삭제 중..." : "영구 삭제"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      role="row"
      aria-label={`${entry.title} 관리`}
      className="grid items-center px-4 py-5 transition hover:bg-sky-blue/[0.04]"
      style={{ minWidth: "48rem", gridTemplateColumns: "7rem minmax(0, 1fr) 6rem 7rem 6rem" }}
    >
      <div role="cell" className="text-center text-sm">
        <span className="hidden text-xs font-bold text-ash">발생일</span>
        <span className="font-mono text-xs font-semibold text-graphite">
          {getMaterialEntryDateLabel(entry)}
        </span>
      </div>
      <div role="cell" className="min-w-0">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-2xl leading-none text-charcoal-primary/80" aria-hidden="true">
            ☆
          </span>
          <div className="min-w-0 flex-1">
            <span className="sr-only">{entry.isReal ? "실제 업로드" : "자료실 색인"}</span>
            <span className="sr-only">{entry.meta}</span>
            <p className="truncate text-sm font-extrabold leading-snug text-charcoal-primary">
              {entry.title}
            </p>
          </div>
        </div>
      </div>
      <div role="cell" className="text-center text-sm">
        <span className="hidden text-xs font-bold text-ash">회신기한</span>
        <span className="font-mono text-xs font-semibold text-ash">-</span>
      </div>
      <div role="cell" className="text-center text-sm">
        <span className="hidden text-xs font-bold text-ash">보관</span>
        <span className="text-[11px] font-semibold text-ash">-</span>
      </div>
      <div role="cell" className="flex items-center justify-center gap-2">
        {entry.actionHref && entry.actionLabel ? (
          <Link
            href={entry.actionHref}
            target={entry.actionExternal ? "_blank" : undefined}
            rel={entry.actionExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center rounded-full bg-midnight px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-charcoal-primary"
          >
            {entry.actionLabel}
          </Link>
        ) : (
          <span className="text-[11px] font-semibold text-ash">-</span>
        )}
      </div>
    </div>
  );
}
