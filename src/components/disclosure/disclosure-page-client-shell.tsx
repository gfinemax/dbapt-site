"use client";

import { useState, useEffect } from "react";
import { AboutClient } from "@/components/about/about-client";
import { PdfViewerModal } from "../portal/pdf-viewer-modal";
import { SiteFooter } from "@/components/landing/site-footer";
import { DisclosureClient } from "./disclosure-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { type Document, type Attachment } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import { cn } from "@/lib/utils";

type DisclosurePageClientShellProps = {
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
  documents?: Document[];
  logs?: LogEntry[];
  refundInfo?: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null;
  pendingUsers?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
  approvedSocialUsers?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
};

export function DisclosurePageClientShell({
  session,
  documents = [],
  logs = [],
  refundInfo,
  pendingUsers = [],
  approvedSocialUsers = [],
}: DisclosurePageClientShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAboutDrawerOpen, setIsAboutDrawerOpen] = useState(false);
  const [isDisclosureDrawerOpen, setIsDisclosureDrawerOpen] = useState(false);
  const [portalCategory, setPortalCategory] = useState<string>("all");
  const [portalSearch, setPortalSearch] = useState<string>("");
  const [activeViewDoc, setActiveViewDoc] = useState<{ 
    id: string; 
    title: string; 
    documentDate?: string;
    fileSize?: number;
    category?: string;
    subCategory?: string | null;
    description?: string | null;
    attachmentName?: string | null;
    attachments?: Attachment[];
    publishedAt?: string | null;
  } | null>(null);

  // 드로어 활성화 시 본문 스크롤 차단 처리 (디테일한 UX 보장)
  useEffect(() => {
    if (isDrawerOpen || isAboutDrawerOpen || isDisclosureDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, isAboutDrawerOpen, isDisclosureDrawerOpen]);

  // 커스텀 이벤트 리스너: 글로벌 헤더에서 포털/소개/공개자료 열기 및 닫기 요청 수신
  useEffect(() => {
    const handleOpenPortal = (e?: Event) => {
      setIsAboutDrawerOpen(false);
      setIsDisclosureDrawerOpen(false);
      setIsDrawerOpen(true);
      if (e instanceof CustomEvent && e.detail) {
        if (e.detail.category) setPortalCategory(e.detail.category);
        if (e.detail.search) setPortalSearch(e.detail.search);
      } else {
        setPortalCategory("all");
        setPortalSearch("");
      }
    };
    const handleOpenAbout = () => {
      setIsDrawerOpen(false);
      setIsDisclosureDrawerOpen(false);
      setIsAboutDrawerOpen(true);
    };
    const handleOpenDisclosure = () => {
      setIsDrawerOpen(false);
      setIsAboutDrawerOpen(false);
      setIsDisclosureDrawerOpen(true);
    };
    const handleClosePortal = () => {
      setIsDrawerOpen(false);
      setIsAboutDrawerOpen(false);
      setIsDisclosureDrawerOpen(false);
    };

    window.addEventListener('open-portal', handleOpenPortal);
    window.addEventListener('open-about', handleOpenAbout);
    window.addEventListener('open-disclosure', handleOpenDisclosure);
    window.addEventListener('close-portal', handleClosePortal);
    return () => {
      window.removeEventListener('open-portal', handleOpenPortal);
      window.removeEventListener('open-about', handleOpenAbout);
      window.removeEventListener('open-disclosure', handleOpenDisclosure);
      window.removeEventListener('close-portal', handleClosePortal);
    };
  }, []);

  const getPortalRole = (roleStr: string) => {
    switch (roleStr) {
      case "ADMIN":
        return "admin";
      case "REFUND":
        return "refund";
      case "MEMBER":
      default:
        return "member";
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-warm-canvas">
      {/* 1. 사이트 공통 헤더 (세션 정보와 포털 개방 핸들러 전달) - layout.tsx로 이동됨 */}

      {/* 2. 공개자료 페이지 콘텐츠 */}
      <main className="flex-1 animate-page-in">
        <DisclosureClient 
          onOpenPortal={(category, search) => {
            setPortalCategory(category || "all");
            setPortalSearch(search || "");
            setIsDrawerOpen(true);
          }} 
          session={session} 
          documents={documents}
          onViewDocument={(id, title) => {
            const matched = documents.find(d => d.id === id);
            if (matched) {
              setActiveViewDoc({
                id,
                title,
                documentDate: matched.documentDate || matched.publishedAt || matched.createdAt || undefined,
                fileSize: matched.fileSize,
                category: matched.category,
                subCategory: matched.subCategory,
                description: matched.description,
                attachmentName: matched.attachmentName,
                attachments: matched.attachments,
                publishedAt: matched.publishedAt
              });
            } else {
              setActiveViewDoc({ id, title });
            }
          }}
        />
      </main>

      {/* 3. 사이트 공통 푸터 */}
      <SiteFooter />

      {/* 우측 사이드 슬라이드 오버 (Drawer) 패널 */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-warm-canvas border-l border-stone-surface shadow-2xl pt-6 px-6 pb-20 sm:p-8 flex flex-col transition-transform duration-300 ease-in-out transform overflow-y-auto",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="조합원 전용 자료실 드로어"
      >
        <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-sky-blue text-xs font-semibold text-white">
              D
            </span>
            <h2 className="text-base font-bold text-charcoal-primary">
              조합원 전용 자료실
            </h2>
          </div>
          
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            닫기
          </button>
        </div>

        <div className="flex-1 mt-6">
          {session ? (
            <PortalShell
              role={getPortalRole(session.role)}
              session={session}
              documents={documents}
              logs={logs}
              refundInfo={refundInfo}
              pendingUsers={pendingUsers}
              approvedSocialUsers={approvedSocialUsers}
              isDrawerMode={true}
              initialCategory={portalCategory}
              initialSearch={portalSearch}
            />
          ) : (
            <div className="py-20 text-center">
              <p className="text-xs text-graphite/70">
                인증 세션이 만료되었습니다. 다시 로그인해 주십시오.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* ==========================================
          조합소개 (About) 드로어 패널
          ========================================== */}
      {isAboutDrawerOpen && (
        <div
          onClick={() => setIsAboutDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-warm-canvas border-l border-stone-surface shadow-2xl pt-6 px-6 pb-20 sm:p-8 flex flex-col transition-transform duration-300 ease-in-out transform overflow-y-auto",
          isAboutDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="조합 소개 드로어"
      >
        <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-sky-blue text-xs font-semibold text-white">
              A
            </span>
            <h2 className="text-base font-bold text-charcoal-primary">
              조합 소개
            </h2>
          </div>
          
          <button
            onClick={() => setIsAboutDrawerOpen(false)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            닫기
          </button>
        </div>

        <div className="flex-1 mt-6">
          <AboutClient onOpenPortal={() => { setIsAboutDrawerOpen(false); setIsDrawerOpen(true); }} />
        </div>
      </div>

      {/* ==========================================
          공개자료 (Disclosure) 드로어 패널
          ========================================== */}
      {isDisclosureDrawerOpen && (
        <div
          onClick={() => setIsDisclosureDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-warm-canvas border-l border-stone-surface shadow-2xl pt-6 px-6 pb-20 sm:p-8 flex flex-col transition-transform duration-300 ease-in-out transform overflow-y-auto",
          isDisclosureDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="정보 공개 드로어"
      >
        <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-sky-blue text-xs font-semibold text-white">
              I
            </span>
            <h2 className="text-base font-bold text-charcoal-primary">
              정보 공개
            </h2>
          </div>
          
          <button
            onClick={() => setIsDisclosureDrawerOpen(false)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            닫기
          </button>
        </div>

        <div className="flex-1 mt-6">
          <DisclosureClient
            session={session}
            documents={documents}
            onViewDocument={(id, title) => {
              setIsDisclosureDrawerOpen(false);
              const matched = documents.find(d => d.id === id);
              if (matched) {
                setActiveViewDoc({
                  id,
                  title,
                  documentDate: matched.documentDate || matched.publishedAt || matched.createdAt || undefined,
                  fileSize: matched.fileSize,
                  category: matched.category,
                  subCategory: matched.subCategory,
                  description: matched.description,
                  attachmentName: matched.attachmentName,
                  attachments: matched.attachments,
                  publishedAt: matched.publishedAt
                });
              } else {
                setActiveViewDoc({ id, title });
              }
            }}
            onOpenPortal={(cat, search) => {
              setIsDisclosureDrawerOpen(false);
              setPortalCategory(cat || "all");
              setPortalSearch(search || "");
              setIsDrawerOpen(true);
            }}
          />
        </div>
      </div>

      {/* 실시간 보안 인라인 PDF 뷰어 모달 */}
      {activeViewDoc && (
        <PdfViewerModal
          documentId={activeViewDoc.id}
          documentTitle={activeViewDoc.title}
          onClose={() => setActiveViewDoc(null)}
          documentDate={activeViewDoc.documentDate}
          fileSize={activeViewDoc.fileSize}
          category={activeViewDoc.category}
          subCategory={activeViewDoc.subCategory}
          description={activeViewDoc.description}
          publishedAt={activeViewDoc.publishedAt || undefined}
          attachments={activeViewDoc.attachments}
        />
      )}
    </div>
  );
}
