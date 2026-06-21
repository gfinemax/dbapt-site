"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { OverviewTab } from "./overview-tab";
import { PlanTab } from "./plan-tab";
import { UnitTab } from "./unit-tab";
import { MobilityTab } from "./mobility-tab";
import { RenderingTab } from "./rendering-tab";
import { TimelineTab } from "./timeline-tab";
import { SiteFooter } from "@/components/landing/site-footer";

type TabId = "overview" | "rendering" | "plan" | "unit" | "mobility" | "timeline";

const tabs = [
  {
    id: "overview",
    label: "건축개요",
    eyebrow: "BUSINESS SUMMARY",
    title: "건축개요",
    description: "현재 지구단위계획과 향후 경미한 변경 예정 세대수를 구분해 안내합니다.",
  },
  {
    id: "rendering",
    label: "조감도",
    eyebrow: "RENDERING",
    title: "조감도",
    description: "사업계획서의 조감도 이미지를 참고 자료로 제공합니다.",
  },
  {
    id: "plan",
    label: "계획·배치도",
    eyebrow: "ARCHITECTURE PLAN",
    title: "건축계획(안) 및 배치도",
    description: "주요 계획 수치와 배치도를 사업계획서 기준으로 정리했습니다.",
  },
  {
    id: "unit",
    label: "단위세대",
    eyebrow: "UNIT PLAN",
    title: "단위세대 평면도",
    description: "사업계획서에 수록된 타입별 단위세대 평면도를 확인합니다.",
  },
  {
    id: "mobility",
    label: "차량·보행",
    eyebrow: "SITE CIRCULATION",
    title: "차량·보행 동선계획",
    description: "차량 주출입과 보행자 동선을 구분해 배치 계획을 안내합니다.",
  },
  {
    id: "timeline",
    label: "추진절차",
    eyebrow: "PROCESS",
    title: "향후 추진절차",
    description: "자료에 제시된 지역주택조합사업 추진절차와 현재 검토 단계를 표시했습니다.",
  },
] as const;

export function BusinessClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const isScrollingRef = useRef(false);

  const scrollToSection = useCallback((tabId: TabId, updateUrl = true) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (!element) return;

    isScrollingRef.current = true;
    window.scrollTo({
      top: element.offsetTop - 140,
      behavior: "smooth",
    });

    if (updateUrl) {
      window.history.pushState({}, "", `/business#${tabId}`);
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 220;

      for (const tab of tabs) {
        const element = document.getElementById(tab.id);
        if (!element) continue;

        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveTab(tab.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabId | null;
    const hashParam =
      typeof window !== "undefined" ? (window.location.hash.replace("#", "") as TabId) : null;
    const initialTarget = [tabParam, hashParam].find((id): id is TabId =>
      !!id && tabs.some((tab) => tab.id === id),
    );

    if (!initialTarget) return;
    window.requestAnimationFrame(() => scrollToSection(initialTarget, false));
  }, [searchParams, scrollToSection]);

  return (
    <div className="w-full overflow-x-hidden pt-[52px]">
      <section className="bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 pt-16 pb-20 border-b border-stone-surface text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-4 py-1.5 text-xs font-bold text-ember-orange uppercase tracking-wider">
            2025.10.30 사업계획서 기준
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black text-charcoal-primary leading-tight tracking-tight">
            대방동 지역주택조합<br />
            <span className="text-ember-orange">사업현황</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-graphite/90 max-w-[21rem] sm:max-w-2xl mx-auto leading-relaxed">
            건축개요, 건축계획안, 배치도, 단위세대 평면도와 동선계획을
            사업계획서와 조합의 향후 변경 예정 기준으로 안내합니다.
          </p>
        </div>
      </section>

      <nav
        aria-label="사업현황 세부 메뉴"
        className="fixed inset-x-0 top-[72px] z-40 bg-warm-canvas/95 backdrop-blur border-b border-stone-surface shadow-xs transition-all duration-200 py-1"
      >
        <div className="site-container max-w-4xl px-4">
          <div className="flex justify-start md:justify-center items-center gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-2 text-sm font-semibold">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-midnight text-white shadow-sm"
                      : "text-graphite hover:text-charcoal-primary hover:bg-stone-surface/50"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="site-container max-w-4xl px-4 py-16 sm:py-24 space-y-24 sm:space-y-36">
        <BusinessSection tab={tabs[0]}>
          <OverviewTab />
        </BusinessSection>

        <BusinessSection tab={tabs[1]}>
          <RenderingTab />
        </BusinessSection>

        <BusinessSection tab={tabs[2]}>
          <PlanTab />
        </BusinessSection>

        <BusinessSection tab={tabs[3]}>
          <UnitTab />
        </BusinessSection>

        <BusinessSection tab={tabs[4]}>
          <MobilityTab />
        </BusinessSection>

        <BusinessSection tab={tabs[5]}>
          <TimelineTab />
        </BusinessSection>
      </main>

      <SiteFooter />
    </div>
  );
}

function BusinessSection({
  tab,
  children,
}: {
  tab: (typeof tabs)[number];
  children: ReactNode;
}) {
  return (
    <section id={tab.id} className="scroll-mt-[148px]">
      <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
        <p className="text-xs font-bold text-ember-orange tracking-widest uppercase">
          {tab.eyebrow}
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
          {tab.title}
        </h2>
        <p className="text-xs sm:text-sm text-graphite mt-3 max-w-[21rem] sm:max-w-xl mx-auto leading-relaxed">
          {tab.description}
        </p>
      </div>
      {children}
    </section>
  );
}
