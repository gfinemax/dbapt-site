"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Calculator,
  FileHeart,
  FilePlus2,
  FileText,
  Files,
  FolderOpen,
  House,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Newspaper,
  ReceiptText,
  ShieldCheck,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { logoutAction } from "@/lib/auth";

const sectionItems = [
  { key: "profile", label: "내정보", targetId: "member-profile", icon: UserRound },
  { key: "ledger", label: "납부내역", targetId: "member-ledger", icon: ReceiptText },
  { key: "personal", label: "개인자료", targetId: "member-personal-library", icon: FileHeart },
] as const;

const shortcutItems = [
  { label: "서류발급", href: "/library", icon: FileText },
  { label: "공지사항", href: "/news?tab=notice", icon: Bell },
  { label: "문의하기", href: "/news?tab=free", icon: MessageCircle },
] as const;

type SectionKey = (typeof sectionItems)[number]["key"];

type PersonalLibraryNavigationProps = {
  name?: string | null;
  role?: string | null;
  documentCount?: number;
  disclosureDocumentCount?: number;
  accountingDocumentCount?: number;
  pendingUserCount?: number;
  onSelectDocumentCategory?: (category: string) => void;
};

const baseItemClassName = "flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left text-sm transition-colors";

const setLedgerDisclosureOpen = (isOpen: boolean) => {
  const disclosure = document.getElementById("member-ledger-disclosure");
  if (disclosure instanceof HTMLDetailsElement) {
    disclosure.open = isOpen;
  }
};

export function PersonalLibraryNavigation({
  name,
  role,
  documentCount = 0,
  disclosureDocumentCount = 0,
  accountingDocumentCount = 0,
  pendingUserCount = 0,
  onSelectDocumentCategory,
}: PersonalLibraryNavigationProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [activeAdminSection, setActiveAdminSection] = useState("dashboard");
  const normalizedRole = role?.trim().toUpperCase();
  const cleanName = name?.trim().replace(/\s*\((?:정식조합원|환불조합원|탈퇴조합원)\)\s*$/, "");
  const memberLabel = normalizedRole === "REFUND"
    ? `${cleanName || "탈퇴"} 환불조합원`
    : normalizedRole === "ADMIN"
      ? "운영 문서 관리자"
      : `${cleanName || "오학동"} 조합원`;
  const isAdmin = normalizedRole === "ADMIN";

  useEffect(() => {
    const resetNavigation = () => {
      setActiveSection("profile");
      setLedgerDisclosureOpen(false);
    };
    window.addEventListener("open-portal", resetNavigation);
    return () => window.removeEventListener("open-portal", resetNavigation);
  }, []);

  const moveToSection = (key: SectionKey, targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    setLedgerDisclosureOpen(key === "ledger");
    setActiveSection(key);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
  };

  const moveToAdminSection = (key: string, targetId: string, category?: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (category) onSelectDocumentCategory?.(category);
    setActiveAdminSection(key);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("dbapt_login_welcomed");
    await logoutAction();
    window.dispatchEvent(new CustomEvent("close-portal"));
    router.push("/login");
    router.refresh();
  };

  const adminButton = (key: string, label: string, targetId: string, Icon: typeof LayoutDashboard, count?: number, category?: string) => (
    <button
      type="button"
      aria-current={activeAdminSection === key ? "location" : undefined}
      onClick={() => moveToAdminSection(key, targetId, category)}
      className={`${baseItemClassName} justify-between ${activeAdminSection === key ? "bg-parchment-card font-semibold text-ember-orange" : "text-graphite hover:bg-parchment-card"}`}
    >
      <span className="flex min-w-0 items-center gap-3"><Icon className="size-4 shrink-0" aria-hidden="true" />{label}</span>
      {count !== undefined && <span className="rounded-full bg-stone-surface px-2 py-0.5 text-[10px] font-semibold text-graphite">{count}</span>}
    </button>
  );

  return (
    <aside className="hidden border-r border-stone-surface bg-white md:flex md:min-h-full md:flex-col md:px-3 md:py-5" aria-label="개인 자료실 사이드바">
      <div className="flex items-center gap-2 px-3 pb-5">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-ember-orange text-sm font-semibold text-white">D</span>
        <span className="text-sm font-semibold leading-5 text-charcoal-primary">{memberLabel}<span className="block text-xs font-normal text-ash">{isAdmin ? "문서·회원 운영" : "조합원 전용 서비스"}</span></span>
      </div>
      <Link
        href="/"
        onClick={() => window.dispatchEvent(new CustomEvent("close-portal"))}
        className="mb-4 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold text-charcoal-primary ring-1 ring-inset ring-stone-surface transition-colors hover:bg-parchment-card"
      >
        <House className="size-4" aria-hidden="true" />
        홈으로
      </Link>
      {isAdmin ? (
      <nav aria-label="운영 관리자 메뉴" className="flex min-h-0 flex-1 flex-col">
        <div>
          <p className="px-3 pb-1.5 text-[11px] font-semibold text-ash">운영</p>
          <div className="space-y-1">
            {adminButton("dashboard", "대시보드", "admin-dashboard", LayoutDashboard)}
            {adminButton("approvals", "가입 승인 대기", "admin-signup-approvals", UserCheck, pendingUserCount)}
          </div>
        </div>
        <div className="mt-4 border-t border-stone-surface pt-4">
          <p className="px-3 pb-1.5 text-[11px] font-semibold text-ash">문서 관리</p>
          <div className="space-y-1">
            {adminButton("documents", "전체 문서", "portal-documents-section", Files, documentCount, "all")}
            <Link href="/portal/admin/documents/new" className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}><FilePlus2 className="size-4" aria-hidden="true" />새 문서 등록</Link>
            {adminButton("disclosure", "정보공개 문서", "portal-documents-section", FolderOpen, disclosureDocumentCount, "DISCLOSURE")}
            {adminButton("accounting", "회계 문서", "portal-documents-section", Calculator, accountingDocumentCount, "ACCOUNTING")}
          </div>
        </div>
        <div className="mt-4 border-t border-stone-surface pt-4">
          <p className="px-3 pb-1.5 text-[11px] font-semibold text-ash">관리</p>
          <div className="space-y-1">
            <Link href="/portal/admin/members" className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}><UsersRound className="size-4" aria-hidden="true" />조합원 관리</Link>
            <Link href="/portal/admin/audit-logs" className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}><ShieldCheck className="size-4" aria-hidden="true" />보안 감사 기록</Link>
          </div>
        </div>
        <div className="mt-4 border-t border-stone-surface pt-4">
          <p className="px-3 pb-1.5 text-[11px] font-semibold text-ash">게시판</p>
          <div className="space-y-1">
            <Link href="/news?tab=notice" className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}><Newspaper className="size-4" aria-hidden="true" />공지사항 관리</Link>
            <Link href="/news?tab=free" className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}><MessageCircle className="size-4" aria-hidden="true" />자유게시판 확인</Link>
          </div>
        </div>
        <div className="mt-auto border-t border-stone-surface pt-4">
          <button type="button" onClick={handleLogout} className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}><LogOut className="size-4" aria-hidden="true" />로그아웃</button>
        </div>
      </nav>
      ) : (
      <nav aria-label="개인 자료실 메뉴">
        <p className="px-3 pb-1.5 text-[11px] font-semibold text-ash">내 서비스</p>
        <div className="space-y-1">
          {sectionItems.map(({ key, label, targetId, icon: Icon }) => {
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                type="button"
                aria-current={isActive ? "location" : undefined}
                onClick={() => moveToSection(key, targetId)}
                className={`${baseItemClassName} ${isActive ? "bg-parchment-card font-semibold text-ember-orange" : "text-graphite hover:bg-parchment-card"}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 border-t border-stone-surface pt-4">
          <p className="px-3 pb-1.5 text-[11px] font-semibold text-ash">바로가기</p>
          <div className="space-y-1">
            {shortcutItems.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  window.location.assign(href);
                }}
                className={`${baseItemClassName} text-graphite hover:bg-parchment-card`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      )}
    </aside>
  );
}
