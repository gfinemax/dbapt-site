"use client";

const steps = [
  {
    title: "조합원 모집",
    detail: "예비 조합원 모집과 조합규약, 사업계획 확정 절차를 진행했습니다.",
    completed: true,
  },
  {
    title: "추진위원회 구성",
    detail: "대의원과 감사 등 추진위원회 구성을 통해 조합 운영 체계를 마련했습니다.",
    completed: true,
  },
  {
    title: "조합설립인가",
    detail: "조합설립총회 이후 조합설립인가를 완료한 단계입니다.",
    completed: true,
  },
  {
    title: "지구단위계획 수립",
    detail: "대방동 11-103번지 일원 지구단위계획 수립을 완료한 단계입니다.",
    current: true,
  },
  {
    title: "건축심의 (2027.3 예정)",
    detail: "향후 추진 계획상 건축심의 예정 단계입니다.",
  },
  {
    title: "조합총회 / 추가 조합원 모집",
    detail: "건축심의 이후 조합총회와 추가 조합원 모집 절차를 진행합니다.",
  },
  {
    title: "주택건설사업계획 신청 / 승인 및 고시",
    detail: "사업계획 신청과 승인, 고시 절차를 진행하는 단계입니다.",
  },
  {
    title: "건축물철거 멸실신고 / 착공신고",
    detail: "철거 멸실신고, 조합주택 시공보증, 착공신고가 이어집니다.",
  },
  {
    title: "일반분양 / 사용검사",
    detail: "일반분양과 사용검사 절차를 진행합니다.",
  },
  {
    title: "조합 청산 및 해산",
    detail: "준공 이후 조합 청산과 해산 절차로 마무리합니다.",
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
          <h3 className="mt-3 text-base font-bold text-charcoal-primary">향후 추진 계획</h3>
          <p className="mt-2 text-xs leading-relaxed text-graphite">
            사업계획서의 단계별 추진 계획을 기준으로 공개 가능한 범위에서 현재 단계와 이후 절차를 정리했습니다.
          </p>
        </div>

        <ol className="relative ml-3 space-y-4 border-l border-stone-surface pl-6">
          {steps.map((step, index) => {
            const isActive = step.completed || step.current;

            return (
              <li
                key={step.title}
                className={`relative rounded-2xl border p-4 ${
                  isActive
                    ? "border-ember-orange/30 bg-ember-orange/5"
                    : "border-stone-surface bg-[#f8f7f4]"
                }`}
              >
                <span
                  className={`absolute -left-[35px] top-5 flex size-4 items-center justify-center rounded-full border-2 bg-white ${
                    isActive ? "border-ember-orange" : "border-stone-surface"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isActive ? "bg-ember-orange" : "bg-ash"}`} />
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isActive
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
            );
          })}
        </ol>
      </div>

    </div>
  );
}
