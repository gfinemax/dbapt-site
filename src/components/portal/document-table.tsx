"use client";

import { useState } from "react";
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
};

export function DocumentTable({ documents, role }: DocumentTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#f2f0ed] bg-white">
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
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
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
      )}
    </div>
  );
}
