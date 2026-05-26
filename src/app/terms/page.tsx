import type { Metadata } from "next";
import { StatusPage } from "@/components/landing/status-page";

export const metadata: Metadata = {
  title: "이용약관 | 대방동 지역주택조합",
};

export default function TermsPage() {
  return (
    <StatusPage
      eyebrow="운영 안내"
      title="이용약관"
      description="이용약관은 개통 전 게시됩니다. 확정된 운영 기준과 서비스 범위를 반영하여 안내하겠습니다."
    />
  );
}
