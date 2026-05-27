"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DocumentUploadFormProps = {
  onSuccess?: () => void;
};

export function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DISCLOSURE");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !file) {
      setError("필수 항목(제목, 카테고리, 파일)을 채워주세요.");
      return;
    }

    setIsPending(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "업로드 중 오류가 발생했습니다.");
        return;
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setFile(null);
      
      // Reset file input element
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      setError("서버와의 통신 중 문제가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="soft-panel p-6 bg-white border border-[#f2f0ed] rounded-2xl">
      <h3 className="text-lg font-semibold text-charcoal-primary mb-4">신규 정보공개 문서 등록</h3>
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-700">
          문서가 성공적으로 업로드 및 승인되었습니다.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-title">
            문서 제목 *
          </label>
          <input
            id="upload-title"
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-desc">
            문서 설명 (선택)
          </label>
          <input
            id="upload-desc"
            type="text"
            placeholder="문서의 간략한 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-cat">
              카테고리 *
            </label>
            <select
              id="upload-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange"
            >
              <option value="DISCLOSURE">의무 정보 공개 자료</option>
              <option value="ACCOUNTING">회계 및 자금 보고</option>
              <option value="NOTICE">조합원 중요 공지</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="file-upload">
              첨부 파일 (PDF) *
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              required
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-graphite file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#f2f0ed] file:text-charcoal-primary hover:file:bg-parchment-card"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 py-5 text-sm rounded-full bg-midnight hover:bg-black"
        >
          {isPending ? "업로드 중..." : "문서 등록 및 공개"}
        </Button>
      </div>
    </form>
  );
}
