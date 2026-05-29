"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export type Document = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileName: string;
  fileSize: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

type DocumentTableProps = {
  documents: Document[];
  role: string;
  isDrawerMode?: boolean;
  initialCategory?: string;
  initialSearch?: string;
};

export function DocumentTable({ 
  documents, 
  role, 
  isDrawerMode = false,
  initialCategory = "all",
  initialSearch = ""
}: DocumentTableProps) {
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "DISCLOSURE":
        return "의무 정보 공개";
      case "ACCOUNTING":
        return "회계 및 자금 보고";
      case "NOTICE":
        return "조합원 공지";
      default:
        return cat;
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/download`);
      if (!res.ok) {
        alert("파일 다운로드 권한이 없거나 파일을 찾을 수 없습니다.");
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("다운로드 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="문서 제목으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs rounded-xl border border-[#f2f0ed] bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "DISCLOSURE", "ACCOUNTING", "NOTICE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                categoryFilter === cat
                  ? "bg-midnight text-white"
                  : "bg-white text-graphite border border-[#f2f0ed] hover:bg-parchment-card"
              }`}
            >
              {cat === "all" ? "전체 보기" : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="stone-card px-6 py-12 text-center text-graphite text-sm">
          조건에 일치하는 문서가 없습니다.
        </div>
      ) : isDrawerMode ? (
        /* 드로어 전용 모드: 컴팩트한 카드형 모바일 최적화 레이아웃 (가로 찌부 방지) */
        <div className="space-y-3.5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="stone-card bg-white p-4.5 rounded-2xl border border-[#f2f0ed] hover:border-ember-orange/45 hover:shadow-xs transition-all duration-200 flex flex-col gap-3.5"
            >
              {/* 구분 뱃지 및 일자 */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    doc.category === "DISCLOSURE"
                      ? "bg-sky-blue/10 text-sky-blue"
                      : doc.category === "ACCOUNTING"
                      ? "bg-meadow-green/10 text-midnight"
                      : "bg-sunburst-yellow/15 text-charcoal-primary"
                  }`}
                >
                  {getCategoryLabel(doc.category)}
                </span>
                <span className="text-graphite/60 font-mono text-[11px]">
                  {formatDate(doc.publishedAt || doc.createdAt)}
                </span>
              </div>

              {/* 제목 및 설명 */}
              <div className="space-y-1">
                <h4 className="text-[13px] font-bold text-charcoal-primary leading-snug break-all">
                  {doc.title}
                </h4>
                {doc.description && (
                  <p className="text-[11px] text-graphite/70 leading-relaxed font-normal break-all">
                    {doc.description}
                  </p>
                )}
              </div>

              {/* 파일명, 용량 및 다운로드 CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-[#f2f0ed] gap-4">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span
                    className="text-[10px] text-ash font-mono truncate max-w-[260px] block"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </span>
                  <span className="text-[9px] text-[#848281] font-mono">
                    {formatSize(doc.fileSize)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {role === "ADMIN" && (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        doc.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {doc.status === "APPROVED" ? "공개됨" : "대기중"}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="text-[11px] h-8 px-3 rounded-full border-[#f2f0ed] hover:border-ember-orange hover:text-ember-orange active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    다운로드
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 일반 데스크톱 모드: PC 화면에서는 기존 테이블, 모바일 화면에서는 카드 리스트 자동 변환 */
        <>
          {/* 1) 모바일 뷰 카드 리스트 (block md:hidden) */}
          <div className="block md:hidden space-y-3.5">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="stone-card bg-white p-4.5 rounded-2xl border border-[#f2f0ed] hover:border-ember-orange/45 hover:shadow-xs transition-all duration-200 flex flex-col gap-3.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      doc.category === "DISCLOSURE"
                        ? "bg-sky-blue/10 text-sky-blue"
                        : doc.category === "ACCOUNTING"
                        ? "bg-meadow-green/10 text-midnight"
                        : "bg-sunburst-yellow/15 text-charcoal-primary"
                    }`}
                  >
                    {getCategoryLabel(doc.category)}
                  </span>
                  <span className="text-graphite/60 font-mono text-[11px]">
                    {formatDate(doc.publishedAt || doc.createdAt)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[13px] font-bold text-charcoal-primary leading-snug break-all">
                    {doc.title}
                  </h4>
                  {doc.description && (
                    <p className="text-[11px] text-graphite/70 leading-relaxed font-normal break-all">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f2f0ed] gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span
                      className="text-[10px] text-ash font-mono truncate max-w-[260px] block"
                      title={doc.fileName}
                    >
                      {doc.fileName}
                    </span>
                    <span className="text-[9px] text-[#848281] font-mono">
                      {formatSize(doc.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {role === "ADMIN" && (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          doc.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.status === "APPROVED" ? "공개됨" : "대기중"}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.id, doc.fileName)}
                      className="text-[11px] h-8 px-3 rounded-full border-[#f2f0ed] hover:border-ember-orange hover:text-ember-orange active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      다운로드
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2) 데스크톱 뷰 테이블 (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#f2f0ed] bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#f2f0ed] bg-[#f8f7f4] text-xs font-semibold text-charcoal-primary uppercase tracking-wider">
                  <th className="px-5 py-4">등록일</th>
                  <th className="px-5 py-4">구분</th>
                  <th className="px-5 py-4">문서 제목</th>
                  <th className="px-5 py-4">파일명</th>
                  <th className="px-5 py-4">크기</th>
                  {role === "ADMIN" && <th className="px-5 py-4">상태</th>}
                  <th className="px-5 py-4 text-right">조회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f0ed] text-graphite">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#fbfaf9] transition-colors">
                    <td className="whitespace-nowrap px-5 py-4">{formatDate(doc.publishedAt || doc.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          doc.category === "DISCLOSURE"
                            ? "bg-sky-blue/10 text-sky-blue"
                            : doc.category === "ACCOUNTING"
                            ? "bg-meadow-green/10 text-midnight"
                            : "bg-sunburst-yellow/15 text-charcoal-primary"
                        }`}
                      >
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-charcoal-primary">
                      <div>{doc.title}</div>
                      {doc.description && <div className="mt-1 text-xs text-graphite/70 font-normal">{doc.description}</div>}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{doc.fileName}</td>
                    <td className="whitespace-nowrap px-5 py-4">{formatSize(doc.fileSize)}</td>
                    {role === "ADMIN" && (
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            doc.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.status === "APPROVED" ? "공개됨" : "대기중"}
                        </span>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                        className="text-xs h-8 rounded-full border-[#f2f0ed] hover:border-ember-orange hover:text-ember-orange"
                      >
                        다운로드
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
