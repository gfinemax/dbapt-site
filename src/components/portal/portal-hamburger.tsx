"use client";

import { cn } from "@/lib/utils";

type PortalHamburgerProps = {
  className?: string;
};

export function PortalHamburger({ className }: PortalHamburgerProps) {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent("open-sitemap"));
  };

  return (
    <button
      onClick={handleOpen}
      className={cn(
        "flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95 bg-white hover:bg-stone-surface border border-stone-surface text-graphite shadow-sm",
        className
      )}
      aria-label="전체 메뉴 (사이트맵)"
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
