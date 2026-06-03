"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/landing/status-page";
import { loginAction } from "@/lib/auth";

type LoginClientProps = {
  googleError?: string | null;
};

export function LoginClient({ googleError = null }: LoginClientProps) {
  const router = useRouter();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const showDemoCredentials = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "true" || process.env.NODE_ENV === "development";
  const googleErrorMessage =
    googleError === "google_not_configured"
      ? "Google OAuth 설정이 필요합니다. GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 등록해 주세요."
      : googleError
        ? "Google 로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요."
        : null;

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
        <section className="soft-panel p-6 text-left" aria-label="로그인 폼">
          <h2 className="text-lg font-semibold text-charcoal-primary">로그인</h2>
          <p className="mt-1 text-xs text-graphite">인증 정보를 입력하여 조합원 포털에 접속합니다.</p>

          <form action={formAction} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="loginId">
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
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="password">
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
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
                {state.error}
              </div>
            )}
            {googleErrorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
                {googleErrorMessage}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="mt-2 w-full rounded-full py-6 text-[14px]">
              {isPending ? "로그인 중..." : "로그인"}
            </Button>

            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f2f0ed]" />
              </div>
              <span className="relative bg-white px-3 text-xs text-[#848281]">또는</span>
            </div>

            <a
              href="/api/auth/google"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#f2f0ed] bg-[#f8f7f4] px-6 py-3.5 text-[14px] font-medium text-[#474645] transition duration-200 hover:bg-[#f2f0ed] active:bg-[#e8e6e1]"
            >
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google 계정으로 계속하기
            </a>
          </form>
        </section>

        <section
          className="flex flex-col gap-5 text-left"
          aria-label={showDemoCredentials ? "안내 및 테스트 계정" : "로그인 안내"}
        >
          {showDemoCredentials && (
            <div className="soft-panel border border-dashed border-[#f2f0ed] bg-[#f8f7f4] p-5">
              <h3 className="text-sm font-semibold text-ember-orange">데모 테스트 계정 정보</h3>
              <p className="mt-1 text-xs text-graphite">아래의 사전 발급된 테스트 계정으로 즉시 로그인 해보실 수 있습니다.</p>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-graphite">
                <li className="flex items-center justify-between border-b border-[#f2f0ed] pb-1.5">
                  <span>정식 조합원:</span>
                  <span className="rounded border border-[#f2f0ed] bg-white px-1.5 py-0.5 font-mono">
                    member1 / member123
                  </span>
                </li>
                <li className="flex items-center justify-between border-b border-[#f2f0ed] pb-1.5">
                  <span>환불 조합원:</span>
                  <span className="rounded border border-[#f2f0ed] bg-white px-1.5 py-0.5 font-mono">
                    refund1 / refund123
                  </span>
                </li>
                <li className="flex items-center justify-between pb-1">
                  <span>최고 관리자:</span>
                  <span className="rounded border border-[#f2f0ed] bg-white px-1.5 py-0.5 font-mono">
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

          <div className="soft-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-charcoal-primary">처음 이용하는 조합원인가요?</h3>
                <p className="mt-1 text-xs leading-5 text-graphite">
                  본인 Google 계정으로 신청하면 사무국이 명부와 대조한 뒤 승인합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSignupOpen((current) => !current)}
                aria-expanded={isSignupOpen}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-midnight px-4 text-xs font-semibold text-white transition hover:bg-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                신규 가입 신청
              </button>
            </div>

            {isSignupOpen && (
              <div className="mt-4 rounded-xl bg-[#f8f7f4] p-4 text-xs leading-5 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                <h4 className="font-semibold text-charcoal-primary">가입 신청 절차</h4>
                <p className="mt-2">
                  Google 인증 후 계정은 승인 대기 상태로 접수됩니다. 승인 전에는 자료실과
                  개인 분담금 정보 열람이 제한됩니다.
                </p>
                <ol className="mt-3 space-y-1">
                  <li>1. Google 계정으로 본인 이메일과 이름을 확인합니다.</li>
                  <li>2. 사무국이 조합원 명부와 신청 정보를 대조합니다.</li>
                  <li>3. 승인 후 정식 조합원 또는 환불 조합원 권한이 부여됩니다.</li>
                </ol>
                <form action="/api/auth/google" method="get" className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block font-semibold text-charcoal-primary" htmlFor="signupName">
                      신청자 이름
                    </label>
                    <input
                      id="signupName"
                      name="signupName"
                      type="text"
                      required
                      placeholder="조합원 명부의 성명을 입력하세요"
                      className="w-full rounded-xl border border-[#f2f0ed] bg-white px-3 py-2.5 text-[13px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-semibold text-charcoal-primary" htmlFor="signupPhone">
                      연락처
                    </label>
                    <input
                      id="signupPhone"
                      name="signupPhone"
                      type="tel"
                      required
                      placeholder="사무국 확인 연락처를 입력하세요"
                      className="w-full rounded-xl border border-[#f2f0ed] bg-white px-3 py-2.5 text-[13px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-semibold text-charcoal-primary" htmlFor="signupMemo">
                      전달 메모
                    </label>
                    <textarea
                      id="signupMemo"
                      name="signupMemo"
                      rows={3}
                      placeholder="동·호수, 조합원 번호 등 확인에 필요한 내용을 입력하세요"
                      className="w-full resize-none rounded-xl border border-[#f2f0ed] bg-white px-3 py-2.5 text-[13px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-charcoal-primary shadow-[inset_0_0_0_1px_var(--stone-surface)] transition hover:bg-stone-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:w-auto"
                  >
                    Google 계정으로 신청하기
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </StatusPage>
  );
}
