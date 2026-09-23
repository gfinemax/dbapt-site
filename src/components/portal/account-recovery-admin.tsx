"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clipboard, ExternalLink, KeyRound, Smartphone, X } from "lucide-react";
import {
  cancelAccountRecoveryAction,
  markAccountRecoverySentAction,
  prepareAccountRecoveryMessageAction,
} from "@/lib/account-recovery-actions";
import type { AccountRecoveryDeliveryMethod } from "@/lib/account-recovery";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

type RecoveryRequestRow = {
  id: string;
  requestType: string;
  status: string;
  requestPhoneLast4: string;
  deliveryMethod: string | null;
  createdAt: string;
  tokenExpiresAt: string | null;
  deliveryMarkedAt: string | null;
  completedAt: string | null;
  user: {
    name: string;
    phoneMasked: string;
    role: string;
    isActive: boolean;
    hasSitePassword: boolean;
  };
  handledByName: string | null;
};

type PreparedMessage = {
  phone: string;
  message: string;
  smsHref: string;
  expiresAt?: string;
  passwordless?: boolean;
};

const statusLabels: Record<string, string> = {
  PENDING: "확인 대기",
  LINK_CREATED: "링크 생성",
  SENT: "발송 완료",
  COMPLETED: "처리 완료",
  CANCELLED: "취소",
  EXPIRED: "기간 만료",
};

const roleLabels: Record<string, string> = {
  MEMBER: "정식 조합원",
  REFUND: "환불 조합원",
  ASSOCIATE: "관계자·기타",
  PENDING: "가입 승인 대기",
  ADMIN: "관리자",
};

export function AccountRecoveryAdmin({ requests }: { requests: RecoveryRequestRow[] }) {
  const router = useRouter();
  const [deliveryMethods, setDeliveryMethods] = useState<Record<string, AccountRecoveryDeliveryMethod>>({});
  const [prepared, setPrepared] = useState<Record<string, PreparedMessage>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Record<string, string>>({});

  const getDeliveryMethod = (id: string) => deliveryMethods[id] || "OFFICE_MOBILE";

  const prepareMessage = async (request: RecoveryRequestRow) => {
    setBusyId(request.id);
    setNotice((current) => ({ ...current, [request.id]: "" }));
    const result = await prepareAccountRecoveryMessageAction(request.id, getDeliveryMethod(request.id));
    if (result.error) {
      setNotice((current) => ({ ...current, [request.id]: result.error || "안내문을 만들지 못했습니다." }));
    } else if (result.success) {
      setPrepared((current) => ({ ...current, [request.id]: result as PreparedMessage }));
      setNotice((current) => ({ ...current, [request.id]: "안내문이 준비되었습니다. 실제 문자 발송은 휴대전화에서 확인해 주세요." }));
    }
    setBusyId(null);
  };

  const copyMessage = async (requestId: string) => {
    const item = prepared[requestId];
    if (!item) return;
    try {
      await copyTextToClipboard(item.message);
      setNotice((current) => ({ ...current, [requestId]: "문자 내용이 복사되었습니다." }));
    } catch (error) {
      setNotice((current) => ({ ...current, [requestId]: error instanceof Error ? error.message : "문자 내용을 복사하지 못했습니다." }));
    }
  };

  const markSent = async (requestId: string) => {
    setBusyId(requestId);
    const result = await markAccountRecoverySentAction(requestId, getDeliveryMethod(requestId));
    setNotice((current) => ({ ...current, [requestId]: result.error || "발송 완료로 기록했습니다." }));
    setBusyId(null);
    if (result.success) router.refresh();
  };

  const cancelRequest = async (requestId: string) => {
    setBusyId(requestId);
    const result = await cancelAccountRecoveryAction(requestId);
    setNotice((current) => ({ ...current, [requestId]: result.error || "요청을 취소했습니다." }));
    setBusyId(null);
    if (result.success) router.refresh();
  };

  const pendingCount = requests.filter((request) => ["PENDING", "LINK_CREATED", "SENT"].includes(request.status)).length;

  return (
    <main className="min-h-full bg-warm-canvas px-4 py-8 text-charcoal-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-ember-orange">운영자 계정 지원</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-midnight">계정 복구 요청</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite">회원가입 승인과 비슷하게 요청을 확인하고, 상황에 맞는 휴대전화의 문자 앱으로 안내를 보내 주세요. 사이트가 문자를 자동 발송하지는 않습니다.</p>
          </div>
          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--stone-surface)]">처리 중 {pendingCount}건</span>
        </div>

        <div className="mt-6 space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-[10px] bg-white p-8 text-center text-sm text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">접수된 계정 복구 요청이 없습니다.</div>
          ) : requests.map((request) => {
            const active = ["PENDING", "LINK_CREATED", "SENT"].includes(request.status);
            const method = getDeliveryMethod(request.id);
            const preparedMessage = prepared[request.id];
            return (
              <article key={request.id} className="rounded-[10px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-parchment-card px-2.5 py-1 text-xs font-semibold text-charcoal-primary">{request.requestType === "ID_LOOKUP" ? "아이디 찾기" : "비밀번호 재설정"}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === "COMPLETED" ? "bg-meadow-green/10 text-charcoal-primary" : request.status === "CANCELLED" ? "bg-stone-surface text-ash" : "bg-sky-blue/10 text-ocean-blue"}`}>{statusLabels[request.status] || request.status}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-midnight">{request.user.name}</h2>
                    <p className="mt-1 text-sm text-graphite">{roleLabels[request.user.role] || request.user.role} · {request.user.phoneMasked} · 요청 번호 끝 {request.requestPhoneLast4}</p>
                    <p className="mt-1 text-xs text-ash">요청 {new Date(request.createdAt).toLocaleString("ko-KR")} {request.handledByName ? `· 담당 ${request.handledByName}` : ""}</p>
                  </div>
                  <span className={`text-xs font-semibold ${request.user.isActive ? "text-meadow-green" : "text-red-600"}`}>{request.user.isActive ? "활성 계정" : "비활성 계정"}</span>
                </div>

                {active ? (
                  <div className="mt-5 border-t border-stone-surface pt-5">
                    <fieldset>
                      <legend className="text-xs font-semibold text-charcoal-primary">문자를 보낼 휴대전화</legend>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {(["OFFICE_MOBILE", "PERSONAL_MOBILE"] as const).map((value) => (
                          <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 text-sm shadow-[inset_0_0_0_1px_var(--stone-surface)] ${method === value ? "bg-parchment-card" : "bg-white"}`}>
                            <input type="radio" name={`delivery-${request.id}`} value={value} checked={method === value} onChange={() => setDeliveryMethods((current) => ({ ...current, [request.id]: value }))} className="mt-0.5 accent-midnight" />
                            <span><span className="block font-semibold text-charcoal-primary">{value === "OFFICE_MOBILE" ? "사무국 전용폰" : "관리자 개인폰"}</span><span className="mt-0.5 block text-xs leading-5 text-graphite">{value === "OFFICE_MOBILE" ? "기본 권장 수단입니다." : "회원에게 개인번호가 표시될 수 있습니다."}</span></span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {method === "PERSONAL_MOBILE" ? <p role="note" className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">개인 휴대전화로 보내면 회원에게 관리자 개인번호가 공개되고 보낸 문자함에 안내 링크가 남습니다.</p> : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" disabled={busyId === request.id} onClick={() => prepareMessage(request)} className="inline-flex h-10 items-center gap-2 rounded-full bg-midnight px-4 text-xs font-semibold text-white hover:bg-charcoal-primary disabled:opacity-60"><KeyRound className="size-4" aria-hidden="true" />{request.requestType === "ID_LOOKUP" ? "아이디 안내문 만들기" : "12시간 링크 만들기"}</button>
                      {preparedMessage ? <>
                        <button type="button" onClick={() => copyMessage(request.id)} className="inline-flex h-10 items-center gap-2 rounded-full bg-stone-surface px-4 text-xs font-semibold text-charcoal-primary hover:bg-parchment-card"><Clipboard className="size-4" aria-hidden="true" />문구 복사</button>
                        <a href={preparedMessage.smsHref} className="inline-flex h-10 items-center gap-2 rounded-full bg-stone-surface px-4 text-xs font-semibold text-charcoal-primary hover:bg-parchment-card"><Smartphone className="size-4" aria-hidden="true" />문자 앱 열기<ExternalLink className="size-3" aria-hidden="true" /></a>
                        <button type="button" disabled={busyId === request.id} onClick={() => markSent(request.id)} className="inline-flex h-10 items-center gap-2 rounded-full bg-meadow-green/10 px-4 text-xs font-semibold text-charcoal-primary hover:bg-meadow-green/20"><Check className="size-4" aria-hidden="true" />발송 완료 기록</button>
                      </> : null}
                      <button type="button" disabled={busyId === request.id} onClick={() => cancelRequest(request.id)} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold text-graphite hover:bg-stone-surface"><X className="size-4" aria-hidden="true" />요청 취소</button>
                    </div>

                    {preparedMessage ? <pre className="mt-4 whitespace-pre-wrap break-all rounded-xl bg-parchment-card p-4 font-sans text-xs leading-5 text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)]">{preparedMessage.message}</pre> : null}
                    {notice[request.id] ? <p role="status" className="mt-3 text-xs font-medium text-graphite">{notice[request.id]}</p> : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
