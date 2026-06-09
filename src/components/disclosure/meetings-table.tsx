"use client";

import { useState, useMemo, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { type Document } from "@/components/portal/document-table";
import { DocumentUploadForm } from "../portal/document-upload-form";

// ── 공개자료 문서함 분류 타입 ──
export type MeetingCategory =
  | "정관 및 조합규약"
  | "운영관리규정"
  | "회계관리규정"
  | "선거관리규정"
  | "기타 내부 운영규정"
  | "조합원 연명부"
  | "시공자 협약서"
  | "총회 의사록"
  | "이사회 회의록"
  | "수발신 공문"
  | "사업시행계획"
  | "외부회계감사"
  | "내부감사"
  | "연간자금운용계획"
  | "에스크로 명세서"
  | "용역 계약서"
  | "공사진행/토지"
  | "실적보고서"
  | "감리 보고서";

type MeetingDoc = {
  id: number;
  category: MeetingCategory;
  title: string;
  date: string;        // YYYY.MM.DD
  isImportant?: boolean;
  correspondenceType?: CorrespondenceType;
  isReal?: boolean;
};

type CorrespondenceType = "발신" | "수신" | "회신";

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
  { id: 31, category: "수발신 공문", title: "[동작구청] 지역주택조합 설립인가 통보",                             date: "2022.11.28", isImportant: true, correspondenceType: "수신" },
  { id: 32, category: "수발신 공문", title: "[동작구청] 2023년도 행정실태점검 시정조치 요구",                    date: "2023.08.15", correspondenceType: "수신" },
  { id: 33, category: "수발신 공문", title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (1차)",                date: "2023.09.20", correspondenceType: "회신" },
  { id: 34, category: "수발신 공문", title: "[서울시] 지구단위계획 결정 고시 통보 (제2022-291호)",               date: "2023.10.05", isImportant: true, correspondenceType: "수신" },
  { id: 35, category: "수발신 공문", title: "[조합→동작구청] 조합원 변동 현황 신고서",                          date: "2024.01.30", correspondenceType: "발신" },
  { id: 36, category: "수발신 공문", title: "[동작구청] 2024년도 정기 행정실태점검 결과 통보",                   date: "2024.07.22", correspondenceType: "수신" },
  { id: 37, category: "수발신 공문", title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (2차)",                date: "2024.08.30", correspondenceType: "회신" },
  { id: 38, category: "수발신 공문", title: "[조합→서울시] 사업시행인가 사전 협의 요청",                        date: "2024.11.15", correspondenceType: "발신" },
  { id: 39, category: "수발신 공문", title: "[동작구청] 조합 운영 개선 권고 공문",                               date: "2025.02.10", correspondenceType: "수신" },
  { id: 40, category: "수발신 공문", title: "[조합→동작구청] 조합 운영 개선 이행 보고서",          date: "2025.03.25", correspondenceType: "회신" },
  { id: 41, category: "수발신 공문", title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",                    date: "2025.08.18", correspondenceType: "수신" },
  { id: 42, category: "수발신 공문", title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)",                date: "2025.09.30", correspondenceType: "회신" },
  { id: 43, category: "수발신 공문", title: "[조합→서울시] 사업시행인가 본신청 접수",                            date: "2026.01.20", isImportant: true, correspondenceType: "발신" },
  { id: 44, category: "수발신 공문", title: "[동작구청] 2026년 상반기 조합원 현황 확인 요청",                    date: "2026.04.05", correspondenceType: "수신" },

  // 사업시행계획 (4건)
  { id: 45, category: "사업시행계획", title: "대방동 11-103 일대 주택건설 사업시행계획서(안) 초안",              date: "2023.05.10" },
  { id: 46, category: "사업시행계획", title: "대방동 11-103 일대 주택건설 사업시행계획서(안) 수정본",            date: "2024.08.22" },
  { id: 47, category: "사업시행계획", title: "사업시행계획서 부속 도면 일체 (건축·토목·소방)",                    date: "2025.04.15" },
  { id: 48, category: "사업시행계획", title: "사업시행인가 최종 신청본 (서울시 제출본)",                         date: "2026.01.18", isImportant: true },
];

const PAGE_SIZE = 10;
const CATEGORIES: ("전체" | MeetingCategory)[] = [
  "전체",
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
  "연간자금운용계획",
  "에스크로 명세서",
  "용역 계약서",
  "공사진행/토지",
  "실적보고서",
  "감리 보고서",
];

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
    case "정관 및 조합규약":
    case "운영관리규정":
    case "회계관리규정":
    case "선거관리규정":
    case "기타 내부 운영규정":
    case "조합원 연명부":
      return "bg-sky-blue/10 text-sky-blue";
    case "시공자 협약서":
    case "외부회계감사":
    case "내부감사":
    case "연간자금운용계획":
    case "에스크로 명세서":
    case "용역 계약서":
    case "공사진행/토지":
    case "실적보고서":
    case "감리 보고서":
      return "bg-meadow-green/10 text-meadow-green";
  }
}

const correspondenceBadgeClass: Record<CorrespondenceType, string> = {
  발신: "bg-sky-blue/10 text-sky-blue border-sky-blue/20",
  수신: "bg-meadow-green/10 text-meadow-green border-meadow-green/20",
  회신: "bg-ember-orange/10 text-ember-orange border-ember-orange/20",
};

function inferCorrespondenceType(doc: Pick<RowDocType, "category" | "title" | "correspondenceType">) {
  if (doc.category !== "수발신 공문") return undefined;
  if (doc.correspondenceType) return doc.correspondenceType;

  const compactTitle = doc.title.replace(/\s/g, "");
  if (/회신|답변|조치결과|이행보고/.test(compactTitle)) return "회신";
  if (/\[?조합(?:→|->|=>|＞|>)/.test(compactTitle) || /발신/.test(compactTitle)) return "발신";
  return "수신";
}

function CorrespondenceBadge({ type }: { type: CorrespondenceType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border mr-1.5 align-middle",
        correspondenceBadgeClass[type]
      )}
    >
      {type}
    </span>
  );
}

function CorrespondenceBadgeForDoc({ doc }: { doc: Pick<RowDocType, "category" | "title" | "correspondenceType"> }) {
  const type = inferCorrespondenceType(doc);
  if (!type) return null;
  return <CorrespondenceBadge type={type} />;
}

export type RowDocType = {
  id: string | number;
  category: MeetingCategory;
  title: string;
  date: string;
  isImportant?: boolean;
  correspondenceType?: CorrespondenceType;
  isReal?: boolean;
  fileName?: string;
  fileSize?: number;
  sourceDocument?: Document;
};

type DocumentEditFormState = {
  id: string;
  title: string;
  description: string;
  subCategory: MeetingCategory;
  fileName: string;
  attachments: NonNullable<Document["attachments"]>;
  replacementFile: File | null;
  replacementAttachments: File[];
  documentDate: string;
  publishedAt: string;
  isStarred: boolean;
  correspondenceType: CorrespondenceType;
};

type DeleteDocumentTarget = {
  id: string;
  title: string;
};

type SignedDocumentUpload = {
  path: string;
  signedUrl: string;
  token: string;
  contentType: string;
};

const MAX_DOCUMENT_UPLOAD_SIZE = 20 * 1024 * 1024;

function normalizeMeetingCategory(category?: string | null): MeetingCategory {
  if (category === "추진실적") return "실적보고서";
  return (category || "총회 의사록") as MeetingCategory;
}

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
    throw new Error("스토리지 업로드 중 오류가 발생했습니다.");
  }
}

type MeetingsTableProps = {
  isLoggedIn: boolean;
  role?: string;
  onOpenPortal?: () => void;
  router: AppRouterInstance;
  initialFilterCat?: "전체" | MeetingCategory;
  initialSearchQuery?: string;
  onBackToFolders?: () => void;
  documents?: Document[];
  onViewDocument?: (document: Document) => void;
};

export function MeetingsTable({ 
  isLoggedIn, 
  role,
  router,
  initialFilterCat = "전체",
  initialSearchQuery = "",
  onBackToFolders,
  documents = [],
  onViewDocument
}: MeetingsTableProps) {
  const isAdmin = role?.toUpperCase() === "ADMIN";
  const [page, setPage] = useState(1);
  const [filterCat, setFilterCat] = useState<"전체" | MeetingCategory>(initialFilterCat);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentEditFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteDocumentTarget | null>(null);

  // 로컬에서 실시간으로 문서 상태(삭제/별표)를 제어하기 위한 state
  const [managedDocs, setManagedDocs] = useState<Document[]>(documents);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [starringId, setStarringId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setManagedDocs(documents);
  }, [documents]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // YYYY.MM.DD 형식의 날짜 문자열에 대해 3일 이내 신규 업로드인지 체크
  const isRecent = (dateStr: string) => {
    if (!dateStr) return false;
    const cleanDate = dateStr.replace(/\./g, "-");
    const uploadTime = new Date(cleanDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = (nowTime - uploadTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  };

  const toDateInputValue = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return dateStr.slice(0, 10);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFilterCat(initialFilterCat);
    setSearchQuery(initialSearchQuery);
    setPage(1);
  }, [initialFilterCat, initialSearchQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openDeleteModal = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  // 문서 삭제 핸들러
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "문서 삭제에 실패했습니다.");
        return;
      }
      setManagedDocs((prev) => prev.filter((d) => d.id !== id));
      setDeleteTarget(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("문서 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  // 별표 토글 핸들러
  const handleStarToggle = async (docId: string, currentStarred: boolean) => {
    const newStarred = !currentStarred;
    setStarringId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: newStarred }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "문서 상태 변경에 실패했습니다.");
        return;
      }
      setManagedDocs((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isStarred: newStarred } : d))
      );
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("문서 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setStarringId(null);
    }
  };

  const openEditModal = (doc: RowDocType) => {
    if (!doc.isReal || !doc.sourceDocument) return;
    const source = doc.sourceDocument;
    setEditError("");
    setEditingDoc({
      id: source.id,
      title: source.title,
      description: source.description || "",
      subCategory: normalizeMeetingCategory(source.subCategory || doc.category),
      fileName: source.fileName,
      attachments: source.attachments || [],
      replacementFile: null,
      replacementAttachments: [],
      documentDate: toDateInputValue(source.documentDate || source.createdAt),
      publishedAt: toDateInputValue(source.publishedAt || source.createdAt),
      isStarred: !!source.isStarred,
      correspondenceType: (source.correspondenceType as CorrespondenceType | null) || inferCorrespondenceType(doc) || "수신",
    });
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingDoc) return;

    if (!editingDoc.title.trim()) {
      setEditError("문서 제목을 입력해 주세요.");
      return;
    }

    setEditingId(editingDoc.id);
    setEditError("");
    try {
      const replacementFiles = [
        ...(editingDoc.replacementFile ? [editingDoc.replacementFile] : []),
        ...editingDoc.replacementAttachments,
      ];
      const oversizedFile = replacementFiles.find((file) => file.size > MAX_DOCUMENT_UPLOAD_SIZE);
      if (oversizedFile) {
        setEditError(`${oversizedFile.name} 파일은 20MB 이하만 업로드할 수 있습니다.`);
        return;
      }

      let uploadedMainFile: SignedDocumentUpload | null = null;
      let uploadedAttachments: SignedDocumentUpload[] | null = null;

      if (replacementFiles.length > 0) {
        const uploadUrlResponse = await fetch("/api/documents/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: replacementFiles.map((file) => ({
              name: file.name,
              size: file.size,
            })),
          }),
        });
        const uploadUrlData = await uploadUrlResponse.json();

        if (!uploadUrlResponse.ok) {
          setEditError(uploadUrlData.error || "문서 업로드 준비 중 문제가 발생했습니다.");
          return;
        }

        const signedUploads = uploadUrlData.uploads as SignedDocumentUpload[];
        if (!Array.isArray(signedUploads) || signedUploads.length !== replacementFiles.length) {
          setEditError("문서 업로드 준비 정보가 올바르지 않습니다.");
          return;
        }

        await Promise.all(signedUploads.map((upload, index) => uploadToSignedUrl(upload, replacementFiles[index])));

        const attachmentStart = editingDoc.replacementFile ? 1 : 0;
        uploadedMainFile = editingDoc.replacementFile ? signedUploads[0] : null;
        uploadedAttachments =
          editingDoc.replacementAttachments.length > 0 ? signedUploads.slice(attachmentStart) : null;
      }

      const requestBody: Record<string, unknown> = {
        title: editingDoc.title,
        description: editingDoc.description,
        category: "DISCLOSURE",
        subCategory: editingDoc.subCategory,
        correspondenceType: editingDoc.subCategory === "수발신 공문" ? editingDoc.correspondenceType : null,
        documentDate: editingDoc.documentDate,
        publishedAt: editingDoc.publishedAt,
        isStarred: editingDoc.isStarred,
      };

      if (uploadedMainFile && editingDoc.replacementFile) {
        requestBody.file = {
          path: uploadedMainFile.path,
          name: editingDoc.replacementFile.name,
          size: editingDoc.replacementFile.size,
        };
      }

      if (uploadedAttachments && editingDoc.replacementAttachments.length > 0) {
        requestBody.attachments = uploadedAttachments.map((upload, index) => ({
          path: upload.path,
          name: editingDoc.replacementAttachments[index].name,
          size: editingDoc.replacementAttachments[index].size,
        }));
      }

      const res = await fetch(`/api/documents/${editingDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "문서 수정에 실패했습니다.");
        return;
      }

      const updatedDocument = data.document as Document;
      setManagedDocs((prev) =>
        prev.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc))
      );
      setEditingDoc(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      setEditError("문서 수정 중 오류가 발생했습니다.");
    } finally {
      setEditingId(null);
    }
  };

  // 필터 + 검색 적용 (실제 DB 문서와 목 데이터 결합)
  const filtered = useMemo(() => {
    // 1. 목 데이터 필터링
    let mockResult = MEETING_DOCS;
    if (filterCat !== "전체") {
      mockResult = mockResult.filter((d) => d.category === filterCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      mockResult = mockResult.filter((d) => d.title.toLowerCase().includes(q));
    }
    const mockSorted = [...mockResult].sort((a, b) => b.id - a.id);

    // 2. 실제 DB 업로드 문서 필터링 (로그인한 경우에만)
    let realResult: RowDocType[] = [];
    if (isLoggedIn && managedDocs) {
      realResult = managedDocs
        .filter((d: Document) => d.category === "DISCLOSURE")
        .map((d: Document) => ({
          id: d.id, // String UUID
          category: normalizeMeetingCategory(d.subCategory),
          title: d.title,
          date: d.documentDate 
            ? d.documentDate.slice(0, 10).replace(/-/g, ".") 
            : d.publishedAt 
              ? d.publishedAt.slice(0, 10).replace(/-/g, ".") 
              : d.createdAt.slice(0, 10).replace(/-/g, "."),
          isImportant: !!d.isStarred || d.title.includes("★") || d.title.includes("중요"),
          correspondenceType: (d.correspondenceType as CorrespondenceType | null) || undefined,
          isReal: true,
          fileName: d.fileName,
          fileSize: d.fileSize,
          sourceDocument: d,
        }))
        .map((d) => ({
          ...d,
          correspondenceType: inferCorrespondenceType(d),
        }));

      if (filterCat !== "전체") {
        realResult = realResult.filter((d) => d.category === filterCat);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        realResult = realResult.filter((d) => d.title.toLowerCase().includes(q));
      }
      
      // 실제 발생일(사건일) 기준 내림차순 정렬, 단 중요 문서가 가장 위로 올라옴
      realResult.sort((a, b) => {
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        return b.date.localeCompare(a.date);
      });
    }

    // 실제 업로드 문서를 상단에 먼저 배치하고, 시연용 목 데이터는 아래에 배치
    return [...realResult, ...mockSorted];
  }, [filterCat, searchQuery, isLoggedIn, managedDocs]);

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

  const handleRowClick = (doc: RowDocType) => {
    if (!isLoggedIn) {
      alert("이 문서는 대방동지역주택조합 정식 조합원 기밀 의무공개 자료입니다.\n자산 가치 보호를 위해 조합원 로그인 세션 내에서만 암호화 열람이 가능합니다.");
      router.push("/login");
    } else {
      if (doc.isReal) {
        if (onViewDocument && doc.sourceDocument) {
          onViewDocument(doc.sourceDocument);
        }
      } else {
        alert("이 문서는 데모 시연용 가상 문서입니다.\n\n실제 PDF 파일의 등록, 인라인 열람 및 실시간 보안 감사 로그 기록 흐름을 연습하시려면, [운영자] 계정으로 로그인 후 [신규 정보공개 문서 등록]에서 '의무 정보 공개 자료'와 해당 세부 분류(문서함)를 지정해 직접 업로드해 보십시오!");
      }
    }
  };

  const renderEditButton = (doc: RowDocType) => {
    if (!isAdmin || !doc.isReal || !doc.sourceDocument) return null;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          openEditModal(doc);
        }}
        className="flex items-center justify-center size-7 rounded-full text-ash hover:text-sky-blue hover:bg-sky-blue/10 active:scale-90 transition-all duration-150 cursor-pointer"
        title="문서 수정"
        aria-label={`${doc.title} 문서 수정`}
      >
        <svg
          className="size-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.688-1.688a1.875 1.875 0 112.652 2.652L9.38 17.273 5.75 18.25l.977-3.63L16.862 4.487z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 7.125L16.875 4.5"
          />
        </svg>
      </button>
    );
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

        {/* 신규 등록 버튼 (관리자 전용) */}
        {isAdmin && (
          <Button
            onClick={() => setShowUploadModal(true)}
            className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-4.5 h-9 cursor-pointer active:scale-95 transition-all duration-200 shrink-0"
          >
            + 신규 문서 등록
          </Button>
        )}

        {/* 총 건수 */}
        <span className="ml-auto text-xs text-graphite font-medium whitespace-nowrap">
          총 <strong className="text-charcoal-primary">{filtered.length}</strong>건
        </span>
      </div>

      {/* ── 데이터 테이블 ── */}
      <div className="bg-white rounded-2xl border border-stone-surface overflow-hidden shadow-sm">
        {/* 데스크톱/태블릿 격자형 테이블 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f6f3] border-b border-stone-surface">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-ash w-14 text-center text-xs">No.</th>
                <th className="px-5 py-3.5 font-semibold text-ash w-32 text-xs">분류</th>
                <th className="px-5 py-3.5 font-semibold text-ash text-xs">문서 제목</th>
                <th className="px-5 py-3.5 font-semibold text-ash w-28 text-center text-xs">발생일</th>
                {isAdmin && <th className="px-5 py-3.5 font-semibold text-ash w-16 text-center text-xs">관리</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-surface/50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-5 py-16 text-center text-sm text-graphite">
                    검색 조건에 맞는 문서가 없습니다.
                  </td>
                </tr>
              ) : (
                paged.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    onClick={() => handleRowClick(doc)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      idx % 2 === 1 ? "bg-[#fdfcfa]" : "bg-white",
                      "hover:bg-sky-blue/[0.04]"
                    )}
                  >
                    <td className="px-5 py-3.5 text-center text-graphite text-xs tabular-nums">
                      {isAdmin && doc.isReal ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStarToggle(String(doc.id), !!doc.isImportant);
                          }}
                          disabled={starringId === doc.id}
                          className="text-base leading-none transition-transform duration-150 active:scale-125 cursor-pointer disabled:opacity-50 select-none"
                          title={doc.isImportant ? "중요 해제" : "중요 표시"}
                        >
                          {doc.isImportant ? "⭐" : "☆"}
                        </button>
                      ) : (
                        (currentPage - 1) * PAGE_SIZE + idx + 1
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap", categoryBadge(doc.category))}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="leading-snug break-all">
                        {doc.isImportant && (
                          <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                            ★ 중요
                          </span>
                        )}
                        <CorrespondenceBadgeForDoc doc={doc} />
                        <span className={cn(
                          "font-semibold text-[13px] leading-snug hover:text-sky-blue transition-colors",
                          doc.isImportant ? "text-charcoal-primary" : "text-charcoal-primary/85"
                        )}>
                          {doc.title}
                        </span>
                        {isRecent(doc.date) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full select-none shrink-0 shadow-3xs ml-1.5 align-middle">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-ash font-mono text-xs whitespace-nowrap">{doc.date}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {renderEditButton(doc)}
                          {doc.isReal && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(String(doc.id), doc.title);
                              }}
                              disabled={deletingId === String(doc.id)}
                              className="flex items-center justify-center size-7 rounded-full text-ash hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all duration-150 cursor-pointer disabled:opacity-40"
                              title="문서 삭제"
                              aria-label={`${doc.title} 문서 삭제`}
                            >
                              {deletingId === String(doc.id) ? (
                                <span className="size-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="size-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 모바일 전용 카드형 리스트 */}
        <div className="block md:hidden divide-y divide-stone-surface/60">
          {paged.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-graphite">
              검색 조건에 맞는 문서가 없습니다.
            </div>
          ) : (
            paged.map((doc, idx) => (
              <div
                key={doc.id}
                onClick={() => handleRowClick(doc)}
                className={cn(
                  "cursor-pointer p-4 transition-colors hover:bg-sky-blue/[0.04] space-y-2",
                  idx % 2 === 1 ? "bg-[#fdfcfa]" : "bg-white"
                )}
              >
                {/* 상단 메타 행 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isAdmin && doc.isReal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarToggle(String(doc.id), !!doc.isImportant);
                        }}
                        disabled={starringId === doc.id}
                        className="text-base leading-none transition-transform duration-150 active:scale-125 cursor-pointer disabled:opacity-50 select-none"
                        title={doc.isImportant ? "중요 해제" : "중요 표시"}
                      >
                        {doc.isImportant ? "⭐" : "☆"}
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-ash tracking-tight">
                      No. {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </span>
                  </div>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap", categoryBadge(doc.category))}>
                    {doc.category}
                  </span>
                </div>
                {/* 중앙 제목 행 */}
                <div className="text-charcoal-primary font-semibold text-[13px] leading-snug break-all">
                  {doc.isImportant && (
                    <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                      ★ 중요
                    </span>
                  )}
                  <CorrespondenceBadgeForDoc doc={doc} />
                  <span>{doc.title}</span>
                  {isRecent(doc.date) && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full select-none shrink-0 shadow-3xs ml-1.5 align-middle">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      NEW
                    </span>
                  )}
                </div>
                {/* 하단 등록일 및 열람 행 */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-ash font-mono">{doc.date}</span>
                  <div className="flex items-center gap-1.5">
                    {isLoggedIn ? (
                      <span className="inline-flex items-center gap-1 text-meadow-green text-[10px] font-bold bg-meadow-green/10 px-2.5 py-1 rounded-full">
                        🔓 열람
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-ember-orange text-[10px] font-bold bg-ember-orange/10 px-2.5 py-1 rounded-full">
                        🔒 보안
                      </span>
                    )}
                    {doc.isReal && isAdmin && (
                      <>
                        {renderEditButton(doc)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(String(doc.id), doc.title);
                          }}
                          disabled={deletingId === String(doc.id)}
                          className="flex items-center justify-center size-7 rounded-full text-ash hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all duration-150 cursor-pointer disabled:opacity-40"
                          title="문서 삭제"
                          aria-label={`${doc.title} 문서 삭제`}
                        >
                          {deletingId === String(doc.id) ? (
                            <span className="size-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg
                              className="size-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
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

      {/* 문서 삭제 확인 팝업 모달 (관리자용) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <button
            type="button"
            aria-label="삭제 확인 닫기"
            onClick={() => {
              if (!deletingId) setDeleteTarget(null);
            }}
            className="absolute inset-0 cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${deleteTarget.title} 삭제 확인`}
            className="relative w-full max-w-md rounded-2xl border border-stone-surface bg-warm-canvas p-6 text-left shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-orange/10 text-ember-orange">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-charcoal-primary">
                  문서를 삭제할까요?
                </h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-charcoal-primary">
                  {deleteTarget.title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-graphite">
                  삭제된 문서와 첨부파일은 복구할 수 없습니다.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="rounded-full border-stone-surface text-xs font-bold text-graphite hover:bg-stone-surface disabled:opacity-60"
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={!!deletingId}
                className="rounded-full bg-midnight px-5 text-xs font-bold text-white hover:bg-charcoal-primary disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "삭제 중..." : "영구 삭제"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 신규 문서 등록 팝업 모달 (관리자용) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-warm-canvas border border-stone-surface shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-surface mb-4">
              <h3 className="text-sm font-bold text-charcoal-primary">신규 정보공개 문서 등록 및 공개</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>
            {/* 등록 성공 시 팝업 닫고 리프레시 진행 */}
            <DocumentUploadForm
              defaultCategory="DISCLOSURE"
              defaultSubCategory={filterCat !== "전체" ? filterCat : "총회 의사록"}
              onSuccess={(uploadedDocument) => {
                if (uploadedDocument) {
                  setManagedDocs((prev) => [
                    uploadedDocument,
                    ...prev.filter((document) => document.id !== uploadedDocument.id),
                  ]);
                  setPage(1);
                }
                setShowUploadModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 문서 메타데이터 수정 팝업 모달 (관리자용) */}
      {editingDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setEditingDoc(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-warm-canvas border border-stone-surface shadow-2xl p-6 text-left animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-surface mb-4">
              <div>
                <h3 className="text-sm font-bold text-charcoal-primary">정보공개 문서 수정</h3>
                <p className="mt-1 text-[11px] text-graphite">문서 정보와 첨부파일을 함께 수정할 수 있습니다.</p>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="soft-panel p-5 bg-white border border-[#f2f0ed] rounded-2xl">
              {editError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {editError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-doc-title">
                    문서 제목 *
                  </label>
                  <input
                    id="edit-doc-title"
                    type="text"
                    value={editingDoc.title}
                    onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                    required
                    className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-doc-desc">
                    문서 설명 (선택)
                  </label>
                  <input
                    id="edit-doc-desc"
                    type="text"
                    value={editingDoc.description}
                    onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#848281] focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-doc-subcat">
                    문서함 세부 분류 *
                  </label>
                  <select
                    id="edit-doc-subcat"
                    value={editingDoc.subCategory}
                    onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, subCategory: e.target.value as MeetingCategory } : prev)}
                    className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange"
                  >
                    {CATEGORIES.filter((category): category is MeetingCategory => category !== "전체").map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-stone-surface bg-[#f8f7f4] p-3">
                  <p className="text-[11px] font-bold text-charcoal-primary">
                    현재 첨부 파일: {editingDoc.fileName}
                  </p>
                  <label className="mt-3 block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-main-file">
                    첨부 파일 교체 (PDF/HWP/Word)
                  </label>
                  <input
                    id="edit-main-file"
                    type="file"
                    accept=".pdf,.hwp,.hwpx,.doc,.docx"
                    onChange={(e) => {
                      const nextFile = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                      setEditingDoc((prev) => prev ? { ...prev, replacementFile: nextFile } : prev);
                    }}
                    className="w-full text-xs text-graphite file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#f2f0ed] file:text-charcoal-primary hover:file:bg-parchment-card"
                  />
                  {editingDoc.replacementFile && (
                    <p className="mt-2 text-[10px] font-medium text-sky-blue">
                      새 첨부 파일: {editingDoc.replacementFile.name}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-stone-surface bg-[#f8f7f4] p-3">
                  <p className="text-[11px] font-bold text-charcoal-primary">현재 추가 첨부파일</p>
                  {editingDoc.attachments.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-[10px] text-graphite list-disc list-inside">
                      {editingDoc.attachments.map((attachment) => (
                        <li key={attachment.id} className="truncate">
                          {attachment.fileName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[10px] text-ash">등록된 추가 첨부파일이 없습니다.</p>
                  )}
                  <label className="mt-3 block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-attachments">
                    추가 첨부파일 교체 (선택, 최대 10개)
                  </label>
                  <input
                    id="edit-attachments"
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (files.length > 10) {
                        setEditError("추가 첨부파일은 최대 10개까지만 등록 가능합니다.");
                        setEditingDoc((prev) => prev ? { ...prev, replacementAttachments: [] } : prev);
                        e.target.value = "";
                        return;
                      }
                      setEditError("");
                      setEditingDoc((prev) => prev ? { ...prev, replacementAttachments: files } : prev);
                    }}
                    className="w-full text-xs text-graphite file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#f2f0ed] file:text-charcoal-primary hover:file:bg-parchment-card"
                  />
                  {editingDoc.replacementAttachments.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[10px] text-sky-blue list-disc list-inside">
                      {editingDoc.replacementAttachments.map((attachment, index) => (
                        <li key={`${attachment.name}-${index}`} className="truncate">
                          새 추가 첨부파일: {attachment.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {editingDoc.subCategory === "수발신 공문" && (
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-doc-correspondence-type">
                      수발신 구분 *
                    </label>
                    <select
                      id="edit-doc-correspondence-type"
                      value={editingDoc.correspondenceType}
                      onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, correspondenceType: e.target.value as CorrespondenceType } : prev)}
                      className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange"
                    >
                      {(["수신", "발신", "회신"] as const).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-doc-date">
                      발생일 *
                    </label>
                    <input
                      id="edit-doc-date"
                      type="date"
                      value={editingDoc.documentDate}
                      onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, documentDate: e.target.value } : prev)}
                      required
                      className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-primary mb-1.5" htmlFor="edit-doc-published">
                      등록일 (공개일) *
                    </label>
                    <input
                      id="edit-doc-published"
                      type="date"
                      value={editingDoc.publishedAt}
                      onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, publishedAt: e.target.value } : prev)}
                      required
                      className="w-full rounded-xl border border-[#f2f0ed] bg-[#fbfaf9] px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    id="edit-doc-starred"
                    type="checkbox"
                    checked={editingDoc.isStarred}
                    onChange={(e) => setEditingDoc((prev) => prev ? { ...prev, isStarred: e.target.checked } : prev)}
                    className="size-4 rounded border-[#f2f0ed] text-ember-orange focus:ring-ember-orange cursor-pointer"
                  />
                  <label className="text-xs font-semibold text-charcoal-primary select-none cursor-pointer" htmlFor="edit-doc-starred">
                    중요 문서로 표시
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingDoc(null)}
                    className="rounded-full border-stone-surface text-xs font-bold text-graphite hover:bg-stone-surface"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={editingId === editingDoc.id}
                    className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 disabled:opacity-60"
                  >
                    {editingId === editingDoc.id ? "수정 중..." : "수정 저장"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
