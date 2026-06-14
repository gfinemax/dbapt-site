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
      description="홈페이지는 회원 식별, 조합원 권한 확인, 문의 응대, 자료 열람 이력 관리에 필요한 범위에서 개인정보를 처리합니다."
      wide
    >
      <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left">
        {[
          {
            title: "처리 목적",
            body: "조합원 로그인, 권한별 자료 열람, 개인 자료실 제공, 보안 감사 이력 관리, 공지 및 문의 응대를 위해 개인정보를 처리합니다.",
          },
          {
            title: "처리 항목",
            body: "이름, 로그인 아이디, 연락처, 이메일, 조합원 권한 정보, 자료 열람 및 다운로드 이력, 접속 일시 등 서비스 운영에 필요한 항목을 최소 범위로 사용합니다.",
          },
          {
            title: "보관 및 보호",
            body: "개인정보와 조합원 전용 자료는 권한 확인 후 접근되며, 내부 운영 목적을 벗어나 임의로 공개하지 않습니다. 보관 기간은 관계 법령과 조합 운영 기준에 따릅니다.",
          },
          {
            title: "권리 행사 및 문의",
            body: "개인정보 열람, 정정, 처리 관련 문의는 대방동 지역주택조합 사무실 02-822-1508로 요청하실 수 있습니다.",
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
