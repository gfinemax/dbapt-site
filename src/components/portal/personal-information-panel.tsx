"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Check, Clock3, Pencil, RefreshCw, ShieldCheck, X } from "lucide-react";

type ProfileField = { field: string; label: string; value: string };
type ChangeRequest = {
  id: string;
  field: string;
  label: string;
  previousValue: string;
  requestedValue: string;
  status: string;
  peopleOnStatus: string;
  publicMemo: string | null;
  createdAt: string;
  resolvedAt: string | null;
};
type ProfilePayload = {
  profile: {
    fields: ProfileField[];
    lastConfirmedAt: string | null;
    updatedAt: string | null;
    peopleOnSyncedAt: string | null;
    hasPeopleOnBinding: boolean;
  };
  requests: ChangeRequest[];
};

const statusLabel: Record<string, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  CANCELLED: "취소",
};
const peopleOnLabel: Record<string, string> = {
  NOT_REQUIRED: "PeopleON 반영 불필요",
  PENDING: "PeopleON 반영 대기",
  COMPLETED: "PeopleON 반영 완료",
  FAILED: "PeopleON 확인 필요",
};
const booleanFields = new Set(["notificationSmsOptIn", "notificationEmailOptIn"]);

function formatDate(value: string | null) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function PersonalInformationPanel() {
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ProfileField | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/me/profile", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) setError(payload.error || "개인정보를 불러오지 못했습니다.");
      else {
        setData(payload);
        setError("");
      }
    } catch {
      setError("개인정보 연결을 확인하고 있습니다. 잠시 후 다시 시도해주세요.");
    }
    setLoading(false);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { void load(); }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const confirmProfile = async () => {
    const response = await fetch("/api/me/profile/confirm", { method: "POST" });
    if (!response.ok) return setError("정보 확인일을 기록하지 못했습니다.");
    await load();
  };

  const submitChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: editing.field, value: form.get("value"), memo: form.get("memo") }),
    });
    const payload = await response.json();
    setSubmitting(false);
    if (!response.ok) return setError(payload.error || "수정 요청을 접수하지 못했습니다.");
    setEditing(null);
    await load();
  };

  return (
    <section id="member-profile" tabIndex={-1} className="scroll-mt-6 rounded-[22px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-primary">
            <ShieldCheck className="size-5 text-ember-orange" aria-hidden="true" /> 내 정보
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight">조합원 정보 확인 및 정정</h2>
          <p className="mt-2 text-sm leading-6 text-graphite">변경 요청은 관리자 확인 후 반영되며, 처리 날짜와 이전 내용이 변경 이력에 남습니다.</p>
        </div>
        <button type="button" onClick={confirmProfile} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-midnight px-4 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <Check className="size-4" aria-hidden="true" /> 내 정보가 맞습니다
        </button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-ember-orange/10 px-4 py-3 text-sm text-ember-orange">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ash">개인정보를 안전하게 불러오는 중입니다.</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-3 rounded-2xl bg-parchment-card p-4 text-xs text-graphite sm:grid-cols-3">
            <div><span className="block text-ash">마지막 정보 확인</span><strong className="mt-1 block font-semibold text-charcoal-primary">{formatDate(data.profile.lastConfirmedAt)}</strong></div>
            <div><span className="block text-ash">마지막 수정</span><strong className="mt-1 block font-semibold text-charcoal-primary">{formatDate(data.profile.updatedAt)}</strong></div>
            <div><span className="block text-ash">PeopleON 연결</span><strong className="mt-1 block font-semibold text-charcoal-primary">{data.profile.hasPeopleOnBinding ? peopleOnLabel.COMPLETED : "관리자 연결 확인 필요"}</strong></div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.profile.fields.map((field) => {
              const pending = data.requests.some((item) => item.field === field.field && item.status === "PENDING");
              return (
                <article key={field.field} className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ash">{field.label}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-charcoal-primary">{field.value}</p>
                    </div>
                    <button type="button" disabled={pending} onClick={() => { setError(""); setEditing(field); }} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-parchment-card text-graphite disabled:cursor-not-allowed disabled:opacity-45" aria-label={`${field.label} 수정 요청`}>
                      {pending ? <Clock3 className="size-4" aria-hidden="true" /> : <Pencil className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {pending && <p className="mt-3 text-[11px] font-medium text-deep-amber">관리자 확인 중</p>}
                </article>
              );
            })}
          </div>

          <div className="mt-7 border-t border-stone-surface pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-charcoal-primary">변경 이력</h3>
                <p className="mt-1 text-xs text-ash">민감한 값은 마스킹되어 표시됩니다.</p>
              </div>
              <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-graphite"><RefreshCw className="size-3.5" aria-hidden="true" /> 새로고침</button>
            </div>
            <div className="mt-4 space-y-2">
              {data.requests.length === 0 && <p className="rounded-xl bg-parchment-card px-4 py-5 text-center text-sm text-ash">아직 개인정보 변경 이력이 없습니다.</p>}
              {data.requests.slice(0, 10).map((item) => (
                <article key={item.id} className="rounded-xl border border-stone-surface px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-charcoal-primary">{item.label}</strong>
                    <span className="rounded-full bg-parchment-card px-2.5 py-1 text-[11px] font-semibold text-graphite">{statusLabel[item.status] || item.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-graphite">{item.previousValue} → {item.requestedValue}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ash"><span>{formatDate(item.createdAt)}</span><span>{peopleOnLabel[item.peopleOnStatus] || item.peopleOnStatus}</span></div>
                  {item.publicMemo && <p className="mt-2 text-xs leading-5 text-graphite">{item.publicMemo}</p>}
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="personal-info-dialog-title" className="w-full max-w-lg rounded-[22px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-medium text-ember-orange">개인정보 수정 요청</p><h3 id="personal-info-dialog-title" className="mt-1 text-xl font-semibold text-midnight">{editing.label}</h3></div>
              <button type="button" onClick={() => setEditing(null)} className="inline-flex size-9 items-center justify-center rounded-full bg-parchment-card" aria-label="수정 요청 닫기"><X className="size-4" aria-hidden="true" /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-graphite">현재 표시값은 {editing.value}입니다. 새 정보는 관리자 확인 후 반영되며 PeopleON 반영 상태도 별도로 기록됩니다.</p>
            <form onSubmit={submitChange} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-charcoal-primary">변경할 값
                {booleanFields.has(editing.field) ? (
                  <select name="value" required className="mt-2 h-11 w-full rounded-xl border border-stone-surface bg-white px-3"><option value="true">수신</option><option value="false">수신 안 함</option></select>
                ) : (
                  <input name="value" type={editing.field === "email" ? "email" : editing.field === "birthDate" ? "date" : "text"} required maxLength={300} className="mt-2 h-11 w-full rounded-xl border border-stone-surface px-3 outline-none focus:border-ember-orange" />
                )}
              </label>
              <label className="block text-sm font-medium text-charcoal-primary">정정 사유 또는 참고사항
                <textarea name="memo" maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-stone-surface p-3 outline-none focus:border-ember-orange" />
              </label>
              <p className="text-xs leading-5 text-ash">성명·계좌·조합원 자격 같은 중요 정보는 사무국에서 증빙을 별도로 확인할 수 있어.</p>
              <button disabled={submitting} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "접수 중…" : "수정 요청 접수"}</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
