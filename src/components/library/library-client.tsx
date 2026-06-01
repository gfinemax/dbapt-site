"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, LockKeyhole, Search } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import {
  featuredLibraryItemIds,
  libraryCategories,
  libraryItems,
  type LibraryAccess,
} from "@/content/library";
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

export function LibraryClient() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return libraryItems;
    return libraryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const featuredItems = libraryItems.filter((item) =>
    featuredLibraryItemIds.includes(item.id as (typeof featuredLibraryItemIds)[number]),
  );

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
              <LibraryCard key={item.id} item={item} compact />
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
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LibraryCard({ item, compact = false }: { item: (typeof libraryItems)[number]; compact?: boolean }) {
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
        )}
      </div>
    </article>
  );
}
