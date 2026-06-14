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
      description="대방동 지역주택조합 홈페이지는 조합 소식, 공개자료, 자료실, 조합원 전용 서비스 안내를 제공합니다."
      wide
    >
      <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left">
        {[
          {
            title: "서비스의 목적",
            body: "본 홈페이지는 조합 소개, 사업현황, 공개자료 위치, 조합소식, 자료실, 조합원 전용 서비스 안내를 제공하기 위한 공식 온라인 창구입니다.",
          },
          {
            title: "이용 범위",
            body: "공개 페이지는 누구나 열람할 수 있으며, 조합원 전용 자료와 개인별 납부·고지 내역은 발급받은 계정으로 로그인한 조합원에게만 제공됩니다.",
          },
          {
            title: "자료의 기준",
            body: "홈페이지에 게시되는 안내와 자료는 조합이 확인한 범위에서 제공되며, 원문 문서와 세부 권한이 필요한 자료는 해당 메뉴 또는 조합 사무실 안내에 따릅니다.",
          },
          {
            title: "문의",
            body: "홈페이지 이용, 자료 열람, 계정 관련 문의는 대방동 지역주택조합 사무실 02-822-1508로 연락해 주시기 바랍니다.",
          },
        ].map((item) => (
          <section key={item.title} className="rounded-2xl bg-parchment-card p-5">
            <h2 className="text-sm font-bold text-charcoal-primary">{item.title}</h2>
            <p className="mt-2 text-xs leading-6 text-graphite">{item.body}</p>
          </section>
        ))}
      </div>
    </StatusPage>
  );
}
