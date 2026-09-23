"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { resetPasswordWithTokenAction } from "@/lib/account-recovery-actions";

type ResetState = { error?: string; success?: boolean; message?: string } | null;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPasswordWithTokenAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (state?.success) {
    return (
      <div role="status" className="mt-5 rounded-xl bg-meadow-green/10 p-4 text-sm leading-6 text-charcoal-primary">
        <p className="font-semibold">비밀번호가 안전하게 변경되었습니다.</p>
        <p className="mt-1">{state.message}</p>
        <Link href="/login" className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white">로그인으로 돌아가기</Link>
      </div>
    );
  }

  const passwordInput = (id: string, name: string, label: string, visible: boolean, toggle: () => void) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-charcoal-primary">{label}</label>
      <div className="relative">
        <input id={id} name={name} type={visible ? "text" : "password"} inputMode="numeric" maxLength={6} pattern="\d{6}" required autoComplete="new-password" placeholder="숫자 6자리" className="h-12 w-full rounded-xl border border-stone-surface bg-white px-4 pr-12 text-base text-charcoal-primary outline-none transition placeholder:text-ash focus:border-ember-orange focus:ring-1 focus:ring-ember-orange sm:text-sm" />
        <button type="button" onClick={toggle} aria-label={visible ? `${label} 숨기기` : `${label} 보기`} className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-graphite hover:bg-parchment-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
      </div>
    </div>
  );

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="token" value={token} />
      {passwordInput("newPassword", "newPassword", "새 비밀번호", showPassword, () => setShowPassword((value) => !value))}
      {passwordInput("newPasswordConfirm", "newPasswordConfirm", "새 비밀번호 확인", showConfirm, () => setShowConfirm((value) => !value))}
      {state?.error ? <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{state.error}</div> : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white transition hover:bg-charcoal-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-60">{pending ? "안전하게 변경하고 있습니다..." : "새 비밀번호로 변경하기"}</button>
    </form>
  );
}
