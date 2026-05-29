"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { megaMenuNavigation } from "@/content/landing";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth";

type SiteHeaderProps = {
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
  onOpenPortal?: () => void;
};

const getRoleLabel = (r: string) => {
  switch (r) {
    case "ADMIN":
      return "관리자";
    case "MEMBER":
      return "정식 조합원";
    case "REFUND":
      return "환불 조합원";
    default:
      return r;
  }
};

export function SiteHeader({ session, onOpenPortal }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!session;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 감지 클로저
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // 로그아웃 시 세션 웰컴 여부 클리어
    sessionStorage.removeItem("dbapt_login_welcomed");
    await logoutAction();
    setIsDropdownOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <header 
      className="sticky top-0 z-20 border-b border-stone-surface/80 bg-warm-canvas/90 backdrop-blur"
      onMouseLeave={() => setIsMegaMenuOpen(false)}
    >
      <div className="site-container flex h-18 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-charcoal-primary">
          <span className="flex size-9 items-center justify-center rounded-full bg-sky-blue text-sm font-semibold text-white">
            D
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em]">
            대방동 지역주택조합
          </span>
        </Link>
        
        {/* 데스크톱 네비게이션 및 사이트맵 트리거 */}
        <div className="hidden md:flex items-center h-full gap-5">
          <nav className="flex items-center gap-7 text-sm font-medium text-charcoal-primary h-full">
            {megaMenuNavigation.map((item) => {
              const itemHref = item.href as string;
              // Active state detection: matches exact path or is a sub-anchor page of home page, or matches starting path for non-root pages
              const isActive = 
                pathname === itemHref || 
                (itemHref !== "/" && !itemHref.startsWith("/#") && pathname?.startsWith(itemHref));

              return (
                <Link 
                  key={item.title} 
                  href={item.href} 
                  className={cn(
                    "hover:text-ember-orange transition-all duration-200 py-2 flex items-center h-full relative cursor-pointer",
                    isActive ? "text-ember-orange font-bold" : "text-graphite/90"
                  )}
                >
                  <span>{item.title}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ember-orange rounded-full animate-in fade-in duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* 구분용 실선 피처 */}
          <div className="h-4 w-px bg-stone-surface" />

          {/* 사이트맵 전용 액션 단추 (DESIGN.md 규격: Pill shape, Border-stone-surface, active midnight) */}
          <button
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95",
              isMegaMenuOpen
                ? "bg-midnight text-white border-midnight"
                : "bg-white hover:bg-stone-surface border-stone-surface text-graphite hover:text-charcoal-primary"
            )}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isMegaMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span>사이트맵</span>
          </button>
        </div>
        
        {/* 우측 인증 액션 셸 */}
        <div className="flex items-center gap-3">
          {isLoggedIn && session ? (
            <>
              {/* [대안 A] 핵심: 메인 네비게이션용 [조합원 전용 자료실] 액션 단추 (Ember Orange 포인트) */}
              <button
                onClick={() => {
                  if (onOpenPortal) onOpenPortal();
                  else window.dispatchEvent(new CustomEvent('open-portal'));
                }}
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-ember-orange text-white px-4 py-2 text-xs font-bold shadow-md hover:bg-[#e03700] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                조합원 전용 자료실
              </button>

              {/* 미니 프로필 드롭다운 위젯 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-stone-surface border border-stone-surface shadow-sm text-xs text-graphite font-semibold transition cursor-pointer"
                >
                  <span>{session.name}님</span>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold tracking-wider",
                    session.role === "MEMBER"
                      ? "bg-meadow-green/10 text-meadow-green"
                      : session.role === "REFUND"
                      ? "bg-ember-orange/10 text-ember-orange"
                      : session.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-sunburst-yellow/20 text-charcoal-primary"
                  )}>
                    {getRoleLabel(session.role)}
                  </span>
                  <svg className={cn("w-3 h-3 text-ash transition-transform duration-200", isDropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 (DESIGN.md 규격: White Card + Recessed panel 느낌) */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white border border-stone-surface shadow-lg z-50 p-4 transition-all duration-200">
                    <h4 className="text-xs font-bold text-charcoal-primary mb-2">조합원 프로필</h4>
                    
                    {/* Recessed Panel 명세 */}
                    <div className="bg-parchment-card p-3 rounded-xl border border-dashed border-stone-surface text-[10px] text-graphite space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-ash">인증 이메일</span>
                        <span className="text-charcoal-primary font-mono font-medium truncate max-w-[120px]">{session.email || "소셜 미연동"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-ash">조합원 번호</span>
                        <span className="text-charcoal-primary font-mono font-medium">{session.loginId || "임시 미승인"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-ash">현재 권한</span>
                        <strong className="text-midnight">{getRoleLabel(session.role)}</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-surface flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (onOpenPortal) onOpenPortal();
                          else window.dispatchEvent(new CustomEvent('open-portal'));
                        }}
                        className="sm:hidden text-[11px] font-bold text-ember-orange hover:underline cursor-pointer"
                      >
                        자료실 열기
                      </button>
                      <span className="hidden sm:inline text-[9px] text-ash font-medium">안전 세션 가동</span>
                      <Button onClick={handleLogout} variant="ghost" size="sm" className="rounded-full h-8 text-[11px] px-2 text-ember-orange hover:bg-ember-orange/5 cursor-pointer">
                        로그아웃
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button asChild variant="secondary" className="hidden sm:inline-flex rounded-full">
              <Link href="/login">조합원 로그인</Link>
            </Button>
          )}
        </div>
      </div>

      {/* 4. 메가메뉴 대형 드롭다운 패널 (DESIGN.md 규격에 맞게 화이트 백그라운드 + 인셋 스톤 보더 느낌) */}
      {isMegaMenuOpen && (
        <div
          onMouseEnter={() => setIsMegaMenuOpen(true)}
          onMouseLeave={() => setIsMegaMenuOpen(false)}
          className="absolute left-0 right-0 top-full bg-white/98 backdrop-blur-md border-b border-stone-surface/85 shadow-xl animate-in slide-in-from-top-1.5 fade-in duration-200"
          style={{ zIndex: 19 }}
        >
          <div className="site-container max-w-5xl py-8 px-6 grid grid-cols-5 gap-8">
            {megaMenuNavigation.map((category) => (
              <div key={category.title} className="flex flex-col">
                {/* 대분류 타이틀 */}
                <Link
                  href={category.href}
                  className="font-extrabold text-[13.5px] text-charcoal-primary pb-2 mb-3.5 border-b border-stone-surface/75 inline-block hover:text-ember-orange transition-colors cursor-pointer"
                  onClick={() => setIsMegaMenuOpen(false)}
                >
                  {category.title}
                </Link>
                
                {/* 소분류 리스트 */}
                <ul className="space-y-1.5 flex flex-col">
                  {category.subItems.map((sub) => {
                    const subGated = (sub as { isPortalGated?: boolean }).isPortalGated;
                    const isGated = subGated && !isLoggedIn;
                    
                    return (
                      <li key={sub.label}>
                        {isGated ? (
                          <button
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              alert("이 정보는 대방동 지역주택조합원 전용 비공개 자료입니다.\n안전한 정보 보호를 위해 조합원 계정 로그인 후 열람하실 수 있습니다.");
                              router.push("/login");
                            }}
                            className="text-[12.5px] font-medium text-graphite/85 hover:text-ember-orange active:translate-x-0.5 transition-all duration-150 block text-left w-full cursor-pointer py-1"
                          >
                            {sub.label}
                            <span className="ml-1 text-[10px] text-ash select-none">🔒</span>
                          </button>
                        ) : subGated ? (
                          <button
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              if (onOpenPortal) onOpenPortal();
                              else window.dispatchEvent(new CustomEvent('open-portal'));
                            }}
                            className="text-[12.5px] font-medium text-graphite/85 hover:text-ember-orange active:translate-x-0.5 transition-all duration-150 block text-left w-full cursor-pointer py-1"
                          >
                            {sub.label}
                            <span className="ml-1 text-[10px] text-ember-orange select-none">🔓</span>
                          </button>
                        ) : (
                          <Link
                            href={sub.href}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="text-[12.5px] font-medium text-graphite/85 hover:text-ember-orange active:translate-x-0.5 transition-all duration-150 block py-1"
                          >
                            {sub.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
