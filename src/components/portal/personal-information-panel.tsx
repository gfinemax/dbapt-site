"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Check,
  ChevronRight,
  CircleCheckBig,
  FileCheck2,
  History,
  House,
  LockKeyhole,
  Phone,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import type { Document } from "./document-table";
import type { ContributionDashboardView } from "@/lib/contribution-types";

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
    accountCreatedAt: string;
    memberStatus: string;
    lastConfirmedAt: string | null;
    updatedAt: string | null;
    peopleOnSyncedAt: string | null;
    hasPeopleOnBinding: boolean;
    peopleOn: {
      status: "CONNECTED" | "NOT_CONFIGURED" | "NOT_FOUND" | "UNAVAILABLE";
      memberNumber: string | null;
      joinedAt: string | null;
      certificateStatus: string;
      certificateNumberSuffix: string | null;
    };
  };
  requests: ChangeRequest[];
};

const statusLabel: Record<string, string> = { PENDING: "확인 중", APPROVED: "반영 완료", REJECTED: "반려", CANCELLED: "취소" };
const peopleOnLabel: Record<string, string> = {
  NOT_REQUIRED: "PeopleON 반영 불필요",
  PENDING: "PeopleON 반영 대기",
  COMPLETED: "PeopleON 반영 완료",
  FAILED: "PeopleON 확인 필요",
};
const booleanFields = new Set(["notificationSmsOptIn", "notificationEmailOptIn"]);
const memberFields = ["name", "coOwner", "memberStatus"];
const housingFields = ["selectedUnit", "buildingUnit"];
const contactFields = ["phone", "email", "address", "mailingAddress", "notificationSmsOptIn", "notificationEmailOptIn"];

function formatDate(value: string | null, withTime = false) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(value));
}

function InfoRow({ label, value, pending }: { label: string; value: string; pending?: boolean }) {
  return (
    <div className="flex min-h-9 items-start justify-between gap-5 border-b border-stone-surface/70 py-2.5 last:border-0">
      <dt className="shrink-0 text-sm text-ash">{label}</dt>
      <dd className="text-right text-sm font-medium text-charcoal-primary">
        {value}
        {pending && <span className="ml-2 inline-flex rounded-full bg-deep-amber/10 px-2 py-0.5 text-[10px] font-semibold text-deep-amber">확인 중</span>}
      </dd>
    </div>
  );
}

function InfoCard({ icon, title, description, children, action, wide = false }: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={`rounded-[20px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-6 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-parchment-card text-charcoal-primary">{icon}</span>
        <div><h3 className="font-semibold text-midnight">{title}</h3><p className="mt-1 text-xs leading-5 text-ash">{description}</p></div>
      </div>
      <dl className="mt-4">{children}</dl>
      {action && <div className="mt-4 border-t border-stone-surface pt-4">{action}</div>}
    </article>
  );
}

export function PersonalInformationPanel({ documents = [], contributionDashboard = null }: {
  documents?: Document[];
  contributionDashboard?: ContributionDashboardView | null;
}) {
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ProfileField | null>(null);
  const [pickerFields, setPickerFields] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/me/profile", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) setError(payload.error || "개인정보를 불러오지 못했습니다.");
      else { setData(payload); setError(""); }
    } catch { setError("개인정보 연결을 확인하고 있습니다. 잠시 후 다시 시도해주세요."); }
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

  const field = (name: string) => data?.profile.fields.find((item) => item.field === name);
  const value = (name: string, fallback = "등록되지 않음") => field(name)?.value || fallback;
  const pending = (name: string) => Boolean(data?.requests.some((item) => item.field === name && item.status === "PENDING"));
  const pendingCount = data?.requests.filter((item) => item.status === "PENDING").length || 0;
  const peopleOnConnected = data?.profile.peopleOn.status === "CONNECTED";
  const needsConnectionCheck = Boolean(data && !peopleOnConnected);
  const openPicker = (fields: string[]) => setPickerFields(fields.filter((name) => field(name)));
  const actionButton = (label: string, fields: string[]) => (
    <button type="button" onClick={() => openPicker(fields)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember-orange focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
      {label}<ChevronRight className="size-4" aria-hidden="true" />
    </button>
  );

  return (
    <section id="member-profile" tabIndex={-1} className="scroll-mt-6">
      <div className="rounded-[22px] bg-parchment-card p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleCheckBig className={`mt-0.5 size-6 shrink-0 ${pendingCount || needsConnectionCheck ? "text-deep-amber" : "text-safe-green"}`} aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-ash">내 정보</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-midnight sm:text-2xl">
                {pendingCount ? "요청한 정보 변경을 확인하고 있어요" : needsConnectionCheck ? "PeopleON 정보를 확인하고 있어요" : "조합원 정보가 정상적으로 등록되어 있어요"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-graphite">
                {pendingCount ? `${pendingCount}건을 사무국에서 확인 중이며 처리 결과는 변경 이력에 남아요.` : needsConnectionCheck ? data?.profile.hasPeopleOnBinding ? "원장 연결을 일시적으로 확인하지 못했어요. 홈페이지에 저장된 정보는 그대로 유지됩니다." : "연결된 PeopleON 고유 ID가 없어 홈페이지에 저장된 정보를 우선 보여드려요." : "PeopleON 원장과 홈페이지 정보를 함께 확인하고, 달라진 내용이 있을 때 요청해 주세요."}
              </p>
            </div>
          </div>
          <button type="button" onClick={confirmProfile} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-4 text-xs font-semibold text-charcoal-primary shadow-[inset_0_0_0_1px_var(--stone-surface)]">
            <Check className="size-4" aria-hidden="true" /> 정보 확인 완료
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-ember-orange/10 px-4 py-3 text-sm text-ember-orange">{error}</p>}
      {loading && <p className="mt-5 text-sm text-ash">조합원 정보를 안전하게 불러오는 중입니다.</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <InfoCard icon={<UserRound className="size-4" />} title="조합원 정보" description="조합원 원장을 기준으로 확인하는 정보예요." action={actionButton("정보 정정 요청", memberFields)}>
              <InfoRow label="조합원명" value={value("name")} pending={pending("name")} />
              <InfoRow label="조합원 번호" value={data.profile.peopleOn.memberNumber || (peopleOnConnected ? "원장 번호 미등록" : "사무국 확인 대기")} />
              <InfoRow label={data.profile.peopleOn.joinedAt ? "가입일" : "홈페이지 가입일"} value={formatDate(data.profile.peopleOn.joinedAt || data.profile.accountCreatedAt)} />
              <InfoRow label="조합원 상태" value={value("memberStatus")} pending={pending("memberStatus")} />
              <InfoRow label="공동명의 여부" value={value("coOwner", "등록된 공동명의 없음")} pending={pending("coOwner")} />
            </InfoCard>

            <InfoCard icon={<House className="size-4" />} title="주택 신청 정보" description="신청 및 배정 상태를 간단히 보여드려요." action={actionButton("주택 정보 정정 요청", housingFields)}>
              {field("selectedUnit") && <InfoRow label="신청 평형" value={value("selectedUnit")} pending={pending("selectedUnit")} />}
              <InfoRow label="배정 동·호수" value={value("buildingUnit")} pending={pending("buildingUnit")} />
              <InfoRow label="배정 상태" value={value("buildingUnit") === "등록되지 않음" ? "배정 전 또는 확인 대기" : "배정 정보 등록"} />
              <InfoRow label="납부자료 상태" value={contributionDashboard?.dataStatus === "SYNCED" ? "납부자료 반영" : "납부자료 반영 대기"} />
            </InfoCard>

            <InfoCard icon={<Phone className="size-4" />} title="연락처" description="조합 안내를 받을 연락처와 수신 설정이에요." action={actionButton("연락처 변경", contactFields)}>
              <InfoRow label="휴대전화" value={value("phone")} pending={pending("phone")} />
              <InfoRow label="이메일" value={value("email")} pending={pending("email")} />
              <InfoRow label="주소" value={value("address")} pending={pending("address")} />
              <InfoRow label="우편물 수령지" value={value("mailingAddress")} pending={pending("mailingAddress")} />
              <InfoRow label="안내 수신" value={`문자 ${value("notificationSmsOptIn")} · 이메일 ${value("notificationEmailOptIn")}`} />
              <InfoRow label="최근 연락처 변경" value={formatDate(data.profile.updatedAt)} />
            </InfoCard>

            <InfoCard icon={<FileCheck2 className="size-4" />} title="서류 및 신청 현황" description="발급 문서와 진행 중인 요청을 확인하세요." action={<Link href="/library" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember-orange">서류발급으로 이동<ChevronRight className="size-4" aria-hidden="true" /></Link>}>
              <InfoRow label="확인 가능한 문서" value={`${documents.length}건`} />
              <InfoRow label="최근 문서" value={documents[0]?.title || "등록된 문서 없음"} />
              <InfoRow label="가입신청필증" value={`${data.profile.peopleOn.certificateStatus}${data.profile.peopleOn.certificateNumberSuffix ? ` · 끝 ${data.profile.peopleOn.certificateNumberSuffix}` : ""}`} />
              <InfoRow label="진행 중인 정정·변경" value={pendingCount ? `${pendingCount}건 확인 중` : "없음"} />
            </InfoCard>

            <InfoCard wide icon={<LockKeyhole className="size-4" />} title="보안 설정" description="계정 보호 상태와 개인정보 이용 기록이에요.">
              <div className="grid gap-x-8 lg:grid-cols-2">
                <div><InfoRow label="로그인 상태" value="보호된 현재 세션" /><InfoRow label="비밀번호 변경" value="상단 계정 메뉴에서 가능" /></div>
                <div><InfoRow label="최근 정보 확인" value={formatDate(data.profile.lastConfirmedAt, true)} /><InfoRow label="개인정보 변경 이력" value={`${data.requests.length}건`} /></div>
              </div>
            </InfoCard>
          </div>

          <details className="mt-5 rounded-[20px] bg-white shadow-[inset_0_0_0_1px_var(--stone-surface)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-charcoal-primary marker:content-none">
              <span className="flex items-center gap-2"><History className="size-4 text-ash" aria-hidden="true" />개인정보 변경 이력 <span className="text-xs font-normal text-ash">{data.requests.length}건</span></span>
              <ChevronRight className="size-4 text-ash" aria-hidden="true" />
            </summary>
            <div className="border-t border-stone-surface p-5">
              <div className="flex justify-end"><button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-graphite"><RefreshCw className="size-3.5" aria-hidden="true" />새로고침</button></div>
              <div className="mt-3 space-y-2">
                {data.requests.length === 0 && <p className="rounded-xl bg-parchment-card px-4 py-5 text-center text-sm text-ash">아직 개인정보 변경 이력이 없습니다.</p>}
                {data.requests.slice(0, 10).map((item) => <article key={item.id} className="rounded-xl border border-stone-surface px-4 py-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{item.label}</strong><span className="rounded-full bg-parchment-card px-2.5 py-1 text-[11px] font-semibold">{statusLabel[item.status] || item.status}</span></div><p className="mt-2 text-xs text-graphite">{item.previousValue} → {item.requestedValue}</p><div className="mt-2 flex flex-wrap gap-4 text-[11px] text-ash"><span>{formatDate(item.createdAt, true)}</span><span>{peopleOnLabel[item.peopleOnStatus] || item.peopleOnStatus}</span></div>{item.publicMemo && <p className="mt-2 text-xs leading-5 text-graphite">{item.publicMemo}</p>}</article>)}
              </div>
            </div>
          </details>
        </>
      )}

      {pickerFields && data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPickerFields(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="personal-info-picker-title" className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-ember-orange">변경할 정보 선택</p><h3 id="personal-info-picker-title" className="mt-1 text-xl font-semibold text-midnight">어떤 정보가 달라졌나요?</h3></div><button type="button" onClick={() => setPickerFields(null)} className="inline-flex size-9 items-center justify-center rounded-full bg-parchment-card" aria-label="항목 선택 닫기"><X className="size-4" /></button></div>
            <div className="mt-5 space-y-2">{pickerFields.map((name) => { const item = field(name); if (!item) return null; const isPending = pending(name); return <button key={name} type="button" disabled={isPending} onClick={() => { setPickerFields(null); setEditing(item); }} className="flex w-full items-center justify-between rounded-xl border border-stone-surface px-4 py-3 text-left text-sm font-medium disabled:opacity-50"><span>{item.label}{isPending && <span className="ml-2 text-xs text-deep-amber">확인 중</span>}</span><ChevronRight className="size-4 text-ash" /></button>; })}</div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="personal-info-dialog-title" className="w-full max-w-lg rounded-[22px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-ember-orange">개인정보 변경 요청</p><h3 id="personal-info-dialog-title" className="mt-1 text-xl font-semibold text-midnight">{editing.label}</h3></div><button type="button" onClick={() => setEditing(null)} className="inline-flex size-9 items-center justify-center rounded-full bg-parchment-card" aria-label="수정 요청 닫기"><X className="size-4" /></button></div>
            <p className="mt-3 text-sm leading-6 text-graphite">현재 표시값은 {editing.value}입니다. 새 정보는 사무국 확인 후 반영되고, 처리 날짜와 이전 내용이 변경 이력에 남습니다.</p>
            <form onSubmit={submitChange} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-charcoal-primary">변경할 값{booleanFields.has(editing.field) ? <select name="value" required className="mt-2 h-11 w-full rounded-xl border border-stone-surface bg-white px-3"><option value="true">수신</option><option value="false">수신 안 함</option></select> : <input name="value" type={editing.field === "email" ? "email" : "text"} required maxLength={300} className="mt-2 h-11 w-full rounded-xl border border-stone-surface px-3 outline-none focus:border-ember-orange" />}</label>
              <label className="block text-sm font-medium text-charcoal-primary">정정 사유 또는 참고사항<textarea name="memo" maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-stone-surface p-3 outline-none focus:border-ember-orange" /></label>
              {contactFields.includes(editing.field) && <p className="text-xs leading-5 text-ash">연락처 본인인증은 다음 단계에서 연동할 예정입니다. 현재는 사무국 확인 후 PeopleON 반영 상태까지 기록합니다.</p>}
              <button disabled={submitting} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "접수 중…" : "변경 요청 접수"}</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
