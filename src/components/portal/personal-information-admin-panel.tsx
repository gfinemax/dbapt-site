"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

type AdminRequest = {
  id: string;
  memberName: string;
  label: string;
  previousValue: string;
  requestedValue: string;
  status: string;
  peopleOnStatus: string;
  hasPeopleOnBinding: boolean;
  publicMemo: string | null;
  adminMemo: string | null;
  createdAt: string;
};

const statusLabels: Record<string, string> = { PENDING: "승인 대기", APPROVED: "승인 완료", REJECTED: "반려", CANCELLED: "취소" };
const peopleOnLabels: Record<string, string> = { NOT_REQUIRED: "반영 불필요", PENDING: "반영 대기", COMPLETED: "반영 완료", FAILED: "확인 필요" };

export function PersonalInformationAdminPanel() {
  const [items, setItems] = useState<AdminRequest[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/personal-info-requests", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) setError(payload.error || "개인정보 변경 요청을 불러오지 못했습니다.");
      else { setItems(payload.requests); setError(""); }
    } catch {
      setError("개인정보 변경 요청 연결을 확인하고 있습니다.");
    }
  }, []);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { void load(); }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const act = async (id: string, action: string, needsMemo = false) => {
    const memo = needsMemo ? window.prompt(action === "REJECT" ? "반려 사유를 입력해주세요." : "PeopleON 반영 실패 사유를 입력해주세요.") : "";
    if (needsMemo && !memo) return;
    setBusyId(id);
    const response = await fetch(`/api/admin/personal-info-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, memo }),
    });
    const payload = await response.json();
    setBusyId("");
    if (!response.ok) return setError(payload.error || "요청을 처리하지 못했습니다.");
    await load();
  };

  const pendingCount = items.filter((item) => item.status === "PENDING").length;
  const reflectionCount = items.filter((item) => item.status === "APPROVED" && item.peopleOnStatus === "PENDING").length;

  return (
    <section id="personal-info-change-requests" className="rounded-[22px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-primary"><ShieldCheck className="size-5 text-ember-orange" aria-hidden="true" /> 개인정보 변경 요청</div>
          <h2 className="mt-2 text-2xl font-semibold text-midnight">승인과 PeopleON 반영 관리</h2>
          <p className="mt-2 text-sm leading-6 text-graphite">홈페이지 반영과 PeopleON 원장 반영을 별도로 기록합니다. 현재 PeopleON 반영은 관리자가 실제 처리 후 완료로 표시합니다.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-parchment-card px-4 text-xs font-semibold text-graphite"><RefreshCw className="size-4" aria-hidden="true" /> 새로고침</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-parchment-card p-4"><p className="text-xs text-ash">승인 대기</p><strong className="mt-1 block text-xl text-charcoal-primary">{pendingCount}건</strong></div>
        <div className="rounded-2xl bg-parchment-card p-4"><p className="text-xs text-ash">PeopleON 반영 대기</p><strong className="mt-1 block text-xl text-charcoal-primary">{reflectionCount}건</strong></div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-ember-orange/10 px-4 py-3 text-sm text-ember-orange">{error}</p>}
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="rounded-xl bg-parchment-card px-4 py-6 text-center text-sm text-ash">접수된 개인정보 변경 요청이 없습니다.</p>}
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-stone-surface p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-charcoal-primary">{item.memberName} · {item.label}</strong><span className="rounded-full bg-parchment-card px-2.5 py-1 text-[11px] font-semibold">{statusLabels[item.status] || item.status}</span><span className="rounded-full bg-sunburst-yellow/15 px-2.5 py-1 text-[11px] font-semibold">PeopleON {peopleOnLabels[item.peopleOnStatus] || item.peopleOnStatus}</span></div>
                <p className="mt-2 text-sm text-graphite">{item.previousValue} → {item.requestedValue}</p>
                <p className="mt-2 text-xs text-ash">{new Date(item.createdAt).toLocaleString("ko-KR")} · {item.hasPeopleOnBinding ? "PeopleON 고유 ID 연결됨" : "PeopleON 연결 확인 필요"}</p>
                {item.publicMemo && <p className="mt-2 text-xs leading-5 text-graphite">요청 메모: {item.publicMemo}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.status === "PENDING" && <>
                  <button disabled={busyId === item.id} onClick={() => void act(item.id, "APPROVE")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-midnight px-3 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle2 className="size-3.5" aria-hidden="true" /> 승인</button>
                  <button disabled={busyId === item.id} onClick={() => void act(item.id, "REJECT", true)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ember-orange/10 px-3 text-xs font-semibold text-ember-orange disabled:opacity-50"><XCircle className="size-3.5" aria-hidden="true" /> 반려</button>
                </>}
                {item.status === "APPROVED" && item.peopleOnStatus === "PENDING" && <>
                  <button disabled={busyId === item.id} onClick={() => void act(item.id, "PEOPLEON_COMPLETED")} className="inline-flex h-9 items-center rounded-full bg-meadow-green/10 px-3 text-xs font-semibold text-charcoal-primary disabled:opacity-50">PeopleON 반영 완료</button>
                  <button disabled={busyId === item.id} onClick={() => void act(item.id, "PEOPLEON_FAILED", true)} className="inline-flex h-9 items-center rounded-full bg-parchment-card px-3 text-xs font-semibold text-graphite disabled:opacity-50">반영 실패 기록</button>
                </>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
