"use client";

import Image from "next/image";

const flows = [
  {
    title: "차량동선계획",
    desc: "등용로변 차량 주출입구와 단지 내부 차량 흐름을 사업계획서 도면 기준으로 안내합니다.",
    src: "/assets/business/plan-20251030/vehicle-circulation-uploaded.png",
    alt: "차량동선계획 도면",
  },
  {
    title: "보행동선계획",
    desc: "보행자 출입구와 공공보행 흐름을 분리해 확인할 수 있는 계획 도면입니다.",
    src: "/assets/business/plan-20251030/pedestrian-circulation-uploaded.png",
    alt: "보행동선계획 도면",
  },
];

const diagramSize = {
  width: 1994,
  height: 1280,
};

export function MobilityTab() {
  return (
    <div className="space-y-6">
      {flows.map((flow) => (
        <article key={flow.title} className="stone-card overflow-hidden rounded-2xl border border-stone-surface bg-white">
          <div className="border-b border-stone-surface p-5 sm:p-6">
            <h3 className="text-base font-bold text-charcoal-primary">{flow.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-graphite">{flow.desc}</p>
          </div>
          <div className="bg-white p-4 sm:p-6">
            <div
              data-testid="circulation-map-frame"
              className="overflow-hidden rounded-xl border border-stone-surface/70 bg-[#f8f7f4] p-2 sm:p-3"
            >
              <Image
                src={flow.src}
                alt={flow.alt}
                width={diagramSize.width}
                height={diagramSize.height}
                sizes="(max-width: 768px) 100vw, 896px"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
