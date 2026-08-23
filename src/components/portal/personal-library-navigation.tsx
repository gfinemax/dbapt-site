"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  FileHeart,
  FileText,
  House,
  MessageCircle,
  ReceiptText,
  UserRound,
} from "lucide-react";

const sectionItems = [
  { key: "profile", label: "내정보", targetId: "member-contribution", icon: UserRound },
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
};

const baseItemClassName = "flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left text-sm transition-colors";

const setLedgerDisclosureOpen = (isOpen: boolean) => {
  const disclosure = document.getElementById("member-ledger-disclosure");
  if (disclosure instanceof HTMLDetailsElement) {
    disclosure.open = isOpen;
  }
};

export function PersonalLibraryNavigation({ name, role }: PersonalLibraryNavigationProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const normalizedRole = role?.trim().toUpperCase();
  const cleanName = name?.trim().replace(/\s*\((?:정식조합원|환불조합원|탈퇴조합원)\)\s*$/, "");
  const memberLabel = normalizedRole === "REFUND"
    ? `${cleanName || "탈퇴"} 환불조합원`
    : normalizedRole === "ADMIN"
      ? "운영 문서 관리자"
      : `${cleanName || "오학동"} 조합원`;

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

  return (
    <aside className="hidden border-r border-stone-surface bg-white md:flex md:min-h-full md:flex-col md:px-3 md:py-5" aria-label="개인 자료실 사이드바">
      <div className="flex items-center gap-2 px-3 pb-5">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-ember-orange text-sm font-semibold text-white">D</span>
        <span className="text-sm font-semibold leading-5 text-charcoal-primary">{memberLabel}<span className="block text-xs font-normal text-ash">조합원 전용 서비스</span></span>
      </div>
      <Link
        href="/"
        onClick={() => window.dispatchEvent(new CustomEvent("close-portal"))}
        className="mb-4 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold text-charcoal-primary ring-1 ring-inset ring-stone-surface transition-colors hover:bg-parchment-card"
      >
        <House className="size-4" aria-hidden="true" />
        홈으로
      </Link>
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
    </aside>
  );
}
