"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, LockKeyhole, Search, X } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import {
  featuredLibraryItemIds,
  libraryCategories,
  libraryItems,
  type LibraryAccess,
} from "@/content/library";
import { type Document } from "@/components/portal/document-table";
import { PdfViewerModal } from "@/components/portal/pdf-viewer-modal";
import { cn } from "@/lib/utils";

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

type LibraryClientProps = {
  isLoggedIn?: boolean;
  documents?: Document[];
};

export function LibraryClient({ isLoggedIn = false, documents = [] }: LibraryClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMaterial, setActiveMaterial] = useState<(typeof libraryItems)[number] | null>(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return libraryItems;
    return libraryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const featuredItems = libraryItems.filter((item) =>
    featuredLibraryItemIds.includes(item.id as (typeof featuredLibraryItemIds)[number]),
  );

  useEffect(() => {
    document.body.style.overflow = activeMaterial ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMaterial]);

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
                  조합규약, 회의록, 계약서처럼 공개자료 메뉴에 있는 문서도 자료실에서 함께 안내합니다.
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
            {filteredItems.map((item) => (
              <LibraryCard
                key={item.id}
                item={item}
                isLoggedIn={isLoggedIn}
                onOpenMaterial={setActiveMaterial}
              />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

      {activeMaterial && (
        <LibraryMaterialPanel
          item={activeMaterial}
          documents={documents}
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
            원본 위치: {item.source} · 업데이트: {item.updatedAt}
          </p>
        </div>
      </div>

      <div className={cn("mt-5 flex shrink-0", !compact && "sm:mt-0 sm:justify-end")}>
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-surface px-4 py-2 text-xs font-bold text-graphite">
            <FolderOpen className="size-3.5" aria-hidden="true" />
            준비중
          </span>
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
              {isMemberOnly ? "로그인 후 확인" : "자료 위치 보기"}
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
      meta: "조합소식 · 총회 개최 시",
    },
    {
      title: "총회 참석 안내문",
      description: "참석 방식, 위임장 제출, 의결권 행사 절차를 안내하는 자료입니다.",
      meta: "조합소식 · 안내문",
    },
  ],
  "meeting-minutes": [
    {
      title: "창립총회 의사록",
      description: "창립총회 의결 결과와 조합 설립 초기 결의 사항을 확인하는 회의록입니다.",
      meta: "회의록 리스트 · 총회",
    },
    {
      title: "정기총회 의사록",
      description: "결산, 예산, 규약 변경 등 정기총회 주요 결의 내용을 확인합니다.",
      meta: "회의록 리스트 · 총회",
    },
    {
      title: "이사회 회의록",
      description: "계약 심의, 예산 집행, 사업 추진 현황 등 이사회 의결 기록입니다.",
      meta: "회의록 리스트 · 이사회",
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
      description: "외부감사와 내부감사 등 자금 집행 확인 자료의 열람 위치를 안내합니다.",
      meta: "공개자료 · 회계감사",
    },
    {
      title: "자금집행 실적 보고서",
      description: "분기별 자금 집행과 감사 결과를 확인하는 보호 자료입니다.",
      meta: "공개자료 · 회계",
    },
  ],
};

function formatDate(value?: string | null) {
  if (!value) return "날짜 미상";
  return value.slice(0, 10).replace(/-/g, ".");
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
        return doc.category === "ACCOUNTING" || /회계|감사|자금/.test(text);
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
  onClose,
}: {
  item: (typeof libraryItems)[number];
  documents: Document[];
  onClose: () => void;
}) {
  const [activeViewDocument, setActiveViewDocument] = useState<Document | null>(null);
  const realEntries = getRealMaterialEntries(item.id, documents);
  const fallbackEntries = fallbackMaterialEntries[item.id] || [
    {
      title: item.title,
      description: item.description,
      meta: `${item.source} · ${item.updatedAt}`,
    },
  ];
  const entries = [...realEntries, ...fallbackEntries];
  const listLabel = item.id === "meeting-minutes" ? "회의록 리스트" : `${item.title} 리스트`;

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
        className="absolute inset-y-0 left-0 flex w-full max-w-xl flex-col overflow-y-auto border-r border-stone-surface bg-warm-canvas p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-surface pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ember-orange">
              Library Material
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-charcoal-primary">
              {item.title} 자료 목록
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              자료실 안에서 바로 확인하는 조합원 전용 색인입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-stone-surface bg-white text-graphite transition hover:bg-stone-surface cursor-pointer"
            aria-label="닫기"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-stone-surface bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-blue">
                {listLabel}
              </p>
              <h3 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal-primary">
                {entries.length}개 자료
              </h3>
            </div>
            <span className="rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange">
              조합원 전용
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-graphite">
            원본 위치는 {item.source}이지만, 현재 화면은 자료실 페이지 안에서 유지됩니다.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {entries.map((entry, index) => (
            <MaterialEntryCard
              key={`${entry.title}-${index}`}
              entry={entry}
              onOpenDocument={(document) => setActiveViewDocument(document)}
            />
          ))}
        </div>

        {activeViewDocument && (
          <PdfViewerModal
            documentId={activeViewDocument.id}
            documentTitle={activeViewDocument.title}
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
          />
        )}
      </aside>
    </div>
  );
}

function MaterialEntryCard({
  entry,
  onOpenDocument,
}: {
  entry: MaterialEntry;
  onOpenDocument: (document: Document) => void;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8f7f4] text-charcoal-primary">
        <FileText className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-surface/70 px-2 py-0.5 text-[9px] font-bold text-graphite">
            {entry.isReal ? "실제 업로드" : "자료실 색인"}
          </span>
          <span className="text-[10px] font-semibold text-ash">
            {entry.meta}
          </span>
        </div>
        <h4 className="mt-2 text-sm font-bold leading-snug text-charcoal-primary">
          {entry.title}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-graphite">
          {entry.description}
        </p>
      </div>
    </div>
  );

  if (entry.document) {
    return (
      <button
        type="button"
        onClick={() => onOpenDocument(entry.document as Document)}
        className="block w-full rounded-2xl border border-stone-surface bg-white p-4 text-left shadow-sm transition hover:border-ember-orange/50 hover:bg-[#fffdfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue/35 cursor-pointer"
        aria-label={`${entry.title} 상세 열람`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className="rounded-2xl border border-stone-surface bg-white p-4 shadow-sm">
      {content}
    </article>
  );
}
