"use client";

import Image from "next/image";

const planSpecs = [
  { label: "주용도", value: "공동주택 및 부대복리, 사회복지시설" },
  { label: "건폐율", value: "23.35%" },
  { label: "용적률", value: "200.73%" },
  { label: "규모", value: "지하3층 / 지상20층" },
  { label: "건축한계선", value: "6m, 3m 보도형 전면공지" },
  { label: "사회복지시설", value: "지상2층, 742㎡" },
];

const welfareSummary = [
  { label: "위치", value: "동작구 대방동 11-103번지 일원" },
  { label: "용도", value: "사회복지시설" },
  { label: "규모", value: "지상 2층" },
  { label: "연면적", value: "742.0㎡" },
];

const welfareRows = [
  {
    floor: "지상1층",
    totalArea: "354.0",
    privateArea: "258.95",
    sharedArea: "95.05",
    use: "상담실, 강당",
  },
  {
    floor: "지상2층",
    totalArea: "388.0",
    privateArea: "299.60",
    sharedArea: "88.40",
    use: "작업장",
  },
  {
    floor: "소계",
    totalArea: "742.0",
    privateArea: "558.55",
    sharedArea: "183.45",
    use: "-",
  },
];

export function PlanTab() {
  return (
    <div className="space-y-8">
      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="border-b border-stone-surface pb-4 mb-6">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[10px] font-bold text-sky-blue uppercase tracking-wider mb-2">
            Architecture Plan
          </span>
          <h3 className="text-base font-bold text-charcoal-primary">
            건축계획(안) 및 배치도
          </h3>
          <p className="text-xs text-graphite/80 mt-1">
            사업계획서의 건축계획 수치와 배치도 중 공개 안내에 필요한 항목을 정리했습니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planSpecs.map((spec) => (
            <div key={spec.label} className="rounded-xl border border-stone-surface/40 bg-[#f8f7f4] p-4">
              <span className="text-[10px] font-bold text-ash">{spec.label}</span>
              <p className="mt-2 text-xs sm:text-sm font-bold leading-snug text-charcoal-primary">
                {spec.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-stone-surface bg-[#f8f7f4] p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-meadow-green/10 px-3 py-1 text-[10px] font-bold text-meadow-green uppercase tracking-wider">
                Welfare Facility
              </span>
              <h4 className="mt-3 text-sm font-bold text-charcoal-primary">
                사회복지시설 계획
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-graphite">
                사업계획서에 수록된 사회복지시설의 위치, 규모, 층별 면적과 용도를 텍스트로 정리했습니다.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {welfareSummary.map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-surface bg-white p-4">
                <span className="text-[10px] font-bold text-ash">{item.label}</span>
                <p className="mt-2 text-xs font-bold leading-snug text-charcoal-primary sm:text-sm">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-stone-surface bg-white">
            <table
              aria-label="사회복지시설 층별 계획"
              className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-xs"
            >
              <thead className="bg-[#f8f7f4] text-ash">
                <tr>
                  <th className="border-b border-stone-surface px-3 py-3 font-bold">층</th>
                  <th className="border-b border-stone-surface px-3 py-3 font-bold">연면적(㎡)</th>
                  <th className="border-b border-stone-surface px-3 py-3 font-bold">전용(㎡)</th>
                  <th className="border-b border-stone-surface px-3 py-3 font-bold">공용(㎡)</th>
                  <th className="border-b border-stone-surface px-3 py-3 font-bold">용도</th>
                </tr>
              </thead>
              <tbody>
                {welfareRows.map((row) => (
                  <tr key={row.floor} className="text-charcoal-primary">
                    <th className="border-b border-stone-surface/70 px-3 py-3 font-bold">
                      {row.floor}
                    </th>
                    <td className="border-b border-stone-surface/70 px-3 py-3">{row.totalArea}</td>
                    <td className="border-b border-stone-surface/70 px-3 py-3">{row.privateArea}</td>
                    <td className="border-b border-stone-surface/70 px-3 py-3">{row.sharedArea}</td>
                    <td className="border-b border-stone-surface/70 px-3 py-3 font-semibold">
                      {row.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-graphite">
            세부 시설 구성과 운영 방식은 향후 인허가 및 관계기관 협의 과정에서 조정될 수 있습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="overflow-hidden rounded-2xl border border-stone-surface bg-[#f8f7f4]">
            <div className="relative min-h-[360px] sm:min-h-[520px] bg-white">
              <Image
                src="/assets/business/plan-20251030/architecture-plan-diagram-page-19.png"
                alt="2025년 10월 30일 사업계획서 건축계획안"
                fill
                className="object-contain object-top"
                sizes="(max-width: 1024px) 100vw, 360px"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-surface bg-[#f8f7f4]">
            <div className="relative min-h-[260px] sm:min-h-[520px] bg-white">
              <Image
                src="/assets/business/plan-20251030/site-layout-page-20.png"
                alt="2025년 10월 30일 사업계획서 배치도"
                fill
                className="object-contain object-top"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
