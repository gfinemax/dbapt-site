import type { Metadata } from "next";
import { StatusPage } from "@/components/landing/status-page";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 대방동 지역주택조합",
};

export default function PrivacyPage() {
  return (
    <StatusPage
      eyebrow="운영 안내"
      title="개인정보처리방침"
      description="개인정보처리방침은 개통 전 게시됩니다. 수집 항목과 처리 절차가 확정되는 대로 공개하겠습니다."
    />
  );
}
