import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage } from "@/components/landing/status-page";
import { portalProfiles, portalRoleOrder } from "@/content/portal";

export const metadata: Metadata = {
  title: "조합원 로그인 | 대방동 지역주택조합",
};

export default function LoginPage() {
  return (
      <StatusPage
        eyebrow="조합원 전용 서비스"
        title="조합원 로그인"
        description="로그인 서비스는 개통 준비 중입니다. 인증과 권한 정책이 확정된 뒤 안전하게 제공하겠습니다."
        wide
      >
        <section
          className="soft-panel mx-auto mt-9 max-w-xl p-5 text-left"
          aria-label="포털 화면 미리보기"
        >
          <p className="text-sm font-medium text-ember-orange">포털 화면 미리보기</p>
          <p className="mt-2 text-sm leading-6 text-graphite">
            실제 로그인이나 개인 자료 제공이 아닌 준비 화면입니다. 역할별 화면 구성을 먼저
            확인할 수 있습니다.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {portalRoleOrder.map((role) => {
              const profile = portalProfiles[role];

              return (
                <Link
                  key={role}
                  href={profile.href}
                  aria-label={`${profile.navLabel} 화면 보기`}
                  className="stone-card px-4 py-4 text-center text-sm font-medium text-charcoal-primary hover:bg-parchment-card"
                >
                  {profile.navLabel} 화면 보기
                </Link>
              );
            })}
          </div>
        </section>
      </StatusPage>
    );
}
