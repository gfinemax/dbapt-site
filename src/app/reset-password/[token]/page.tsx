import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage } from "@/components/landing/status-page";
import { getPasswordResetState } from "@/lib/account-recovery-actions";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "비밀번호 재설정 | 대방동 지역주택조합",
};

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const state = await getPasswordResetState(token);

  return (
    <StatusPage eyebrow="계정 보안" title="비밀번호 재설정" description="새 비밀번호는 회원님만 알 수 있도록 안전하게 변경됩니다." compactMobile>
      <div className="mx-auto mt-5 max-w-md">
        <section className="soft-panel p-4 text-left sm:p-6">
          {state.valid ? (
            <>
              <p className="text-sm leading-6 text-graphite"><span className="font-semibold text-charcoal-primary">{state.name}님</span>, 사용할 새 비밀번호를 입력해 주세요. 변경이 완료되면 기존에 로그인된 기기에서는 자동으로 로그아웃됩니다.</p>
              <ResetPasswordForm token={token} />
            </>
          ) : (
            <div role="alert" className="rounded-xl bg-parchment-card p-4 text-sm leading-6 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">
              <p className="font-semibold text-charcoal-primary">{state.reason === "EXPIRED" ? "링크의 사용 시간이 만료되었습니다." : "이 링크는 사용할 수 없습니다."}</p>
              <p className="mt-1">걱정하지 마세요. 본인 정보를 다시 입력하면 사무국에서 새로운 링크를 안내해 드립니다.</p>
              <Link href="/account-recovery?mode=password" className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white">새 링크 요청하기</Link>
            </div>
          )}
        </section>
      </div>
    </StatusPage>
  );
}
