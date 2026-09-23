"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { StatusPage } from "@/components/landing/status-page";
import { requestAccountRecoveryAction } from "@/lib/account-recovery-actions";
import type { AccountRecoveryType } from "@/lib/account-recovery";

type RecoveryState = { error?: string; success?: boolean; message?: string } | null;

function RecoveryForm({ requestType }: { requestType: AccountRecoveryType }) {
  const [state, action, pending] = useActionState<RecoveryState, FormData>(requestAccountRecoveryAction, null);
  const isIdLookup = requestType === "ID_LOOKUP";

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="requestType" value={requestType} />
      <div>
        <label htmlFor={`${requestType}-name`} className="mb-1.5 block text-xs font-semibold text-charcoal-primary">등록된 이름</label>
        <input id={`${requestType}-name`} name="name" required autoComplete="name" placeholder="조합원 명부의 성명을 입력하세요" className="h-12 w-full rounded-xl border border-stone-surface bg-white px-4 text-base text-charcoal-primary outline-none transition placeholder:text-ash focus:border-ember-orange focus:ring-1 focus:ring-ember-orange sm:text-sm" />
      </div>
      <div>
        <label htmlFor={`${requestType}-phone`} className="mb-1.5 block text-xs font-semibold text-charcoal-primary">등록된 휴대전화 번호</label>
        <input id={`${requestType}-phone`} name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="010-1234-5678" className="h-12 w-full rounded-xl border border-stone-surface bg-white px-4 text-base text-charcoal-primary outline-none transition placeholder:text-ash focus:border-ember-orange focus:ring-1 focus:ring-ember-orange sm:text-sm" />
      </div>
      {state?.error ? <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{state.error}</div> : null}
      {state?.success ? (
        <div role="status" className="rounded-xl bg-meadow-green/10 p-4 text-sm leading-6 text-charcoal-primary">
          <p className="font-semibold">요청이 접수되었습니다.</p>
          <p className="mt-1">{state.message}</p>
        </div>
      ) : null}
      <button type="submit" disabled={pending || Boolean(state?.success)} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white transition hover:bg-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "요청을 확인하고 있습니다..." : state?.success ? "접수 완료" : isIdLookup ? "아이디 찾기 요청" : "비밀번호 재설정 요청"}
      </button>
    </form>
  );
}

export function AccountRecoveryClient({ initialMode }: { initialMode: AccountRecoveryType }) {
  const [mode, setMode] = useState<AccountRecoveryType>(initialMode);
  const isIdLookup = mode === "ID_LOOKUP";

  return (
    <StatusPage eyebrow="계정 이용 도움" title={isIdLookup ? "아이디 찾기" : "비밀번호 재설정"} description="등록된 정보를 확인한 뒤 사무국에서 안전하게 안내해 드립니다." compactMobile>
      <div className="mx-auto mt-5 max-w-md">
        <div className="grid grid-cols-2 rounded-full bg-stone-surface p-1" role="tablist" aria-label="계정 도움 항목">
          <button type="button" role="tab" aria-selected={isIdLookup} onClick={() => setMode("ID_LOOKUP")} className={`h-11 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${isIdLookup ? "bg-white text-midnight shadow-sm" : "text-graphite hover:text-midnight"}`}>아이디 찾기</button>
          <button type="button" role="tab" aria-selected={!isIdLookup} onClick={() => setMode("PASSWORD_RESET")} className={`h-11 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${!isIdLookup ? "bg-white text-midnight shadow-sm" : "text-graphite hover:text-midnight"}`}>비밀번호 재설정</button>
        </div>

        <section className="soft-panel mt-4 p-4 text-left sm:p-6" aria-label={isIdLookup ? "아이디 찾기 요청" : "비밀번호 재설정 요청"}>
          <div className="rounded-xl bg-parchment-card px-4 py-3 text-xs leading-5 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">
            {isIdLookup
              ? "이름과 등록된 휴대전화 번호를 확인한 뒤 사무국에서 로그인 아이디를 문자로 안내해 드립니다."
              : "사무국에서 등록된 휴대전화로 12시간 동안 한 번만 사용할 수 있는 재설정 링크를 안내해 드립니다."}
          </div>
          <RecoveryForm key={mode} requestType={mode} />
        </section>

        <p className="mt-5 text-center text-sm text-graphite">아이디와 비밀번호가 기억나셨나요? <Link href="/login" className="font-semibold text-ember-orange hover:text-charcoal-primary">로그인으로 돌아가기</Link></p>
      </div>
    </StatusPage>
  );
}
