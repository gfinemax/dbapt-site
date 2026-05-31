"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NoticeBoard } from "./notice-board";
import { FreeBoard } from "./free-board";
import { FaqAccordion } from "./faq-accordion";
import { CoopNewsletter } from "./coop-newsletter";

type NewsClientProps = {
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
  initialNewsList?: any[];
  initialFreePosts?: any[];
  initialFaqs?: any[];
};

type NewsTabId = "notice" | "free" | "faq" | "newsletter";

const menuItems = [
  { id: "notice", label: "공지사항", isSecure: false },
  { id: "free", label: "자유게시판", isSecure: true },
  { id: "faq", label: "FAQ", isSecure: true },
  { id: "newsletter", label: "조합뉴스 (주/월간소식)", isSecure: false },
] as const;

function NewsSectionLockTab({ label, router }: { label: string; router: any }) {
  return (
    <div className="stone-card bg-[#fbfaf9] rounded-3xl p-10 text-center relative overflow-hidden min-h-[360px] flex flex-col justify-center items-center border border-stone-surface">
      {/* 고해상도 정보 보호용 리드미컬하고 세련된 디테일 블러 프레임 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8f7f4]/40 to-[#f8f7f4] backdrop-blur-[2.5px] z-1" />
      
      {/* 시각적인 보안 해시 및 정보 차단 프레임 데코 */}
      <div className="absolute top-8 left-8 right-8 text-left opacity-15 select-none pointer-events-none font-mono text-[9px] text-ash space-y-1 z-0">
        <div className="flex justify-between">
          <span>SECURE_GROUP:</span>
          <span>MEMBERS_ONLY_SECRET</span>
        </div>
        <div className="flex justify-between">
          <span>SHA256_HASH:</span>
          <span>8f2b1a3c5e7d9f0a2b4c6e8f...</span>
        </div>
        <div className="flex justify-between">
          <span>ENCRYPTION_KEY:</span>
          <span>AES256_GCM_ACTIVE</span>
        </div>
      </div>

      <div className="relative z-10 max-w-sm space-y-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-ember-orange/10 text-ember-orange text-2xl mx-auto shadow-2xs border border-ember-orange/15 select-none animate-pulse">
          🔒
        </div>
        <div className="space-y-2">
          <h4 className="text-[15px] font-black text-charcoal-primary tracking-tight">
            대방동 정식 조합원 검증 필요 ({label})
          </h4>
          <p className="text-[11px] text-graphite/90 leading-relaxed font-normal px-2">
            본 공간은 우리 자산 가치 보호 및 조합 정보 유출을 수호하기 위해 대방동 정식 조합원 인증을 완료하신 분들만 안심하고 열람하실 수 있는 기밀 보안 영역입니다.
          </p>
        </div>
        <Button
          onClick={() => router.push("/login")}
          className="w-full max-w-[210px] rounded-full bg-midnight hover:bg-black text-white text-xs font-bold h-10 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer mx-auto"
        >
          조합원 로그인 검증
        </Button>
      </div>
    </div>
  );
}

export function NewsClient({
  session,
  initialNewsList = [],
  initialFreePosts = [],
  initialFaqs = [],
}: NewsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session;
  const isAdmin = session?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<NewsTabId>("notice");
  const [newsList, setNewsList] = useState<any[]>(initialNewsList);
  const [freePosts, setFreePosts] = useState<any[]>(initialFreePosts);
  const [faqs, setFaqs] = useState<any[]>(initialFaqs);

  const [activeViewNotice, setActiveViewNotice] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeViewNotice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeViewNotice]);

  // 1. 최신 중요 공지사항 또는 최신 일반 공지사항
  const latestStarredNotice = useMemo(() => {
    const notices = newsList.filter((n) => n.category === "NOTICE");
    const starred = notices.find((n) => n.isStarred);
    if (starred) return starred;
    return notices[0] || null;
  }, [newsList]);

  // 2. 자유게시판 이번 주 신규글 수 (DB + mock 글 총합)
  const freePostsCount = useMemo(() => {
    return freePosts.length + 2; // Real database posts + mock posts
  }, [freePosts]);

  // 3. 주/월간 뉴스레터 최신 호 타이틀 및 개수
  const newsletterCount = useMemo(() => {
    return newsList.filter((n) => n.category === "WEEKLY_MONTHLY").length + 3; // + mock newsletters
  }, [newsList]);



  // Sync tab with URL query parameter on mount or url change
  useEffect(() => {
    const tabParam = searchParams.get("tab") as NewsTabId;
    if (tabParam && ["notice", "free", "faq", "newsletter"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync state with server props
  useEffect(() => {
    setNewsList(initialNewsList);
  }, [initialNewsList]);

  useEffect(() => {
    setFreePosts(initialFreePosts);
  }, [initialFreePosts]);

  useEffect(() => {
    setFaqs(initialFaqs);
  }, [initialFaqs]);

  const handleTabClick = (tabId: NewsTabId) => {
    setActiveTab(tabId);
    router.push(`/news?tab=${tabId}`, { scroll: false });

    // 스크롤이 고정 스티키 영역 아래로 내려갔을 때, 탭 클릭 시 서브배지 위치로 고정 스냅 처리
    const navElement = document.getElementById("news-sub-nav");
    if (navElement) {
      const stickyThreshold = navElement.offsetTop - 72; // 상단 헤더 높이(72px) 보정
      if (window.scrollY > stickyThreshold) {
        window.scrollTo(0, stickyThreshold);
      }
    }
  };

  return (
    <div className="w-full">
      {/* 대형 배너 (Hero Section) */}
      <section className="bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 pt-16 pb-20 border-b border-stone-surface text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-4 py-1.5 text-xs font-bold text-sky-blue uppercase tracking-wider">
            Cooperative News
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black text-charcoal-primary leading-tight tracking-tight">
            투명하게 나누는<br />
            <span className="text-sky-blue">대방동의 소통 창구</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-graphite/90 max-w-2xl mx-auto leading-relaxed">
            사업 진행 성과를 주/월간 단위로 신속하게 보고하고, 조합원들의 다양한 질문과 목소리를 적극 수용하여 어떠한 밀실 의사결정도 없이 바르게 가겠습니다.
          </p>
        </div>
      </section>

      {/* 3열 실시간 통합 소식 대시보드 */}
      <section className="py-8 bg-[#fdfdfc] border-b border-stone-surface/50">
        <div className="site-container max-w-4xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: 중요 공지 / 최신 공지 */}
            <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface border-t-4 border-t-ember-orange flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
              <div>
                <span className="inline-flex rounded-full bg-ember-orange/10 px-2 py-0.5 text-[9px] font-bold text-ember-orange uppercase tracking-wider select-none">
                  📢 최신 공지 브리핑
                </span>
                {latestStarredNotice ? (
                  <div className="mt-3.5 space-y-1">
                    <h4 className="text-[12.5px] font-extrabold text-charcoal-primary leading-snug line-clamp-2">
                      {latestStarredNotice.isStarred && "★ "}{latestStarredNotice.title}
                    </h4>
                    <p className="text-[11px] text-graphite/85 line-clamp-2 font-normal leading-relaxed pt-0.5">
                      {latestStarredNotice.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-ash mt-4 font-normal select-none">최근 등록된 공지사항이 없습니다.</p>
                )}
              </div>
              {latestStarredNotice && (
                <div className="mt-5 pt-3 border-t border-stone-surface/60 flex items-center justify-between">
                  <span className="text-[10px] text-ash font-mono font-medium">등록일: {latestStarredNotice.createdAt.slice(0, 10).replace(/-/g, ".")}</span>
                  <button
                    onClick={() => {
                      setActiveViewNotice(latestStarredNotice);
                    }}
                    className="text-[10.5px] font-bold text-ember-orange hover:underline cursor-pointer select-none"
                  >
                    공지 읽기 →
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: 자유게시판 소통 */}
            <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface border-t-4 border-t-meadow-green flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
              <div>
                <span className="inline-flex rounded-full bg-meadow-green/10 px-2 py-0.5 text-[9px] font-bold text-meadow-green uppercase tracking-wider select-none">
                  💬 소통 활성 지표
                </span>
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-[12.5px] font-extrabold text-charcoal-primary leading-snug">
                    조합원 소통 아카이브
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-medium text-graphite">
                      <span>이번 주 누적 토론글</span>
                      <span className="font-bold text-meadow-green font-mono">+{freePostsCount}건</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-medium text-graphite">
                      <span>사무국 소통 피드백율</span>
                      <span className="font-extrabold text-meadow-green font-mono">100%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-surface/60 flex items-center justify-between">
                <span className="text-[10px] text-ash font-mono font-medium">실시간 연동 중</span>
                <button
                  onClick={() => handleTabClick("free")}
                  className="text-[10.5px] font-bold text-meadow-green hover:underline cursor-pointer select-none"
                >
                  참여하기 →
                </button>
              </div>
            </div>

            {/* Card 3: 마일스톤 게이지 */}
            <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface border-t-4 border-t-sky-blue flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
              <div>
                <span className="inline-flex rounded-full bg-sky-blue/10 px-2 py-0.5 text-[9px] font-bold text-sky-blue uppercase tracking-wider select-none">
                  📅 사업 추진 마일스톤
                </span>
                <div className="mt-3.5 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-charcoal-primary leading-snug">
                    인허가 시행율: <span className="text-sky-blue font-mono">85%</span>
                  </h4>
                  {/* 미니 게이지 바 */}
                  <div className="space-y-1">
                    <div className="w-full bg-stone-surface rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-blue h-1.5 rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                    </div>
                    <div className="flex justify-between text-[8.5px] font-bold text-ash tracking-tight font-mono select-none">
                      <span>지구단위(완료)</span>
                      <span>심의(완료)</span>
                      <span className="text-sky-blue font-extrabold">사업시행(준비)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-surface/60 flex items-center justify-between">
                <span className="text-[10px] text-ash font-mono font-medium">뉴스레터 {newsletterCount}집 발행</span>
                <button
                  onClick={() => handleTabClick("newsletter")}
                  className="text-[10.5px] font-bold text-sky-blue hover:underline cursor-pointer select-none"
                >
                  소식지 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 스티키 서브 내비게이션 탭 바 (Sticky Sub Nav) - 공개자료와 동일 */}
      <nav id="news-sub-nav" className="sticky top-18 z-10 bg-warm-canvas/90 backdrop-blur border-b border-stone-surface shadow-xs transition-all duration-200 py-2">
        <div className="site-container max-w-4xl px-4 relative">
          {/* 우측 페이드 아웃 그라데이션 오버레이 (모바일용 가로 스크롤 시각 유도) */}
          <div className="absolute right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-warm-canvas via-warm-canvas/60 to-transparent pointer-events-none z-10 md:hidden animate-in fade-in" />
          
          <div className="flex justify-start md:justify-center items-center gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 text-sm font-semibold pr-12 md:pr-0">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer font-bold flex items-center gap-1.5",
                    isActive
                      ? "bg-midnight text-white shadow-sm"
                      : "text-graphite hover:text-charcoal-primary hover:bg-stone-surface/50"
                  )}
                >
                  {item.label}
                  {item.isSecure && (
                    <span className={cn(
                      "text-[11px] font-mono shrink-0 select-none",
                      isLoggedIn
                        ? isActive ? "text-meadow-green" : "text-meadow-green/75"
                        : isActive ? "text-amber-300" : "text-ember-orange/75"
                    )}>
                      {isLoggedIn ? "🔓" : "🔒"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 본문 통합 내용 영역 (Sections) - 선택된 탭 독점 렌더링 */}
      <div className="site-container max-w-4xl px-4 py-10 sm:py-14 min-h-[75vh]">
            
        {/* 1. 공지사항 */}
        {activeTab === "notice" && (
          <section id="section-notice" className="space-y-4 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
              <div>
                <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                  <span>📢</span> 공지사항
                </h3>
                <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                  Official Announcements & Updates
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-blue bg-sky-blue/10 border border-sky-blue/20 rounded-full px-2.5 py-0.5 select-none">
                전체 공개 🔓
              </span>
            </div>
            
            <NoticeBoard
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              newsList={newsList.filter((n) => n.category === "NOTICE")}
              onViewNotice={setActiveViewNotice}
              onRefresh={async () => {
                const res = await fetch("/api/news?category=NOTICE");
                const data = await res.json();
                if (data.newsList) setNewsList((prev) => [
                  ...data.newsList,
                  ...prev.filter((n) => n.category !== "NOTICE")
                ]);
              }}
            />
          </section>
        )}

        {/* 2. 자유게시판 */}
        {activeTab === "free" && (
          <section id="section-free" className="space-y-4 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
              <div>
                <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                  <span>💬</span> 자유게시판
                </h3>
                <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                  Cooperative Community Board
                </p>
              </div>
              <span className={cn(
                "text-[10px] font-bold rounded-full px-2.5 py-0.5 select-none",
                isLoggedIn 
                  ? "text-meadow-green bg-meadow-green/10 border border-meadow-green/20" 
                  : "text-ember-orange bg-ember-orange/10 border border-ember-orange/20"
              )}>
                {isLoggedIn ? "조합원 인증 완료 🔓" : "조합원 기밀 🔒"}
              </span>
            </div>

            {isLoggedIn ? (
              <FreeBoard
                session={session}
                posts={freePosts}
                onRefresh={async () => {
                  const res = await fetch("/api/news/free");
                  const data = await res.json();
                  if (data.posts) setFreePosts(data.posts);
                }}
              />
            ) : (
              <NewsSectionLockTab label="자유게시판" router={router} />
            )}
          </section>
        )}

        {/* 3. FAQ */}
        {activeTab === "faq" && (
          <section id="section-faq" className="space-y-4 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
              <div>
                <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                  <span>❓</span> FAQ (자주 묻는 질문)
                </h3>
                <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                  Frequently Asked Questions
                </p>
              </div>
              <span className={cn(
                "text-[10px] font-bold rounded-full px-2.5 py-0.5 select-none",
                isLoggedIn 
                  ? "text-meadow-green bg-meadow-green/10 border border-meadow-green/20" 
                  : "text-ember-orange bg-ember-orange/10 border border-ember-orange/20"
              )}>
                {isLoggedIn ? "조합원 인증 완료 🔓" : "조합원 기밀 🔒"}
              </span>
            </div>

            {isLoggedIn ? (
              <FaqAccordion
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                faqs={faqs}
                onRefresh={async () => {
                  const res = await fetch("/api/news/faq");
                  const data = await res.json();
                  if (data.faqs) setFaqs(data.faqs);
                }}
              />
            ) : (
              <NewsSectionLockTab label="FAQ 자주 묻는 질문" router={router} />
            )}
          </section>
        )}

        {/* 4. 조합뉴스 (주/월간소식) */}
        {activeTab === "newsletter" && (
          <section id="section-newsletter" className="space-y-4 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
              <div>
                <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                  <span>📅</span> 조합뉴스 (주/월간소식)
                </h3>
                <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                  Weekly & Monthly Newsletters
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-blue bg-sky-blue/10 border border-sky-blue/20 rounded-full px-2.5 py-0.5 select-none">
                전체 공개 🔓
              </span>
            </div>

            <CoopNewsletter
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              newsList={newsList.filter((n) => n.category === "WEEKLY_MONTHLY")}
              onRefresh={async () => {
                const res = await fetch("/api/news?category=WEEKLY_MONTHLY");
                const data = await res.json();
                if (data.newsList) setNewsList((prev) => [
                  ...data.newsList,
                  ...prev.filter((n) => n.category !== "WEEKLY_MONTHLY")
                ]);
              }}
            />
          </section>
        )}

      </div>

      {/* 우측 사이드 슬라이드 오버 (Drawer) 패널 - 공지사항 상세 열람 */}
      {mounted && activeViewNotice && createPortal(
        <>
          <div
            onClick={() => setActiveViewNotice(null)}
            className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          <div
            className="fixed inset-y-0 right-0 z-[130] w-full max-w-2xl bg-warm-canvas border-l border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 ease-out"
            aria-label="공지사항 상세 드로어"
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                  📢
                </span>
                <div>
                  <h2 className="text-base font-bold text-charcoal-primary">
                    공지사항 열람
                  </h2>
                  <p className="text-[11px] text-ash mt-0.5 font-medium">
                    대방동 지역주택조합 공식 안내
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setActiveViewNotice(null)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                닫기
              </button>
            </div>

            <div className="flex-1 mt-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-charcoal-primary leading-snug">
                  {activeViewNotice.isStarred && (
                    <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                      ★ 중요
                    </span>
                  )}
                  {activeViewNotice.title}
                </h3>
                
                <div className="flex items-center gap-3 text-[11px] font-bold text-ash font-mono border-y border-stone-surface/65 py-2.5">
                  <span>📂 분류: 조합 공지사항</span>
                  <span>•</span>
                  <span>작성자: {activeViewNotice.author?.name || "조합 사무국"}</span>
                  <span>•</span>
                  <span>등록일: {activeViewNotice.createdAt}</span>
                </div>
              </div>

              <div className="text-sm text-graphite/95 leading-8 font-normal whitespace-pre-wrap pt-2">
                {activeViewNotice.content}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
