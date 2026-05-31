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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);

  // 모바일 하단 네비게이션 드로어 탭 활성화 상태 동기화 리스너
  useEffect(() => {
    const onOpenPortal = () => setActiveMobileTab("portal");
    const onOpenAbout = () => setActiveMobileTab("about");
    const onOpenDisclosure = () => setActiveMobileTab("disclosure");
    const onClosePortal = () => setActiveMobileTab(null);
    const onOpenSitemap = () => setIsMobileMenuOpen(true);
    const onCloseSitemap = () => setIsMobileMenuOpen(false);

    window.addEventListener('open-portal', onOpenPortal);
    window.addEventListener('open-about', onOpenAbout);
    window.addEventListener('open-disclosure', onOpenDisclosure);
    window.addEventListener('close-portal', onClosePortal);
    window.addEventListener('open-sitemap', onOpenSitemap);
    window.addEventListener('close-sitemap', onCloseSitemap);
    
    return () => {
      window.removeEventListener('open-portal', onOpenPortal);
      window.removeEventListener('open-about', onOpenAbout);
      window.removeEventListener('open-disclosure', onOpenDisclosure);
      window.removeEventListener('close-portal', onClosePortal);
      window.removeEventListener('open-sitemap', onOpenSitemap);
      window.removeEventListener('close-sitemap', onCloseSitemap);
    };
  }, []);

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

  const handleLibraryClick = () => {
    if (isLoggedIn) {
      if (isDrawerSupportedPage) {
        if (onOpenPortal) onOpenPortal();
        else window.dispatchEvent(new CustomEvent('open-portal'));
      } else {
        handleMyRoomClick();
      }
    } else {
      alert("이 정보는 대방동 지역주택조합원 전용 비공개 자료입니다.\n안전한 정보 보호를 위해 조합원 계정 로그인 후 열람하실 수 있습니다.");
      router.push("/login");
    }
  };

  const handleMyRoomClick = () => {
    if (isLoggedIn && session) {
      if (session.role === "ADMIN") {
        router.push("/portal/admin");
      } else if (session.role === "PENDING") {
        router.push("/portal/pending");
      } else if (session.role === "REFUND") {
        router.push("/portal/refund");
      } else {
        router.push("/portal/member");
      }
    } else {
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    // 로그아웃 시 세션 웰컴 여부 클리어
    sessionStorage.removeItem("dbapt_login_welcomed");
    await logoutAction();
    setIsDropdownOpen(false);
    router.push("/login");
    router.refresh();
  };

  const isPortalRoute = pathname?.startsWith("/portal");
  const isDrawerSupportedPage = pathname === "/" || pathname?.startsWith("/about") || pathname?.startsWith("/disclosure");

  return (
    <>
      {!isPortalRoute && (
        <header className="sticky top-0 z-50 border-b border-stone-surface/80 bg-warm-canvas/90 backdrop-blur">
      <div className="site-container flex h-18 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-charcoal-primary" onClick={() => setIsMobileMenuOpen(false)}>
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

              {/* 미니 프로필 드롭다운 위젯 (데스크톱 md 해상도 이상에서만 노출) */}
              <div className="hidden md:block relative" ref={dropdownRef}>
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

          {/* 모바일/데스크톱 햄버거 토글 버튼 (전역 노출) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95",
              isMobileMenuOpen
                ? "bg-midnight text-white"
                : "bg-white hover:bg-stone-surface border border-stone-surface text-graphite shadow-sm"
            )}
            aria-label="모바일 메뉴"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      </header>
      )}
 
      {/* 5. 모바일/데스크톱 네비게이션 드로어 (사이트맵) - 전역 노출 가능하도록 header 외부 배치 및 md:hidden 해제 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-16 md:bottom-0 top-0 z-40 animate-in fade-in duration-200">
          {/* 어두운 백드롭 오버레이 (클릭 시 닫힘) */}
          <div 
            className="absolute inset-0 bg-midnight/35 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* 드로어 바디: warm-canvas (#fbfaf9), left to right slide-in */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[300px] sm:w-[350px] bg-[#fbfaf9] border-l border-stone-surface flex flex-col z-50 animate-in slide-in-from-right duration-300 ease-out"
            style={{ 
              boxShadow: "rgba(0, 0, 0, 0.08) -4px 0px 24px 0px"
            }}
          >
            {/* 드로어 상단부: 타이틀 및 닫기 버튼 (글씨 비침 방지를 위해 bg-[#fbfaf9] 솔리드 적용) */}
            <div className="flex h-18 items-center justify-between px-6 border-b border-stone-surface/80 bg-[#fbfaf9]">
              <span className="text-[13px] font-bold text-charcoal-primary tracking-[-0.03em]">
                전체 메뉴 (사이트맵)
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-surface/80 text-ash transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 중간: 스크롤 영역 네비게이션 메뉴 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {megaMenuNavigation.map((category) => (
                <div key={category.title} className="space-y-2">
                  <h3 className="text-xs font-bold text-ash/80 tracking-wider uppercase border-b border-stone-surface/60 pb-1.5">
                    {category.title}
                  </h3>
                  <ul className="space-y-1">
                    {category.subItems.map((sub) => {
                      const subGated = (sub as { isPortalGated?: boolean }).isPortalGated;
                      const isGated = subGated && !isLoggedIn;
                      
                      return (
                        <li key={sub.label}>
                          {isGated ? (
                            <button
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                alert("이 정보는 대방동 지역주택조합원 전용 비공개 자료입니다.\n안전한 정보 보호를 위해 조합원 계정 로그인 후 열람하실 수 있습니다.");
                                router.push("/login");
                              }}
                              className="text-[13.5px] font-medium text-graphite/90 hover:text-ember-orange flex items-center justify-between w-full text-left py-1.5 transition cursor-pointer"
                            >
                              <span>{sub.label}</span>
                              <span className="text-[10px] text-ash">🔒</span>
                            </button>
                          ) : subGated ? (
                            <button
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (onOpenPortal) onOpenPortal();
                                else window.dispatchEvent(new CustomEvent('open-portal'));
                              }}
                              className="text-[13.5px] font-medium text-graphite/90 hover:text-ember-orange flex items-center justify-between w-full text-left py-1.5 transition cursor-pointer"
                            >
                              <span>{sub.label}</span>
                              <span className="text-[10px] text-ember-orange">🔓</span>
                            </button>
                          ) : (
                            <Link
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-[13.5px] font-medium text-graphite/90 hover:text-ember-orange flex items-center justify-between py-1.5 transition cursor-pointer"
                            >
                              <span>{sub.label}</span>
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* 하단: 로그인 상태 액션바 (글씨 비침 방지를 위해 bg-[#fbfaf9] 솔리드 적용) */}
            <div className="p-6 border-t border-stone-surface/80 bg-[#fbfaf9] flex flex-col gap-3">
              {isLoggedIn && session ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-charcoal-primary">{session.name}님</p>
                      <p className="text-[10px] text-ash mt-0.5">{getRoleLabel(session.role)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-[11px] font-bold text-ember-orange hover:bg-ember-orange/5 px-3 py-1.5 rounded-full border border-ember-orange/10 transition cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenPortal) onOpenPortal();
                      else window.dispatchEvent(new CustomEvent('open-portal'));
                    }}
                    className="w-full inline-flex items-center justify-center rounded-full bg-ember-orange text-white py-2.5 text-xs font-bold shadow-md hover:bg-[#e03700] active:scale-98 transition duration-200 cursor-pointer"
                  >
                    조합원 전용 자료실 열기
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-ash text-center mb-1">안전한 정보 보호를 위해 로그인이 필요합니다.</p>
                  <Button asChild variant="secondary" className="w-full rounded-full cursor-pointer py-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/login">조합원 로그인</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    {/* 6. 모바일 앱 스타일 하단 고정 바 (DESIGN.md 규격: Warm Canvas, Stone Border, active Ember Orange) */}
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-warm-canvas/95 backdrop-blur-md border-t border-stone-surface/90 shadow-[rgba(0,0,0,0.04)_0px_-4px_16px_0px] flex items-center justify-around z-55 md:hidden pb-safe">
        {/* 홈 탭 */}
        <Link 
          href="/" 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('close-portal'));
            setIsMobileMenuOpen(false);
          }}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition duration-150 cursor-pointer",
            (activeMobileTab === "home" || (activeMobileTab === null && pathname === "/")) ? "text-ember-orange" : "text-ash/90 hover:text-charcoal-primary"
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold mt-1 tracking-tight">홈</span>
        </Link>

        {/* 조합소개 탭 */}
        <Link 
          href="/about" 
          onClick={(e) => {
            if (window.innerWidth < 768 && isDrawerSupportedPage) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('open-about'));
            } else {
              window.dispatchEvent(new CustomEvent('close-portal'));
            }
            setIsMobileMenuOpen(false);
          }}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition duration-150 cursor-pointer",
            (activeMobileTab === "about" || (activeMobileTab === null && pathname?.startsWith("/about"))) ? "text-ember-orange" : "text-ash/90 hover:text-charcoal-primary"
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-bold mt-1 tracking-tight">조합소개</span>
        </Link>

        {/* 공개자료 탭 */}
        <Link 
          href="/disclosure" 
          onClick={(e) => {
            if (window.innerWidth < 768 && isDrawerSupportedPage) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('open-disclosure'));
            } else {
              window.dispatchEvent(new CustomEvent('close-portal'));
            }
            setIsMobileMenuOpen(false);
          }}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition duration-150 cursor-pointer",
            (activeMobileTab === "disclosure" || (activeMobileTab === null && pathname?.startsWith("/disclosure"))) ? "text-ember-orange" : "text-ash/90 hover:text-charcoal-primary"
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] font-bold mt-1 tracking-tight">공개자료</span>
        </Link>

        {/* 자료실 탭 (클릭 시 세션 체크) */}
        <button 
          onClick={handleLibraryClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition duration-150 cursor-pointer",
            (activeMobileTab === "portal" || (activeMobileTab === null && pathname?.startsWith("/portal") && pathname !== "/portal/admin" && pathname !== "/portal/pending" && pathname !== "/portal/refund")) ? "text-ember-orange" : "text-ash/90 hover:text-charcoal-primary"
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <span className="text-[10px] font-bold mt-1 tracking-tight">자료실</span>
        </button>

        {/* 조합원 마이룸/로그인 탭 */}
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('close-portal'));
            handleMyRoomClick();
          }}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition duration-150 cursor-pointer",
            (activeMobileTab === "myroom" || (activeMobileTab === null && (pathname === "/login" || (pathname?.startsWith("/portal") && (pathname === "/portal/admin" || pathname === "/portal/pending" || pathname === "/portal/refund" || pathname === "/portal/member"))))) ? "text-ember-orange" : "text-ash/90 hover:text-charcoal-primary"
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            {isLoggedIn ? "조합원룸" : "로그인"}
          </span>
        </button>
      </div>
    </>
  );
}
