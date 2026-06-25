"use client";

import { useActionState, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/landing/status-page";
import { loginAction, signupWithPhonePasswordAction } from "@/lib/auth";

type LoginClientProps = {
  googleError?: string | null;
};

type BrowserOAuthState = {
  isEmbedded: boolean;
  isAndroid: boolean;
  googleAuthHref: string;
};

const GOOGLE_AUTH_PATH = "/api/auth/google";
const DEFAULT_BROWSER_OAUTH_STATE: BrowserOAuthState = {
  isEmbedded: false,
  isAndroid: false,
  googleAuthHref: GOOGLE_AUTH_PATH,
};

function isEmbeddedOAuthUserAgent(userAgent: string) {
  const normalized = userAgent.toLowerCase();
  const isAndroidWebView = /\bwv\b/.test(normalized) || /version\/[\d.]+.*chrome/.test(normalized);
  const isIosWebView = /\b(ipad|iphone|ipod)\b/.test(normalized) && !normalized.includes("safari");
  const isKnownInAppBrowser =
    /kakaotalk|naver|instagram|fbav|fban|line\/|daumapps|everytimeapp|snapchat|whale/.test(normalized);

  return isAndroidWebView || isIosWebView || isKnownInAppBrowser;
}

function buildAndroidBrowserIntent(targetUrl: URL) {
  const scheme = targetUrl.protocol.replace(":", "") || "https";
  const hostAndPath = `${targetUrl.host}${targetUrl.pathname}${targetUrl.search}`;
  const fallbackUrl = encodeURIComponent(targetUrl.toString());

  return `intent://${hostAndPath}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallbackUrl};end`;
}

function buildGoogleAuthHref(path: string, userAgent: string, origin: string) {
  const targetUrl = new URL(path, origin);
  const isEmbedded = isEmbeddedOAuthUserAgent(userAgent);
  const isAndroid = /android/i.test(userAgent);

  if (isEmbedded && isAndroid) {
    return buildAndroidBrowserIntent(targetUrl);
  }

  return `${targetUrl.pathname}${targetUrl.search}`;
}

function subscribeUserAgent() {
  return () => undefined;
}

function getClientUserAgent() {
  return typeof window === "undefined" ? "" : window.navigator.userAgent;
}

function getServerUserAgent() {
  return "";
}

export function LoginClient({ googleError = null }: LoginClientProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupPasswordConfirm, setShowSignupPasswordConfirm] = useState(false);
  const userAgent = useSyncExternalStore(subscribeUserAgent, getClientUserAgent, getServerUserAgent);
  const browserOAuth = useMemo<BrowserOAuthState>(() => {
    if (!userAgent || typeof window === "undefined") {
      return DEFAULT_BROWSER_OAUTH_STATE;
    }

    const isEmbedded = isEmbeddedOAuthUserAgent(userAgent);
    const isAndroid = /android/i.test(userAgent);

    return {
      isEmbedded,
      isAndroid,
      googleAuthHref: buildGoogleAuthHref(GOOGLE_AUTH_PATH, userAgent, window.location.origin),
    };
  }, [userAgent]);
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupWithPhonePasswordAction, null);
  const isSignupMode = authMode === "signup";
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
      title={isSignupMode ? "신규 가입 신청" : "조합원 로그인"}
      description={
        isSignupMode
          ? "휴대폰 번호와 본인이 사용할 비밀번호를 입력하면 사무국이 조합원 명부와 대조한 뒤 승인합니다."
          : "조합원 전용 포털에 오신 것을 환영합니다. 발급받은 계정으로 로그인하면 권한에 맞는 전용 화면으로 이동합니다."
      }
      wide
    >
      {isSignupMode ? (
        <div className="mx-auto mt-8 max-w-2xl">
          <section className="soft-panel p-5 text-left sm:p-6" aria-label="신규 가입 신청 폼">
            <div className="rounded-xl bg-[#f8f7f4] p-4 text-xs leading-5 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">
              <h2 className="text-sm font-semibold text-charcoal-primary">가입 신청 절차</h2>
              <p className="mt-2">
                신청 후 계정은 승인 대기 상태로 접수됩니다. 승인 전에는 자료실과
                개인 분담금 정보 열람이 제한됩니다.
              </p>
              <ol className="mt-3 space-y-1">
                <li>1. 휴대폰 번호와 본인이 사용할 비밀번호를 입력합니다.</li>
                <li>2. 사무국이 조합원 명부와 신청 정보를 대조합니다.</li>
                <li>3. 승인 후 정식 조합원 또는 환불 조합원 권한이 부여됩니다.</li>
              </ol>
            </div>

            <form action={signupFormAction} className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="signupName">
                  신청자 이름
                </label>
                <input
                  id="signupName"
                  name="signupName"
                  type="text"
                  required
                  placeholder="조합원 명부의 성명을 입력하세요"
                  className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 text-[14px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="signupPhone">
                  휴대폰 번호
                </label>
                <input
                  id="signupPhone"
                  name="signupPhone"
                  type="tel"
                  required
                  placeholder="010-1234-5678"
                  className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 text-[14px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="signupPassword">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="signupPassword"
                    name="signupPassword"
                    type={showSignupPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="8자 이상, 영문과 숫자 포함"
                    className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 pr-12 text-[14px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                  />
                  <button
                    type="button"
                    aria-label={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    aria-pressed={showSignupPassword}
                    title={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    onClick={() => setShowSignupPassword((current) => !current)}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-graphite transition hover:bg-[#f8f7f4] hover:text-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="signupPasswordConfirm">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    id="signupPasswordConfirm"
                    name="signupPasswordConfirm"
                    type={showSignupPasswordConfirm ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 pr-12 text-[14px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                  />
                  <button
                    type="button"
                    aria-label={showSignupPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                    aria-pressed={showSignupPasswordConfirm}
                    title={showSignupPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                    onClick={() => setShowSignupPasswordConfirm((current) => !current)}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-graphite transition hover:bg-[#f8f7f4] hover:text-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {showSignupPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-white px-3 py-3 text-[11px] leading-5 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                <p>비밀번호는 8자 이상으로 입력해 주세요.</p>
                <p>영문과 숫자를 함께 사용해 주세요.</p>
                <p>특수문자는 선택사항입니다.</p>
                <p>휴대폰 번호, 생년월일, 연속된 숫자 등은 사용할 수 없습니다.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="signupMemo">
                  전달 메모
                </label>
                <textarea
                  id="signupMemo"
                  name="signupMemo"
                  rows={4}
                  placeholder="동·호수, 조합원 번호 등 확인에 필요한 내용을 입력하세요"
                  className="w-full resize-none rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 text-[14px] text-charcoal-primary outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                />
              </div>
              {signupState?.error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
                  {signupState.error}
                </div>
              )}
              {signupState?.success && (
                <div className="rounded-lg bg-meadow-green/10 p-3 text-xs font-semibold text-charcoal-primary">
                  {signupState.message}
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSignupPending}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-midnight px-5 text-xs font-semibold text-white transition hover:bg-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  {isSignupPending ? "신청 접수 중..." : "가입 신청하기"}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-xs font-semibold text-charcoal-primary shadow-[inset_0_0_0_1px_var(--stone-surface)] transition hover:bg-stone-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  로그인으로 돌아가기
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : (
      <div className="mx-auto mt-8 grid max-w-5xl gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
        <section className="soft-panel p-6 text-left" aria-label="로그인 폼">
          <h2 className="text-lg font-semibold text-charcoal-primary">로그인</h2>
          <p className="mt-1 text-xs text-graphite">인증 정보를 입력하여 조합원 포털에 접속합니다.</p>

          <form action={formAction} className="mt-5 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="loginId">
                휴대폰 번호 또는 조합원 아이디
              </label>
              <input
                id="loginId"
                type="text"
                name="loginId"
                placeholder="휴대폰 번호 또는 아이디를 입력하세요"
                required
                className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-primary" htmlFor="password">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#f2f0ed] bg-white px-4 py-3 pr-12 text-[14px] outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                />
                <button
                  type="button"
                  aria-label={showLoginPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  aria-pressed={showLoginPassword}
                  title={showLoginPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  onClick={() => setShowLoginPassword((current) => !current)}
                  className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-graphite transition hover:bg-[#f8f7f4] hover:text-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
              href={browserOAuth.googleAuthHref}
              target={browserOAuth.isEmbedded && !browserOAuth.isAndroid ? "_blank" : undefined}
              rel={browserOAuth.isEmbedded && !browserOAuth.isAndroid ? "noreferrer" : undefined}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#f2f0ed] bg-[#f8f7f4] px-6 py-3.5 text-[14px] font-medium text-[#474645] transition duration-200 hover:bg-[#f2f0ed] active:bg-[#e8e6e1]"
            >
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              {browserOAuth.isEmbedded ? "외부 브라우저에서 Google 로그인" : "Google 계정으로 계속하기"}
            </a>

            {browserOAuth.isEmbedded && (
              <div role="alert" className="rounded-xl bg-[#f8f7f4] p-3 text-xs leading-5 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                <p className="font-semibold text-charcoal-primary">
                  앱 안에서 열린 브라우저에서는 Google 로그인이 차단될 수 있습니다.
                </p>
                <p className="mt-1">
                  {browserOAuth.isAndroid
                    ? "위 버튼을 누르면 Chrome에서 Google 로그인을 다시 시작합니다."
                    : "상단 메뉴에서 Safari 또는 Chrome으로 열어 Google 로그인을 다시 시도해 주세요."}
                </p>
              </div>
            )}
          </form>
        </section>

        <section
          className="flex flex-col gap-5 text-left"
          aria-label="로그인 안내"
        >
          <div className="soft-panel p-5">
            <h3 className="text-sm font-semibold text-charcoal-primary">계정 권한 안내</h3>
            <p className="mt-1 text-xs leading-5 text-graphite">
              승인된 계정 권한에 따라 보호된 포털 화면이 다르게 표시됩니다.
            </p>
            <div className="mt-4 space-y-3 text-xs leading-5 text-graphite">
              <div className="rounded-xl bg-white px-3 py-3 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                <p className="font-semibold text-charcoal-primary">정식 조합원 계정</p>
                <p className="mt-1">정보공개 자료실과 조합원 전용 자료를 확인할 수 있습니다.</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-3 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                <p className="font-semibold text-charcoal-primary">환불 조합원 계정</p>
                <p className="mt-1">환불/정산 및 납부 현황을 확인할 수 있습니다.</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-3 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                <p className="font-semibold text-charcoal-primary">관계자 및 기타 승인 계정</p>
                <p className="mt-1">사무국이 승인한 범위 안에서만 자료 열람이 가능합니다.</p>
              </div>
            </div>
          </div>

          <div className="soft-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-charcoal-primary">처음 이용하는 조합원인가요?</h3>
                <p className="mt-1 text-xs leading-5 text-graphite">
                  휴대폰 번호와 비밀번호로 가입을 신청하면 사무국이 명부와 대조한 뒤 승인합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-midnight px-4 text-xs font-semibold text-white transition hover:bg-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                신규 가입 신청
              </button>
            </div>
          </div>
        </section>
      </div>
      )}
    </StatusPage>
  );
}
