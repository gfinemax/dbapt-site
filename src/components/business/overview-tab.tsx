"use client";

export function OverviewTab() {
  const specs = [
    { label: "사업명", value: "대방동 지역주택조합 공동주택 신축공사" },
    { label: "대지 위치", value: "서울특별시 동작구 대방동 11-103번지 일원" },
    { label: "대지 면적", value: "13,167.22㎡ (변경 계획안)" },
    { label: "연면적", value: "41,602.59㎡ (지상 26,554.59㎡ / 지하 15,048.00㎡)" },
    { label: "건축 규모", value: "지하 3층 ~ 지상 20층" },
    { label: "용적률", value: "200.76% (변경 계획안)" },
    { label: "총 세대수", value: "270세대 (분양 252세대 / 공공 18세대)" },
    { label: "주차 대수", value: "353대 (세대당 1.31대)" },
    { label: "자료 기준", value: "2025.09.06 설명회 자료" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center relative overflow-hidden flex flex-col justify-between min-h-32">
          <div className="absolute top-0 inset-x-0 h-1 bg-meadow-green" />
          <span className="text-[10px] text-ash font-bold tracking-wider">지구단위계획</span>
          <span className="text-lg sm:text-xl font-extrabold text-meadow-green block mt-2">변경안 검토</span>
          <div className="mt-3 text-[9px] text-ash font-medium">8필지 추가 계획 반영</div>
        </div>

        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center relative overflow-hidden flex flex-col justify-between min-h-32">
          <div className="absolute top-0 inset-x-0 h-1 bg-sky-blue" />
          <span className="text-[10px] text-ash font-bold tracking-wider">세대 계획</span>
          <span className="text-lg sm:text-xl font-extrabold text-sky-blue block mt-2">270세대</span>
          <div className="mt-3 text-[9px] text-ash font-medium">기존안 대비 16세대 증가</div>
        </div>

        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center relative overflow-hidden flex flex-col justify-between min-h-32">
          <div className="absolute top-0 inset-x-0 h-1 bg-ember-orange" />
          <span className="text-[10px] text-ash font-bold tracking-wider">주차 계획</span>
          <span className="text-lg sm:text-xl font-extrabold text-ember-orange block mt-2">353대</span>
          <div className="mt-3 text-[9px] text-ash font-medium">세대당 1.31대</div>
        </div>
      </div>

      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <h3 className="text-base font-bold text-charcoal-primary mb-6">
          건축계획 변경안 주요 수치
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {specs.map((spec, i) => (
            <div key={i} className="soft-panel bg-[#f8f7f4] p-4.5 rounded-xl border border-stone-surface/40 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-ash block mb-1.5 select-none">
                {spec.label}
              </span>
              <span className="text-xs sm:text-[13.5px] font-bold text-charcoal-primary leading-normal">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="stone-card bg-[#f8f7f4] p-6 sm:p-8 rounded-2xl border border-stone-surface flex items-start gap-4">
        <span className="mt-0.5 size-2.5 rounded-full bg-ember-orange shrink-0" />
        <div className="space-y-2">
          <h4 className="text-[14.5px] font-bold text-charcoal-primary">
            자료 표기 기준 안내
          </h4>
          <p className="text-xs text-graphite/95 leading-relaxed font-normal">
            본 페이지는 첨부된 2025년 9월 6일 설명회 자료에서 확인되는 변경 계획안을 기준으로 정리했습니다.
            지구단위계획구역 면적과 대지면적은 자료 내 표의 기준이 달라 각각 별도 수치로 표시될 수 있으며,
            인허가와 분양 과정에서 최종 수치는 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
