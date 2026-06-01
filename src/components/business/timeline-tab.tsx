"use client";

const steps = [
  {
    title: "조합원 모집신고",
    detail: "모집신고 후 공개모집 및 주택건설대지 50% 이상 토지사용 승낙서 확보",
  },
  {
    title: "조합설립인가",
    detail: "주택건설대지 80% 이상 토지사용 승낙서와 15% 이상 소유권 확보",
  },
  {
    title: "지구단위계획 수립",
    detail: "주택건설대지 95% 이상 소유권 확보",
  },
  {
    title: "지구단위계획 변경",
    detail: "8필지 추가 계획",
    current: true,
  },
  {
    title: "건축심의",
    detail: "구역 내 토지면적 2/3 이상 동의",
  },
  {
    title: "사업계획승인",
    detail: "주택건설대지 95% 이상 소유권 확보",
  },
  {
    title: "착공",
    detail: "사업계획승인 후 5년 이내",
  },
  {
    title: "입주자모집 승인",
    detail: "잔여세대 분양",
  },
  {
    title: "사용검사",
    detail: "준공",
  },
  {
    title: "청산",
    detail: "조합 해산",
  },
];

export function TimelineTab() {
  return (
    <div className="space-y-8">
      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange">
            지역주택조합사업 추진절차
          </span>
          <h3 className="mt-3 text-base font-bold text-charcoal-primary">향후 일정 및 절차</h3>
          <p className="mt-2 text-xs leading-relaxed text-graphite">
            설명회 자료의 추진절차 도표를 기준으로 공개 가능한 범위에서 현재 검토 단계와 이후 절차를 정리했습니다.
          </p>
        </div>

        <ol className="relative ml-3 space-y-4 border-l border-stone-surface pl-6">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`relative rounded-2xl border p-4 ${
                step.current
                  ? "border-ember-orange/30 bg-ember-orange/5"
                  : "border-stone-surface bg-[#f8f7f4]"
              }`}
            >
              <span
                className={`absolute -left-[35px] top-5 flex size-4 items-center justify-center rounded-full border-2 bg-white ${
                  step.current ? "border-ember-orange" : "border-stone-surface"
                }`}
              >
                <span className={`size-1.5 rounded-full ${step.current ? "bg-ember-orange" : "bg-ash"}`} />
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    step.current
                      ? "bg-ember-orange text-white"
                      : "bg-white text-graphite border border-stone-surface"
                  }`}
                >
                  {index + 1}
                </span>
                <h4 className="text-sm font-bold text-charcoal-primary">{step.title}</h4>
              </div>
              <p className="mt-3 pl-10 text-xs leading-relaxed text-graphite">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="stone-card bg-[#f8f7f4] p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <h3 className="text-sm font-bold text-charcoal-primary">일정 표기 원칙</h3>
        <p className="mt-3 text-xs leading-relaxed text-graphite">
          첨부 자료에는 절차와 요건이 제시되어 있으나 단계별 확정 날짜는 별도로 표기되어 있지 않습니다.
          따라서 본 페이지에서는 날짜를 임의로 추가하지 않고, 자료에서 확인되는 절차명과 요건만 표시합니다.
        </p>
      </div>
    </div>
  );
}
