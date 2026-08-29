"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { PersonalLibraryNavigation } from "@/components/portal/personal-library-navigation";

type AdminWorkspaceShellProps = {
  children: React.ReactNode;
  name?: string | null;
};

const mobileLinks = [
  ["운영자 홈", "/portal/admin"],
  ["문서 목록", "/portal/admin#portal-documents-section"],
  ["조합원 관리", "/portal/admin/members#confirmation-needed-members"],
  ["보안 감사 기록", "/portal/admin/audit-logs"],
  ["공지사항 관리", "/news?tab=notice"],
] as const;

export function AdminWorkspaceShell({ children, name }: AdminWorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-[70] flex min-w-0 flex-col overflow-hidden bg-warm-canvas" data-testid="admin-workspace-shell">
      <header className="flex items-center justify-between gap-3 border-b border-stone-surface bg-white px-4 py-3 md:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-charcoal-primary">{name || "운영자"} · 운영자 전용 서비스</p>
          <Link href="/" className="mt-1 inline-block text-xs font-medium text-graphite hover:text-charcoal-primary">사이트 홈</Link>
        </div>
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-midnight px-3 py-2 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
            <Menu className="size-4" aria-hidden="true" /> 운영 메뉴
          </summary>
          <nav aria-label="모바일 운영 관리자 메뉴" className="absolute right-0 top-11 z-10 w-56 rounded-2xl bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-stone-surface">
            {mobileLinks.map(([label, href]) => <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-graphite hover:bg-parchment-card">{label}</Link>)}
            <Link href="/" className="mt-1 block border-t border-stone-surface px-3 py-2.5 text-sm font-semibold text-charcoal-primary">사이트 홈</Link>
          </nav>
        </details>
      </header>
      <div className="grid min-h-0 flex-1 md:grid-cols-[216px_minmax(0,1fr)]">
        <PersonalLibraryNavigation name={name} role="ADMIN" currentPath={pathname} />
        <div className="min-w-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
