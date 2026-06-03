"use client";

import Image from "next/image";

export function PlanTab() {
  const planHighlights = [
    {
      label: "변경 조감도",
      value: "설명회 자료 14쪽",
      desc: "변경 설계(안)의 대표 조감도를 우선 노출합니다.",
    },
    {
      label: "당초 배치도",
      value: "설명회 자료 10쪽",
      desc: "101~105동, 출입구, 공공보행통로 등 배치 요소를 확인합니다.",
    },
    {
      label: "당초 조감도",
      value: "설명회 자료 12쪽",
      desc: "변경안과 비교하기 위한 기존 조감도 자료입니다.",
    },
  ];

  const comparisonImages = [
    {
      title: "당초 설계(안) 조감도",
      src: "/assets/business/briefing-render-original-page-12.png",
      alt: "2025년 설명회 자료 당초 설계안 조감도",
      desc: "설명회 자료 12쪽에 수록된 당초 설계안 조감도입니다.",
    },
  ];

  const layouts = [
    { title: "101~105동 배치 계획", desc: "설명회 배치도에는 101동부터 105동까지 공동주택 동 배치가 표시되어 있습니다." },
    { title: "등용로변 출입 체계", desc: "등용로를 따라 차량 주출입구와 보행자 출입구가 구분되어 표시됩니다." },
    { title: "근린생활시설·사회복지시설", desc: "동측 생활편의시설과 사회복지시설 계획을 배치도에서 함께 확인할 수 있습니다." },
    { title: "공공보행통로", desc: "단지 중앙부의 공공보행통로가 보행 흐름을 고려한 계획 요소로 표시되어 있습니다." },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {planHighlights.map((item) => (
          <div key={item.label} className="stone-card bg-white p-5 rounded-2xl border border-stone-surface">
            <span className="text-[10px] font-bold tracking-widest text-ash">
              {item.value}
            </span>
            <h3 className="mt-2 text-sm font-extrabold text-charcoal-primary">
              {item.label}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-graphite">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="border-b border-stone-surface pb-4 mb-6">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[10px] font-bold text-sky-blue uppercase tracking-wider mb-2">
            Plan View
          </span>
          <h3 className="text-base font-bold text-charcoal-primary">
            변경 설계(안) 조감도
          </h3>
          <p className="text-xs text-graphite/80 mt-1">
            첨부 설명회 자료에 수록된 변경 조감도를 대표 이미지로 반영했습니다.
          </p>
        </div>

        <div className="w-full rounded-2xl bg-[#f8f7f4] overflow-hidden border border-stone-surface select-none">
          <div className="relative h-[240px] sm:h-[440px] bg-[#f8f7f4]">
            <Image
              src="/assets/business/briefing-render-revised-page-14.png"
              alt="2025년 설명회 자료 변경 설계안 조감도"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
          <div className="border-t border-stone-surface bg-white p-4 sm:p-5">
            <span className="text-[10px] font-bold tracking-widest text-ash">
              설명회 자료 14쪽
            </span>
            <p className="mt-1 text-xs leading-relaxed text-graphite">
              변경 설계(안) 조감도 기준입니다. 인허가와 심의 과정에서 세부 형상과 배치는 변경될 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="overflow-hidden rounded-2xl border border-stone-surface bg-white">
            <div className="relative h-[220px] sm:h-[360px] bg-[#f8f7f4]">
              <Image
                src="/assets/business/briefing-layout-page-10.png"
                alt="2025년 설명회 자료 당초 설계안 배치도"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
            <div className="border-t border-stone-surface p-4 sm:p-5">
              <span className="text-[10px] font-bold tracking-widest text-ash">
                설명회 자료 10쪽
              </span>
              <h4 className="mt-1 text-xs sm:text-sm font-bold text-charcoal-primary leading-snug">
                당초 설계(안) 배치도
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-graphite">
                101~105동, 등용로변 출입 체계, 공공보행통로, 근린생활시설 및 사회복지시설 위치를 확인할 수 있는 배치도입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {comparisonImages.map((image) => (
            <div key={image.src} className="overflow-hidden rounded-2xl border border-stone-surface bg-white">
              <div className="relative h-[180px] sm:h-[260px] bg-[#f8f7f4]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 432px"
                />
              </div>
              <div className="border-t border-stone-surface p-4">
                <h4 className="text-xs sm:text-sm font-bold text-charcoal-primary leading-snug">
                  {image.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-graphite">
                  {image.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-xl bg-[#f8f7f4] px-4 py-3 text-[11px] leading-relaxed text-graphite border border-stone-surface/70">
          위 이미지는 2025.09.06 설명회 자료에서 추출한 참고 이미지입니다. 변경 설계(안) 조감도와 당초 설계(안) 배치도는 자료 기준을 설명하기 위한 이미지이며, 확정 조감도 또는 최종 인허가 도면으로 해석하면 안 됩니다.
        </p>
      </div>

      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="border-b border-stone-surface pb-4 mb-6">
          <span className="inline-flex rounded-full bg-meadow-green/10 px-3 py-1 text-[10px] font-bold text-meadow-green uppercase tracking-wider mb-2">
            Layout Notes
          </span>
          <h3 className="text-base font-bold text-charcoal-primary">
            단지배치도 확인 사항
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {layouts.map((layout, i) => (
            <div key={i} className="soft-panel bg-[#f8f7f4] p-5 rounded-xl border border-stone-surface/30">
              <h4 className="text-xs sm:text-sm font-bold text-charcoal-primary leading-snug">
                {layout.title}
              </h4>
              <p className="text-xs text-graphite/90 leading-relaxed mt-2 font-normal">
                {layout.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
