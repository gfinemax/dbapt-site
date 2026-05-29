"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";

interface SessionData {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
  email?: string;
}

export function GlobalHeader({ session }: { session: SessionData | null }) {
  const pathname = usePathname();

  // 포털 내부에 진입했을 때는 글로벌 헤더를 숨김 처리 (자체 포털 헤더 사용)
  if (pathname?.startsWith("/portal")) {
    return null;
  }

  return <SiteHeader session={session} />;
}
