import type { Metadata } from "next";
import { StatusPage } from "@/components/landing/status-page";

export const metadata: Metadata = {
  title: "조합원 로그인 | 대방동 지역주택조합",
};

export default function LoginPage() {
  return (
    <StatusPage
      eyebrow="조합원 전용 서비스"
      title="조합원 로그인"
      description="로그인 서비스는 개통 준비 중입니다. 인증과 권한 정책이 확정된 뒤 안전하게 제공하겠습니다."
    />
  );
}
