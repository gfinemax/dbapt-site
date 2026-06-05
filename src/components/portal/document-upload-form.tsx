/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type Document } from "@/components/portal/document-table";

type DocumentUploadFormProps = {
  onSuccess?: (document?: Document) => void;
  defaultCategory?: string;
  defaultSubCategory?: string;
};

const disclosureSubCategoryOptions = [
  "정관 및 조합규약",
  "운영관리규정",
  "회계관리규정",
  "선거관리규정",
  "기타 내부 운영규정",
  "조합원 연명부",
  "시공자 협약서",
  "총회 의사록",
  "이사회 회의록",
  "수발신 공문",
  "사업시행계획",
  "외부회계감사",
  "내부감사",
  "자금운용계획",
  "에스크로 명세서",
  "용역 계약서",
  "공사진행/토지",
  "추진실적",
  "감리 보고서",
];

type SignedDocumentUpload = {
  path: string;
  signedUrl: string;
  token: string;
  contentType: string;
};

const MAX_DOCUMENT_UPLOAD_SIZE = 20 * 1024 * 1024;

async function uploadToSignedUrl(upload: SignedDocumentUpload, file: File) {
  const typedFile =
    upload.contentType && file.type !== upload.contentType
      ? new Blob([file], { type: upload.contentType })
      : file;
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", typedFile, file.name);

  const response = await fetch(upload.signedUrl, {
    method: "PUT",
    headers: {
      "x-upsert": "false",
    },
    body,
  });

  if (!response.ok) {
    console.error("Signed document upload failed:", {
      status: response.status,
      statusText: response.statusText,
      body: await response.text().catch(() => ""),
    });
    throw new Error("스토리지 업로드 중 오류가 발생했습니다.");
  }
}

export function DocumentUploadForm({ 
  onSuccess, 
  defaultCategory = "DISCLOSURE", 
  defaultSubCategory = "총회 의사록" 
}: DocumentUploadFormProps) {
  // 오늘 날짜 구하기 (KST 기준 YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [subCategory, setSubCategory] = useState(defaultSubCategory);
  const [documentDate, setDocumentDate] = useState(getTodayString());
  const [publishedAt, setPublishedAt] = useState(getTodayString());
  const [file, setFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // 폴더 카드 변경 시 기본값이 실시간으로 폼에 반영되도록 보장
  useEffect(() => {
    setCategory(defaultCategory);
    setSubCategory(defaultSubCategory);
  }, [defaultCategory, defaultSubCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !file || !documentDate || !publishedAt) {
      setError("필수 항목(제목, 카테고리, 발생일, 등록일, 파일)을 채워주세요.");
      return;
    }

    setIsPending(true);
    setError("");
    setSuccess(false);

    const filesToUpload = [file, ...attachments];
    const oversizedFile = filesToUpload.find((uploadFile) => uploadFile.size > MAX_DOCUMENT_UPLOAD_SIZE);
    if (oversizedFile) {
      setError(`${oversizedFile.name} 파일은 20MB 이하만 업로드할 수 있습니다.`);
      setIsPending(false);
      return;
    }

    try {
      const uploadUrlResponse = await fetch("/api/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToUpload.map((uploadFile) => ({
            name: uploadFile.name,
            size: uploadFile.size,
          })),
        }),
      });

      const uploadUrlData = await uploadUrlResponse.json();
      if (!uploadUrlResponse.ok) {
        setError(uploadUrlData.error || "문서 업로드 준비 중 문제가 발생했습니다.");
        return;
      }

      const signedUploads = uploadUrlData.uploads as SignedDocumentUpload[];
      if (!Array.isArray(signedUploads) || signedUploads.length !== filesToUpload.length) {
        setError("문서 업로드 준비 정보가 올바르지 않습니다.");
        return;
      }

      await Promise.all(signedUploads.map((upload, index) => uploadToSignedUrl(upload, filesToUpload[index])));

      const [mainUpload, ...attachmentUploads] = signedUploads;
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          subCategory: category === "DISCLOSURE" ? subCategory : "",
          documentDate,
          publishedAt,
          isStarred,
          file: {
            path: mainUpload.path,
            name: file.name,
            size: file.size,
          },
          attachments: attachmentUploads.map((upload, index) => ({
            path: upload.path,
            name: attachments[index].name,
            size: attachments[index].size,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "업로드 중 오류가 발생했습니다.");
        return;
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setSubCategory(defaultSubCategory);
      setDocumentDate(getTodayString());
      setPublishedAt(getTodayString());
      setFile(null);
      setAttachments([]);
      setIsStarred(false);
      
      // Reset file input element
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      const attachmentInput = document.getElementById("attachment-upload") as HTMLInputElement;
      if (attachmentInput) attachmentInput.value = "";

      if (onSuccess) onSuccess(data.document as Document | undefined);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "서버와의 통신 중 문제가 발생했습니다.");
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
          <div className={category === "DISCLOSURE" ? "" : "sm:col-span-2"}>
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-cat">
              카테고리 *
            </label>
            <select
              id="upload-cat"
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                if (val !== "DISCLOSURE") {
                  setSubCategory("");
                } else {
                  setSubCategory(defaultSubCategory || "총회 의사록");
                }
              }}
              className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange"
            >
              <option value="DISCLOSURE">의무 정보 공개 자료</option>
              <option value="ACCOUNTING">회계 및 자금 보고</option>
              <option value="NOTICE">조합원 중요 공지</option>
            </select>
          </div>

          {category === "DISCLOSURE" && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-subcat">
                문서함 세부 분류 *
              </label>
              <select
                id="upload-subcat"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange"
              >
                {disclosureSubCategoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-date">
              발생일 / 개최일 / 수발신일 *
            </label>
            <input
              id="upload-date"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="upload-published-at">
              등록일 (공개일) *
            </label>
            <input
              id="upload-published-at"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
              className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="file-upload">
              첨부 파일 (PDF/HWP/Word) *
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.hwp,.hwpx,.doc,.docx"
              required
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-graphite file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#f2f0ed] file:text-charcoal-primary hover:file:bg-parchment-card"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 py-1">
            <input
              id="upload-starred"
              type="checkbox"
              checked={isStarred}
              onChange={(e) => setIsStarred(e.target.checked)}
              className="size-4 rounded border-[#f2f0ed] text-ember-orange focus:ring-ember-orange cursor-pointer"
            />
            <label className="text-xs font-semibold text-charcoal-primary select-none cursor-pointer" htmlFor="upload-starred">
              중요 문서로 표시
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="attachment-upload">
              추가 첨부파일 (선택, 최대 10개)
            </label>
            <input
              id="attachment-upload"
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const filesArray = Array.from(e.target.files);
                  if (filesArray.length > 10) {
                    setError("추가 첨부파일은 최대 10개까지만 등록 가능합니다.");
                    setAttachments([]);
                    e.target.value = "";
                    return;
                  }
                  setError("");
                  setAttachments(filesArray);
                } else {
                  setAttachments([]);
                }
              }}
              className="w-full text-xs text-graphite file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#f2f0ed] file:text-charcoal-primary hover:file:bg-parchment-card"
            />
            {/* 선택된 다중 파일 목록 */}
            {attachments.length > 0 && (
              <div className="mt-2.5 rounded-xl border border-stone-surface bg-[#f8f7f4] p-3 space-y-1.5">
                <span className="text-[11px] font-bold text-charcoal-primary select-none block">
                  📎 선택된 첨부파일 ({attachments.length}개):
                </span>
                <ul className="text-[10px] text-graphite space-y-1 list-disc list-inside">
                  {attachments.map((att, idx) => (
                    <li key={idx} className="truncate">
                      <span className="font-medium text-graphite/90">{att.name}</span>
                      <span className="text-ash font-mono text-[9px] ml-1">({(att.size / 1024).toFixed(1)} KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
