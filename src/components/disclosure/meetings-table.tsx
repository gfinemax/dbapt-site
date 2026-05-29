"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// ── 회의·행정 문서 타입 ──
export type MeetingCategory = "총회 의사록" | "이사회 회의록" | "수발신 공문" | "사업시행계획";

type MeetingDoc = {
  id: number;
  category: MeetingCategory;
  title: string;
  date: string;        // YYYY.MM.DD
  isImportant?: boolean;
};

// ── 풍부한 목 데이터 (실제 DB 연동 전 시연용) ──
const MEETING_DOCS: MeetingDoc[] = [
  // 총회 의사록 (12건)
  { id: 1,  category: "총회 의사록", title: "대방동지역주택조합 창립총회 의사록",                                date: "2022.11.15", isImportant: true },
  { id: 2,  category: "총회 의사록", title: "제1차 임시총회 의사록 (규약 제정 및 임원 선출)",                      date: "2023.03.22", isImportant: true },
  { id: 3,  category: "총회 의사록", title: "제2차 임시총회 의사록 (시공예정사 선정 의결)",                        date: "2023.07.10" },
  { id: 4,  category: "총회 의사록", title: "2023년도 정기총회 의사록 (결산 및 예산 승인)",                        date: "2023.12.18" },
  { id: 5,  category: "총회 의사록", title: "제3차 임시총회 의사록 (토지매입 방안 의결)",                          date: "2024.02.28" },
  { id: 6,  category: "총회 의사록", title: "제4차 임시총회 의사록 (감리계약 체결 승인)",                          date: "2024.06.05" },
  { id: 7,  category: "총회 의사록", title: "2024년도 정기총회 의사록 (결산 보고 및 규약 일부 개정)",              date: "2024.12.20", isImportant: true },
  { id: 8,  category: "총회 의사록", title: "제5차 임시총회 의사록 (설계용역 변경 승인)",                          date: "2025.02.14" },
  { id: 9,  category: "총회 의사록", title: "제6차 임시총회 의사록 (분담금 납부계획 조정 의결)",                   date: "2025.05.20" },
  { id: 10, category: "총회 의사록", title: "제7차 임시총회 의사록 (차입금 조달 결의)",                            date: "2025.09.18" },
  { id: 11, category: "총회 의사록", title: "2025년도 정기총회 의사록 (결산·감사 보고 및 2026 예산 승인)",         date: "2025.12.19", isImportant: true },
  { id: 12, category: "총회 의사록", title: "제8차 임시총회 의사록 (사업시행인가 추진 결의)",                      date: "2026.03.12" },

  // 이사회 회의록 (18건)
  { id: 13, category: "이사회 회의록", title: "제1차 이사회 회의록 (조합 사무국 설치 결의)",                     date: "2022.12.10" },
  { id: 14, category: "이사회 회의록", title: "제2차 이사회 회의록 (대행사 선정 심의)",                          date: "2023.01.25" },
  { id: 15, category: "이사회 회의록", title: "제3차 이사회 회의록 (업무협약 MOU 체결 승인)",                    date: "2023.04.15" },
  { id: 16, category: "이사회 회의록", title: "제4차 이사회 회의록 (용역비 집행 심의)",                          date: "2023.06.20" },
  { id: 17, category: "이사회 회의록", title: "제5차 이사회 회의록 (분기별 예산 집행 현황 보고)",                date: "2023.09.18" },
  { id: 18, category: "이사회 회의록", title: "제6차 이사회 회의록 (토지매입 추진상황 점검)",                    date: "2023.11.22" },
  { id: 19, category: "이사회 회의록", title: "제7차 이사회 회의록 (2024년 사업추진 계획 수립)",                 date: "2024.01.15" },
  { id: 20, category: "이사회 회의록", title: "제8차 이사회 회의록 (설계사 변경 검토)",                          date: "2024.03.20" },
  { id: 21, category: "이사회 회의록", title: "제9차 이사회 회의록 (신탁계좌 운용 현황 심의)",                   date: "2024.05.28" },
  { id: 22, category: "이사회 회의록", title: "제10차 이사회 회의록 (조합원 민원 대응 방안 협의)",               date: "2024.07.18" },
  { id: 23, category: "이사회 회의록", title: "제11차 이사회 회의록 (외부감사 결과 보고 및 조치 계획)",          date: "2024.09.25" },
  { id: 24, category: "이사회 회의록", title: "제12차 이사회 회의록 (2024 결산 예비 심의)",                      date: "2024.11.20" },
  { id: 25, category: "이사회 회의록", title: "제13차 이사회 회의록 (2025년 예산안 사전 검토)",                  date: "2025.01.22" },
  { id: 26, category: "이사회 회의록", title: "제14차 이사회 회의록 (소송 현황 및 법률비용 심의)",               date: "2025.03.19" },
  { id: 27, category: "이사회 회의록", title: "제15차 이사회 회의록 (매입 부동산 권리 분석 보고)",               date: "2025.06.11" },
  { id: 28, category: "이사회 회의록", title: "제16차 이사회 회의록 (분기 자금집행 적정성 심사)",                date: "2025.08.20" },
  { id: 29, category: "이사회 회의록", title: "제17차 이사회 회의록 (사업시행인가 서류 준비 점검)",              date: "2025.11.13" },
  { id: 30, category: "이사회 회의록", title: "제18차 이사회 회의록 (2026 상반기 운영 계획 확정)",               date: "2026.01.17" },

  // 수발신 공문 (14건)
  { id: 31, category: "수발신 공문", title: "[동작구청] 지역주택조합 설립인가 통보",                             date: "2022.11.28", isImportant: true },
  { id: 32, category: "수발신 공문", title: "[동작구청] 2023년도 행정실태점검 시정조치 요구",                    date: "2023.08.15" },
  { id: 33, category: "수발신 공문", title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (1차)",                date: "2023.09.20" },
  { id: 34, category: "수발신 공문", title: "[서울시] 지구단위계획 결정 고시 통보 (제2022-291호)",               date: "2023.10.05", isImportant: true },
  { id: 35, category: "수발신 공문", title: "[조합→동작구청] 조합원 변동 현황 신고서",                          date: "2024.01.30" },
  { id: 36, category: "수발신 공문", title: "[동작구청] 2024년도 정기 행정실태점검 결과 통보",                   date: "2024.07.22" },
  { id: 37, category: "수발신 공문", title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (2차)",                date: "2024.08.30" },
  { id: 38, category: "수발신 공문", title: "[조합→서울시] 사업시행인가 사전 협의 요청",                        date: "2024.11.15" },
  { id: 39, category: "수발신 공문", title: "[동작구청] 조합 운영 개선 권고 공문",                               date: "2025.02.10" },
  { id: 40, category: "수발신 공문", title: "[조합→동작구청] 조합 운영 개선 이행 보고서",                       date: "2025.03.25" },
  { id: 41, category: "수발신 공문", title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",                    date: "2025.08.18" },
  { id: 42, category: "수발신 공문", title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)",                date: "2025.09.30" },
  { id: 43, category: "수발신 공문", title: "[조합→서울시] 사업시행인가 본신청 접수",                            date: "2026.01.20", isImportant: true },
  { id: 44, category: "수발신 공문", title: "[동작구청] 2026년 상반기 조합원 현황 확인 요청",                    date: "2026.04.05" },

  // 사업시행계획 (4건)
  { id: 45, category: "사업시행계획", title: "대방동 11-103 일대 주택건설 사업시행계획서(안) 초안",              date: "2023.05.10" },
  { id: 46, category: "사업시행계획", title: "대방동 11-103 일대 주택건설 사업시행계획서(안) 수정본",            date: "2024.08.22" },
  { id: 47, category: "사업시행계획", title: "사업시행계획서 부속 도면 일체 (건축·토목·소방)",                    date: "2025.04.15" },
  { id: 48, category: "사업시행계획", title: "사업시행인가 최종 신청본 (서울시 제출본)",                         date: "2026.01.18", isImportant: true },
];

const PAGE_SIZE = 10;
const CATEGORIES: ("전체" | MeetingCategory)[] = ["전체", "총회 의사록", "이사회 회의록", "수발신 공문", "사업시행계획"];

// ── 카테고리 뱃지 색상 ──
function categoryBadge(cat: MeetingCategory) {
  switch (cat) {
    case "총회 의사록":
      return "bg-sky-blue/10 text-sky-blue";
    case "이사회 회의록":
      return "bg-violet-500/10 text-violet-600";
    case "수발신 공문":
      return "bg-amber-500/10 text-amber-600";
    case "사업시행계획":
      return "bg-emerald-500/10 text-emerald-600";
  }
}

type MeetingsTableProps = {
  isLoggedIn: boolean;
  onOpenPortal?: () => void;
  router: AppRouterInstance;
  initialFilterCat?: "전체" | MeetingCategory;
  initialSearchQuery?: string;
  onBackToFolders?: () => void;
};

export function MeetingsTable({ 
  isLoggedIn, 
  onOpenPortal, 
  router,
  initialFilterCat = "전체",
  initialSearchQuery = "",
  onBackToFolders
}: MeetingsTableProps) {
  const [page, setPage] = useState(1);
  const [filterCat, setFilterCat] = useState<"전체" | MeetingCategory>(initialFilterCat);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFilterCat(initialFilterCat);
    setSearchQuery(initialSearchQuery);
    setPage(1);
  }, [initialFilterCat, initialSearchQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 필터 + 검색 적용
  const filtered = useMemo(() => {
    let result = MEETING_DOCS;
    if (filterCat !== "전체") {
      result = result.filter((d) => d.category === filterCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }
    // 최신순 정렬
    return [...result].sort((a, b) => b.id - a.id);
  }, [filterCat, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 페이지 변경 시 범위 보정
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  // 페이지네이션 번호 계산 (최대 5개)
  const pageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const nums: number[] = [];
    for (let n = start; n <= end; n++) nums.push(n);
    return nums;
  }, [currentPage, totalPages]);

  const handleRowClick = () => {
    if (!isLoggedIn) {
      alert("이 문서는 대방동지역주택조합 정식 조합원 기밀 의무공개 자료입니다.\n자산 가치 보호를 위해 조합원 로그인 세션 내에서만 암호화 열람이 가능합니다.");
      router.push("/login");
    } else {
      if (onOpenPortal) onOpenPortal();
      else window.dispatchEvent(new CustomEvent("open-portal"));
    }
  };

  return (
    <div className="space-y-4">
      {/* 폴더 카드로 돌아가기 액션 바 */}
      {onBackToFolders && (
        <div className="flex justify-start">
          <Button
            onClick={onBackToFolders}
            variant="outline"
            className="rounded-full text-xs font-bold border-stone-surface text-graphite hover:bg-stone-surface flex items-center gap-1.5 h-8 px-4 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            폴더 카드로 보기
          </Button>
        </div>
      )}

      {/* ── 필터 바 ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* 카테고리 필터 */}
        <div className="relative">
          <select
            value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value as typeof filterCat); setPage(1); }}
            className="appearance-none rounded-xl border border-stone-surface bg-white pl-4 pr-10 py-2.5 text-xs font-semibold text-charcoal-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat === "전체" ? "전체 분류" : cat}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* 검색 입력 */}
        <div className="relative flex-1 max-w-sm">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="문서 제목 검색…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
          />
        </div>

        {/* 총 건수 */}
        <span className="ml-auto text-xs text-graphite font-medium whitespace-nowrap">
          총 <strong className="text-charcoal-primary">{filtered.length}</strong>건
        </span>
      </div>

      {/* ── 데이터 테이블 ── */}
      <div className="bg-white rounded-2xl border border-stone-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f6f3] border-b border-stone-surface">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-ash w-14 text-center text-xs">No.</th>
                <th className="px-5 py-3.5 font-semibold text-ash w-32 text-xs">분류</th>
                <th className="px-5 py-3.5 font-semibold text-ash text-xs">문서 제목</th>
                <th className="px-5 py-3.5 font-semibold text-ash w-28 text-center text-xs">등록일</th>
                <th className="px-5 py-3.5 font-semibold text-ash w-24 text-center text-xs">열람</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-surface/50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-graphite">
                    검색 조건에 맞는 문서가 없습니다.
                  </td>
                </tr>
              ) : (
                paged.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    onClick={handleRowClick}
                    className={cn(
                      "cursor-pointer transition-colors",
                      idx % 2 === 1 ? "bg-[#fdfcfa]" : "bg-white",
                      "hover:bg-sky-blue/[0.04]"
                    )}
                  >
                    <td className="px-5 py-3.5 text-center text-graphite text-xs tabular-nums">{doc.id}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap", categoryBadge(doc.category))}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "font-semibold text-[13px] leading-snug hover:text-sky-blue transition-colors",
                        doc.isImportant ? "text-charcoal-primary" : "text-charcoal-primary/85"
                      )}>
                        {doc.isImportant && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-ember-orange/15 text-ember-orange text-[9px] font-black mr-1.5 align-text-bottom">★</span>
                        )}
                        {doc.title}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-ash font-mono text-xs whitespace-nowrap">{doc.date}</td>
                    <td className="px-5 py-3.5 text-center">
                      {isLoggedIn ? (
                        <span className="inline-flex items-center gap-1 text-meadow-green text-[10px] font-bold bg-meadow-green/10 px-2.5 py-1 rounded-full">
                          🔓 열람
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ember-orange text-[10px] font-bold bg-ember-orange/10 px-2.5 py-1 rounded-full">
                          🔒 보안
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── 페이지네이션 ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-surface bg-[#f7f6f3]">
          <span className="text-[11px] text-graphite">
            {filtered.length > 0
              ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} / ${filtered.length}건`
              : "0건"}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 rounded-full text-xs animate-none cursor-pointer"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              &lt;
            </Button>
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant={n === currentPage ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 rounded-full text-xs cursor-pointer",
                  n === currentPage && "bg-charcoal-primary text-white hover:bg-charcoal-primary"
                )}
                onClick={() => goToPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 rounded-full text-xs animate-none cursor-pointer"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
