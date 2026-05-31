"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/landing/status-page";
import { loginAction, googleMockLoginAction } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const showDemoCredentials = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "true" || process.env.NODE_ENV === "development";

  const handleGoogleLogin = async () => {
    const res = await googleMockLoginAction();
    if (res?.success) {
      if (res.role === "PENDING") {
        router.push("/portal/pending");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  useEffect(() => {
    if (state?.success) {
      if (state.role === "PENDING") {
        router.push("/portal/pending");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }, [state, router]);

  return (
    <StatusPage
      eyebrow="조합원 전용 서비스"
      title="조합원 로그인"
      description={
        showDemoCredentials
          ? "조합원 전용 포털에 오신 것을 환영합니다. 테스트 계정으로 역할별 포털에 접속할 수 있습니다. 실제 운영 계정 발급 전까지는 데모 데이터만 제공합니다."
          : "조합원 전용 포털에 오신 것을 환영합니다. 발급받은 계정으로 로그인하면 권한에 맞는 전용 화면으로 이동합니다."
      }
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

            {/* OR 구분선 */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f2f0ed]" />
              </div>
              <span className="relative bg-white px-3 text-xs text-[#848281]">또는</span>
            </div>

            {/* 구글 로그인 버튼 (DESIGN.md 가이드 준수: Pill Light 스타일) */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-full border border-[#f2f0ed] bg-[#f8f7f4] text-[14px] font-medium text-[#474645] hover:bg-[#f2f0ed] active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google 계정으로 계속하기
            </button>
          </form>
        </section>

        {/* Right Side: Preview Links and Test Accounts */}
        <section
          className="flex flex-col gap-5 text-left"
          aria-label={showDemoCredentials ? "안내 및 테스트 계정" : "로그인 안내"}
        >
          {showDemoCredentials && (
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
          )}

          <div className="soft-panel p-5">
            <h3 className="text-sm font-semibold text-charcoal-primary">로그인 후 이동 경로</h3>
            <p className="mt-1 text-xs text-graphite">
              보호된 포털 화면은 로그인 후 권한에 맞춰 자동으로 연결됩니다.
            </p>
            <ul className="mt-4 space-y-2 text-xs leading-6 text-graphite">
              <li className="rounded-xl bg-white px-3 py-2 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                정식 조합원 계정은 정보공개 자료실로 이동합니다.
              </li>
              <li className="rounded-xl bg-white px-3 py-2 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                환불 조합원 계정은 환불/정산 현황으로 이동합니다.
              </li>
              <li className="rounded-xl bg-white px-3 py-2 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                관리자 계정은 문서 등록과 감사 로그 화면으로 이동합니다.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </StatusPage>
  );
}
