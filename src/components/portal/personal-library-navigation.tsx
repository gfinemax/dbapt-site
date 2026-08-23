import Link from "next/link";
import { Bell, FileText, House, MessageCircle, ReceiptText, UserRound } from "lucide-react";

const items = [
  { label: "내정보", href: "#member-contribution", icon: UserRound, active: true },
  { label: "납부내역", href: "#member-ledger", icon: ReceiptText },
  { label: "서류발급", href: "/library", icon: FileText },
  { label: "공지사항", href: "/news?tab=notice", icon: Bell },
  { label: "문의하기", href: "/news?tab=free", icon: MessageCircle },
];

type PersonalLibraryNavigationProps = {
  name?: string | null;
  role?: string | null;
};

export function PersonalLibraryNavigation({ name, role }: PersonalLibraryNavigationProps) {
  const normalizedRole = role?.trim().toUpperCase();
  const cleanName = name?.trim().replace(/\s*\((?:정식조합원|환불조합원|탈퇴조합원)\)\s*$/, "");
  const memberLabel = normalizedRole === "REFUND"
    ? `${cleanName || "탈퇴"} 환불조합원`
    : normalizedRole === "ADMIN"
      ? "운영 문서 관리자"
      : `${cleanName || "오학동"} 조합원`;

  return (
    <aside className="hidden border-r border-stone-surface bg-white md:flex md:min-h-full md:flex-col md:px-3 md:py-5" aria-label="개인 자료실 사이드바">
      <div className="flex items-center gap-2 px-3 pb-5">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-ember-orange text-sm font-semibold text-white">D</span>
        <span className="text-sm font-semibold leading-5 text-charcoal-primary">{memberLabel}<span className="block text-xs font-normal text-ash">조합원 전용 서비스</span></span>
      </div>
      <Link href="/" className="mb-3 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold text-charcoal-primary ring-1 ring-inset ring-stone-surface transition-colors hover:bg-parchment-card">
        <House className="size-4" aria-hidden="true" />
        홈으로
      </Link>
      <nav className="space-y-1" aria-label="개인 자료실 메뉴">
        {items.map(({ label, href, icon: Icon, active }) => (
          <Link key={label} href={href} className={`flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm transition-colors ${active ? "bg-parchment-card font-semibold text-ember-orange" : "text-graphite hover:bg-parchment-card"}`}>
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
