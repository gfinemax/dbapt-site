"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/landing/status-page";
import { portalProfiles, portalRoleOrder } from "@/content/portal";
import { loginAction } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      if (state.role === "MEMBER") {
        router.push("/portal/member");
      } else if (state.role === "REFUND") {
        router.push("/portal/refund");
      } else if (state.role === "ADMIN") {
        router.push("/portal/admin");
      }
      router.refresh();
    }
  }, [state, router]);

  return (
    <StatusPage
      eyebrow="조합원 전용 서비스"
      title="조합원 로그인"
      description="조합원 전용 포털에 오신 것을 환영합니다. 로그인 서비스는 개통 준비 중입니다. 인증과 권한 정책이 확정된 뒤 안전하게 제공하겠습니다."
      wide
    >
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Left Side: Real Login Form */}
        <section className="soft-panel p-6 text-left" aria-label="로그인 폼">
          <h2 className="text-lg font-semibold text-charcoal-primary">로그인</h2>
          <p className="mt-1 text-xs text-graphite">인증 정보를 입력하여 조합원 포털에 접속합니다.</p>
          
          <form action={formAction} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="loginId">
                조합원 아이디
              </label>
              <input
                id="loginId"
                type="text"
                name="loginId"
                placeholder="아이디를 입력하세요"
                required
                className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
              />
            </div>
            
            {state?.error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 font-medium">
                {state.error}
              </div>
            )}
            
            <Button type="submit" disabled={isPending} className="mt-2 w-full py-6 text-[14px] rounded-full">
              {isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </section>

        {/* Right Side: Preview Links and Test Accounts */}
        <section className="flex flex-col gap-5 text-left" aria-label="안내 및 테스트 계정">
          <div className="soft-panel p-5 bg-[#f8f7f4] border border-dashed border-[#f2f0ed]">
            <h3 className="text-sm font-semibold text-ember-orange">데모 테스트 계정 정보</h3>
            <p className="mt-1 text-xs text-graphite">아래의 사전 발급된 테스트 계정으로 즉시 로그인 해보실 수 있습니다.</p>
            <ul className="mt-3 text-xs leading-6 text-graphite space-y-2">
              <li className="flex justify-between items-center border-b border-[#f2f0ed] pb-1.5">
                <span>정식 조합원:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#f2f0ed]">
                  member1 / member123
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-[#f2f0ed] pb-1.5">
                <span>환불 조합원:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#f2f0ed]">
                  refund1 / refund123
                </span>
              </li>
              <li className="flex justify-between items-center pb-1">
                <span>최고 관리자:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#f2f0ed]">
                  admin / admin123
                </span>
              </li>
            </ul>
          </div>

          <div className="soft-panel p-5">
            <h3 className="text-sm font-semibold text-charcoal-primary">포털 화면 미리보기</h3>
            <p className="mt-1 text-xs text-graphite">
              실제 로그인이나 개인 자료 제공이 아닌 준비 화면입니다. 역할별 화면 구성을 먼저 확인할 수 있습니다.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {portalRoleOrder.map((role) => {
                const profile = portalProfiles[role];
                return (
                  <Link
                    key={role}
                    href={profile.href}
                    className="stone-card px-2 py-3 text-center text-xs font-semibold text-charcoal-primary hover:bg-[#f8f7f4] transition"
                  >
                    {profile.navLabel} 화면 보기
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </StatusPage>
  );
}
