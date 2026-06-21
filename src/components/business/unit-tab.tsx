"use client";

import Image from "next/image";

const unitPlans = [
  {
    src: "/assets/business/plan-20251030/unit-48a.png",
    alt: "48A 타입 단위세대 평면도",
    width: 2498,
    height: 1639,
    priority: true,
  },
  {
    src: "/assets/business/plan-20251030/unit-59a.png",
    alt: "59A 타입 단위세대 평면도",
    width: 2498,
    height: 1639,
    priority: true,
  },
  {
    src: "/assets/business/plan-20251030/unit-59b.png",
    alt: "59B 타입 단위세대 평면도",
    width: 2498,
    height: 1639,
    priority: true,
  },
  {
    src: "/assets/business/plan-20251030/unit-84a.png",
    alt: "84A 타입 단위세대 평면도",
    width: 2617,
    height: 1639,
    priority: true,
  },
  {
    src: "/assets/business/plan-20251030/unit-84b.png",
    alt: "84B 타입 단위세대 평면도",
    width: 2532,
    height: 1639,
    priority: true,
  },
];

export function UnitTab() {
  return (
    <div className="space-y-8">
      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="flex flex-col gap-4 border-b border-stone-surface pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[10px] font-bold text-sky-blue uppercase tracking-wider">
              Unit Plan
            </span>
            <h3 className="mt-3 text-base font-bold text-charcoal-primary">
              단위세대 평면도
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-graphite">
              사업계획서에 수록된 48A, 59A, 59B, 84A, 84B 타입의 단위세대 평면도입니다.
              향후 경미한 변경과 인허가 진행 과정에서 세부 면적과 배치는 조정될 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f8f7f4] px-5 py-4 text-left sm:min-w-36 sm:text-center">
            <span className="text-[10px] font-bold text-ash">수록 타입</span>
            <strong className="mt-1 block text-2xl font-extrabold text-charcoal-primary">
              5개
            </strong>
          </div>
        </div>

        <div data-testid="unit-plan-gallery" className="mt-6 grid grid-cols-1 gap-6">
          {unitPlans.map((unit) => (
            <article
              key={unit.src}
              className="overflow-hidden rounded-2xl border border-stone-surface bg-white"
            >
              <div
                data-testid="unit-plan-image-frame"
                className="bg-white p-3 sm:p-5"
              >
                <Image
                  src={unit.src}
                  alt={unit.alt}
                  width={unit.width}
                  height={unit.height}
                  sizes="(min-width: 1024px) 768px, calc(100vw - 64px)"
                  priority={unit.priority}
                  className="h-auto w-full rounded-xl border border-stone-surface/60 object-contain"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
