"use client";

export function OverviewTab() {
  const householdPlans = [
    {
      eyebrow: "District Unit Plan",
      title: "현재 지구단위계획 254세대",
      total: "254세대",
      formula: "236 + 18 = 254세대",
      summary: "현재 고시된 지구단위계획 기준 세대 구성입니다.",
      accentClass: "bg-meadow-green",
      totalClass: "text-meadow-green",
      groups: [
        {
          title: "분양주택 236세대",
          columns: ["평형", "기준안"],
          rows: [
            ["59㎡ (24평형)", "125세대"],
            ["74㎡ (30평형)", "47세대"],
            ["84㎡ (34평형)", "64세대"],
          ],
        },
        {
          title: "공공주택 18세대",
          columns: ["평형", "기준안"],
          rows: [
            ["59㎡ (24평형)", "12세대"],
            ["74㎡ (30평형)", "3세대"],
            ["84㎡ (34평형)", "3세대"],
          ],
        },
      ],
    },
    {
      eyebrow: "Minor Change Plan",
      title: "향후 경미한 변경 270세대 예정",
      total: "270세대 예정",
      formula: "252 + 18 = 270세대 예정",
      summary: "향후 경미한 변경으로 반영 예정인 세대 구성입니다.",
      accentClass: "bg-sky-blue",
      totalClass: "text-sky-blue",
      delta: "증 16세대",
      groups: [
        {
          title: "분양주택 252세대",
          columns: ["평형", "기존안", "변경 계획안", "변경"],
          rows: [
            ["48㎡ (19평형)", "-", "23세대", "증 23세대"],
            ["59㎡ (24평형)", "125세대", "128세대", "증 3세대"],
            ["74㎡ (30평형)", "47세대", "-", "감 47세대"],
            ["84㎡ (34평형)", "64세대", "101세대", "증 37세대"],
          ],
        },
        {
          title: "공공주택 18세대",
          columns: ["평형", "기존안", "변경 계획안", "변경"],
          rows: [
            ["59㎡ (24평형)", "12세대", "13세대", "증 1세대"],
            ["74㎡ (30평형)", "3세대", "-", "감 3세대"],
            ["84㎡ (34평형)", "3세대", "5세대", "증 2세대"],
          ],
        },
      ],
    },
  ];

  const overviewGroups = [
    {
      title: "사업 정보",
      items: [
        { label: "사업명", value: "대방동 지역주택조합 공동주택 신축공사" },
        { label: "대지 위치", value: "서울특별시 동작구 대방동 11-103번지 일원" },
      ],
    },
    {
      title: "면적 계획",
      items: [
        { label: "대지 면적", value: "12,813.22㎡" },
        { label: "건축 면적", value: "2,991.89㎡" },
        { label: "연면적", value: "40,468.26㎡" },
        { label: "지상 연면적", value: "25,839.46㎡" },
        { label: "지하 연면적", value: "14,628.80㎡" },
      ],
    },
    {
      title: "규모·비율",
      items: [
        { label: "건축 규모", value: "지하 3층 ~ 지상 20층" },
        { label: "용적률", value: "200.73%" },
        { label: "건폐율", value: "23.35%" },
      ],
    },
    {
      title: "주차·기준",
      items: [
        { label: "주차 대수", value: "343대" },
        { label: "자료 기준", value: "2025.10.30 사업계획서" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center relative overflow-hidden flex flex-col justify-between min-h-32">
          <div className="absolute top-0 inset-x-0 h-1 bg-meadow-green" />
          <span className="text-[10px] text-ash font-bold tracking-wider">현재 지구단위계획</span>
          <span className="text-lg sm:text-xl font-extrabold text-meadow-green block mt-2">254세대</span>
          <div className="mt-3 text-[9px] text-ash font-medium">현재 지구단위계획 254세대</div>
        </div>

        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center relative overflow-hidden flex flex-col justify-between min-h-32">
          <div className="absolute top-0 inset-x-0 h-1 bg-sky-blue" />
          <span className="text-[10px] text-ash font-bold tracking-wider">향후 세대 계획</span>
          <span className="text-lg sm:text-xl font-extrabold text-sky-blue block mt-2">270세대 예정</span>
          <div className="mt-3 text-[9px] text-ash font-medium">경미한 변경으로 270세대 예정</div>
        </div>

        <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface text-center relative overflow-hidden flex flex-col justify-between min-h-32">
          <div className="absolute top-0 inset-x-0 h-1 bg-ember-orange" />
          <span className="text-[10px] text-ash font-bold tracking-wider">주차 계획</span>
          <span className="text-lg sm:text-xl font-extrabold text-ember-orange block mt-2">343대</span>
          <div className="mt-3 text-[9px] text-ash font-medium">장애인주차 10대 포함</div>
        </div>
      </div>

      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="border-b border-stone-surface pb-5">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange uppercase tracking-wider">
            Household Plan
          </span>
          <h3 className="mt-3 text-base font-bold text-charcoal-primary">
            평형별 세대계획
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-graphite">
            현재 지구단위계획 254세대와 향후 경미한 변경 예정 270세대를 평형별로 구분했습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {householdPlans.map((plan) => (
            <section
              key={plan.title}
              className="overflow-hidden rounded-2xl border border-stone-surface/70 bg-[#f8f7f4]"
            >
              <div className="relative bg-white p-5">
                <div className={`absolute inset-x-0 top-0 h-1 ${plan.accentClass}`} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ash">
                      {plan.eyebrow}
                    </span>
                    <h4 className="mt-2 text-sm font-bold text-charcoal-primary">
                      {plan.title}
                    </h4>
                    <p className="mt-2 text-[11px] leading-relaxed text-graphite">
                      {plan.summary}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-stone-surface/70 px-4 py-3 text-left sm:text-right">
                    <span className="text-[10px] font-bold text-ash">합계</span>
                    <strong className={`block text-lg font-extrabold ${plan.totalClass}`}>
                      {plan.total}
                    </strong>
                    <span className="mt-1 block text-[10px] font-semibold text-graphite">
                      {plan.formula}
                    </span>
                    {"delta" in plan ? (
                      <span className="mt-2 inline-flex rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-bold text-sky-blue">
                        {plan.delta}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {plan.groups.map((group) => (
                  <div
                    key={group.title}
                    className="overflow-hidden rounded-xl border border-stone-surface/60 bg-white"
                  >
                    <div className="border-b border-stone-surface/60 px-4 py-3">
                      <h5 className="text-xs font-extrabold text-charcoal-primary">
                        {group.title}
                      </h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-[10px] sm:text-[11px]">
                        <thead className="bg-[#f8f7f4] text-ash">
                          <tr>
                            {group.columns.map((column) => (
                              <th
                                key={column}
                                className="border-b border-stone-surface/60 px-2 py-2.5 font-bold sm:px-4"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row) => (
                            <tr key={row.join("-")} className="text-charcoal-primary">
                              {row.map((cell, index) => (
                                <td
                                  key={`${row[0]}-${cell}-${index}`}
                                  className="break-keep border-b border-stone-surface/50 px-2 py-2.5 last:border-b-0 sm:px-4"
                                >
                                  <span
                                    className={
                                      index === 0 || index === row.length - 1
                                        ? "font-bold"
                                        : "font-semibold"
                                    }
                                  >
                                    {cell}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface">
        <div className="border-b border-stone-surface pb-5">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange uppercase tracking-wider">
            Integrated Overview
          </span>
          <h3 className="mt-3 text-base font-bold text-charcoal-primary">
            통합 건축개요
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-graphite">
            사업계획서 건축개요 표의 수치를 중복 이미지 없이 항목별로 재정리했습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {overviewGroups.map((group) => (
            <section
              key={group.title}
              className="rounded-2xl border border-stone-surface/60 bg-[#f8f7f4] p-5"
            >
              <h4 className="text-sm font-bold text-charcoal-primary">{group.title}</h4>
              <dl className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-stone-surface/50 bg-white px-4 py-3"
                  >
                    <dt className="text-[10px] font-bold text-ash">{item.label}</dt>
                    <dd className="mt-1 text-xs font-bold leading-snug text-charcoal-primary sm:text-[13px]">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      <div className="stone-card bg-[#f8f7f4] p-6 sm:p-8 rounded-2xl border border-stone-surface flex items-start gap-4">
        <span className="mt-0.5 size-2.5 rounded-full bg-ember-orange shrink-0" />
        <div className="space-y-2">
          <h4 className="text-[14.5px] font-bold text-charcoal-primary">
            향후 계획
          </h4>
          <p className="text-xs text-graphite/95 leading-relaxed font-normal">
            세대수는 조합의 향후 경미한 변경 예정 사항을 함께 반영했습니다.
            현재 지구단위계획은 254세대이며, 향후 경미한 변경을 통해 270세대로 변경 예정입니다.
            인허가와 심의 과정에서 세부 수치와 배치는 변경될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
