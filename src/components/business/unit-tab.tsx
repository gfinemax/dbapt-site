"use client";

import Image from "next/image";

const saleUnits = [
  { label: "48㎡ (19평형)", previous: "-", planned: "23세대", change: "증 23세대" },
  { label: "59㎡ (24평형)", previous: "125세대", planned: "128세대", change: "증 3세대" },
  { label: "74㎡ (30평형)", previous: "47세대", planned: "-", change: "감 47세대" },
  { label: "84㎡ (34평형)", previous: "64세대", planned: "102세대", change: "증 36세대" },
];

const publicUnits = [
  { label: "59㎡ (24평형)", previous: "12세대", planned: "13세대", change: "증 1세대" },
  { label: "74㎡ (30평형)", previous: "3세대", planned: "-", change: "감 3세대" },
  { label: "84㎡ (34평형)", previous: "3세대", planned: "5세대", change: "증 2세대" },
];

const premiumUnitPlans = [
  {
    title: "59㎡A",
    type: "확장형",
    households: "78세대",
    src: "/assets/business/units/unit-59a-premium.png",
    alt: "프리미엄 평형 정보 59㎡A 평면도",
    areas: [
      { label: "전용면적", value: "59.99㎡" },
      { label: "주거공용면적", value: "21.05㎡" },
      { label: "공급면적", value: "81.04㎡" },
      { label: "기타공용면적", value: "3.13㎡" },
      { label: "계약면적", value: "84.17㎡" },
    ],
  },
  {
    title: "59㎡B",
    type: "확장형",
    households: "18세대",
    src: "/assets/business/units/unit-59b-premium.png",
    alt: "프리미엄 평형 정보 59㎡B 평면도",
    areas: [
      { label: "전용면적", value: "59.99㎡" },
      { label: "주거공용면적", value: "21.05㎡" },
      { label: "공급면적", value: "81.04㎡" },
      { label: "기타공용면적", value: "3.13㎡" },
      { label: "계약면적", value: "84.17㎡" },
    ],
  },
  {
    title: "74㎡A",
    type: "확장형",
    households: "33세대",
    src: "/assets/business/units/unit-74a-premium.png",
    alt: "프리미엄 평형 정보 74㎡A 평면도",
    areas: [
      { label: "전용면적", value: "74.94㎡" },
      { label: "주거공용면적", value: "26.47㎡" },
      { label: "공급면적", value: "101.41㎡" },
      { label: "기타공용면적", value: "3.91㎡" },
      { label: "계약면적", value: "105.32㎡" },
    ],
  },
  {
    title: "84㎡",
    type: "확장형",
    households: "세대수 별도 표기 없음",
    src: "/assets/business/units/unit-84-premium.png",
    alt: "프리미엄 평형 정보 84㎡ 평면도",
    areas: [
      { label: "전용면적", value: "84.99㎡" },
      { label: "주거공용면적", value: "29.37㎡" },
      { label: "공급면적", value: "114.36㎡" },
      { label: "기타공용면적", value: "4.43㎡" },
      { label: "계약면적", value: "118.79㎡" },
    ],
  },
];

function UnitTable({
  title,
  rows,
  total,
}: {
  title: string;
  rows: typeof saleUnits;
  total: string;
}) {
  return (
    <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h3 className="text-base font-bold text-charcoal-primary">{title}</h3>
        <span className="rounded-full bg-[#f8f7f4] px-3 py-1 text-[11px] font-bold text-graphite">
          합계 {total}
        </span>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left text-xs">
          <thead>
            <tr className="text-ash">
              <th className="border-b border-stone-surface px-3 py-2 font-semibold">평형</th>
              <th className="border-b border-stone-surface px-3 py-2 font-semibold">기존안</th>
              <th className="border-b border-stone-surface px-3 py-2 font-semibold">변경 계획안</th>
              <th className="border-b border-stone-surface px-3 py-2 font-semibold">변경</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="text-charcoal-primary">
                <td className="border-b border-stone-surface/70 px-3 py-3 font-semibold">{row.label}</td>
                <td className="border-b border-stone-surface/70 px-3 py-3">{row.previous}</td>
                <td className="border-b border-stone-surface/70 px-3 py-3 font-semibold">{row.planned}</td>
                <td className="border-b border-stone-surface/70 px-3 py-3 text-graphite">{row.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-stone-surface bg-[#f8f7f4] p-4">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm text-charcoal-primary">{row.label}</strong>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-ember-orange">
                {row.change}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-graphite">
              <span>기존안: {row.previous}</span>
              <span className="font-bold text-charcoal-primary">변경안: {row.planned}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UnitTab() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center">
          <span className="text-[10px] font-bold text-ash">분양주택</span>
          <strong className="mt-2 block text-xl font-extrabold text-charcoal-primary">252세대</strong>
          <p className="mt-2 text-[11px] text-graphite">기존안 대비 16세대 증가</p>
        </div>
        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center">
          <span className="text-[10px] font-bold text-ash">공공주택</span>
          <strong className="mt-2 block text-xl font-extrabold text-charcoal-primary">18세대</strong>
          <p className="mt-2 text-[11px] text-graphite">총량 유지, 평형 구성 변경</p>
        </div>
        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center">
          <span className="text-[10px] font-bold text-ash">전체 세대수</span>
          <strong className="mt-2 block text-xl font-extrabold text-ember-orange">270세대</strong>
          <p className="mt-2 text-[11px] text-graphite">설명회 변경 계획안 기준</p>
        </div>
      </div>

      <UnitTable title="분양주택 평형별 계획" rows={saleUnits} total="252세대" />
      <UnitTable title="공공주택 평형별 계획" rows={publicUnits} total="18세대" />

      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="flex flex-col gap-4 border-b border-stone-surface pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[10px] font-bold text-sky-blue uppercase tracking-wider">
              Unit Detail
            </span>
            <h3 className="mt-3 text-base font-bold text-charcoal-primary">
              프리미엄 평형 정보
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-graphite">
              첨부 평형정보 이미지에 표기된 59㎡A, 59㎡B, 74㎡A, 84㎡ 타입의 면적과 평면도입니다. 세대계획 표와 구분되는 세부 타입 자료로 안내합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f8f7f4] px-5 py-4 text-left sm:min-w-36 sm:text-center">
            <span className="text-[10px] font-bold text-ash">첨부 평형도</span>
            <strong className="mt-1 block text-2xl font-extrabold text-charcoal-primary">
              4개 타입
            </strong>
          </div>
        </div>

        <div data-testid="premium-unit-gallery" className="mt-6 grid grid-cols-1 gap-6">
          {premiumUnitPlans.map((unit) => (
            <article
              key={unit.title}
              className="overflow-hidden rounded-2xl border border-stone-surface bg-[#f8f7f4]"
            >
              <div className="relative aspect-[5/4] bg-white">
                <Image
                  src={unit.src}
                  alt={unit.alt}
                  fill
                  sizes="(min-width: 1024px) 768px, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-ash">{unit.type}</span>
                    <h4 className="mt-1 text-lg font-extrabold text-charcoal-primary">
                      {unit.title}
                    </h4>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-graphite">
                    {unit.households}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-5">
                  {unit.areas.map((area) => (
                    <div key={`${unit.title}-${area.label}`}>
                      <dt className="text-[10px] font-bold text-ash">{area.label}</dt>
                      <dd className="mt-1 font-extrabold text-charcoal-primary">{area.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="stone-card bg-[#f8f7f4] p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <h3 className="text-sm font-bold text-charcoal-primary">평형 구성 변경 방향</h3>
        <p className="mt-3 text-xs leading-relaxed text-graphite">
          설명회 자료의 변경 계획안은 74㎡ 타입을 제외하고 48㎡, 59㎡, 84㎡ 중심으로 세대 구성을 재편합니다.
          분양주택은 236세대에서 252세대로 늘고, 공공주택은 18세대를 유지하는 것으로 제시되어 있습니다.
        </p>
      </div>
    </div>
  );
}
