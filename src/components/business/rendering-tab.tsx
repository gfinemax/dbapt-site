"use client";

import Image from "next/image";

export function RenderingTab() {
  return (
    <div className="stone-card overflow-hidden rounded-2xl border border-stone-surface bg-white">
      <div className="border-b border-stone-surface p-5 sm:p-6">
        <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange uppercase tracking-wider">
          Rendering
        </span>
        <h3 className="mt-3 text-base font-bold text-charcoal-primary">조감도</h3>
        <p className="mt-2 text-xs leading-relaxed text-graphite">
          실제 색채, 외관, 조경, 시설 배치는 인허가와 실시설계 과정에서 변경될 수 있습니다.
        </p>
      </div>
      <div className="bg-[#f8f7f4] p-3 sm:p-5">
        <Image
          src="/assets/business/plan-20251030/rendering-aerial-250801.jpg"
          alt="대방동 지역주택조합 아파트 조감도"
          width={2275}
          height={1217}
          sizes="(max-width: 768px) 100vw, 896px"
          className="h-auto w-full rounded-xl border border-stone-surface/60 object-contain"
          priority
        />
      </div>
    </div>
  );
}
