"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import { type Document } from "@/components/portal/document-table";
import { PdfViewerModal } from "@/components/portal/pdf-viewer-modal";
import { getPersonalLibraryLabel } from "@/lib/personal-library-label";
import { getPdfRelatedDocument } from "@/lib/document-relations";
import type { ContributionDashboardView, ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";

type PersonalLibrarySession = {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
  email?: string;
};

type PersonalLibraryDrawerHostProps = {
  children: ReactNode;
  session?: PersonalLibrarySession | null;
  documents?: Document[];
  logs?: LogEntry[];
  refundInfo?: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null;
  contributionSummary?: ContributionSummaryView | null;
  contributionDashboard?: ContributionDashboardView | null;
  paymentNotices?: PaymentNoticeView[];
  pendingUsers?: {
    id: string;
    name: string;
    email: string;
    signupName?: string | null;
    signupPhone?: string | null;
    signupMemo?: string | null;
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

function getPortalRole(role: string) {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "REFUND":
      return "refund";
    case "MEMBER":
    default:
      return "member";
  }
}

export function PersonalLibraryDrawerHost({
  children,
  session,
  documents = [],
  logs = [],
  refundInfo,
  contributionSummary,
  contributionDashboard,
  paymentNotices = [],
  pendingUsers = [],
  approvedSocialUsers = [],
}: PersonalLibraryDrawerHostProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [portalCategory, setPortalCategory] = useState("all");
  const [portalSearch, setPortalSearch] = useState("");
  const [activeViewDoc, setActiveViewDoc] = useState<Document | null>(null);
  const activeViewDocRelation = activeViewDoc ? getPdfRelatedDocument(activeViewDoc, documents) : null;
  const personalLibraryLabel = getPersonalLibraryLabel(session);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen || activeViewDoc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeViewDoc, isDrawerOpen]);

  useEffect(() => {
    const handleOpenPortal = (event?: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        setPortalCategory(event.detail.category || "all");
        setPortalSearch(event.detail.search || "");
      } else {
        setPortalCategory("all");
        setPortalSearch("");
      }
      setIsDrawerOpen(true);
    };
    const handleClosePortal = () => {
      setActiveViewDoc(null);
      setIsDrawerOpen(false);
    };

    window.addEventListener("open-portal", handleOpenPortal);
    window.addEventListener("close-portal", handleClosePortal);
    return () => {
      window.removeEventListener("open-portal", handleOpenPortal);
      window.removeEventListener("close-portal", handleClosePortal);
    };
  }, []);

  return (
    <>
      {children}

      {isDrawerOpen && (
        <>
          <div
            onClick={() => {
              setActiveViewDoc(null);
              setIsDrawerOpen(false);
            }}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-warm-canvas border-l border-stone-surface shadow-2xl pt-6 px-6 pb-20 sm:p-8 flex flex-col transition-transform duration-300 ease-in-out transform overflow-y-auto"
            aria-label={`${personalLibraryLabel} 드로어`}
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-sky-blue text-xs font-semibold text-white">
                  D
                </span>
                <h2 className="text-base font-bold text-charcoal-primary">
                  {personalLibraryLabel}
                </h2>
              </div>

              <button
                onClick={() => {
                  setActiveViewDoc(null);
                  setIsDrawerOpen(false);
                }}
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
                  contributionSummary={contributionSummary}
                  contributionDashboard={contributionDashboard}
                  paymentNotices={paymentNotices}
                  pendingUsers={pendingUsers}
                  approvedSocialUsers={approvedSocialUsers}
                  isDrawerMode
                  initialCategory={portalCategory}
                  initialSearch={portalSearch}
                  onOpenDocument={setActiveViewDoc}
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
        </>
      )}

      {activeViewDoc && (
        <PdfViewerModal
          documentId={activeViewDoc.id}
          documentTitle={activeViewDoc.title}
          fileName={activeViewDoc.fileName}
          onClose={() => setActiveViewDoc(null)}
          documentDate={activeViewDoc.documentDate || activeViewDoc.publishedAt || activeViewDoc.createdAt || undefined}
          createdAt={activeViewDoc.createdAt}
          publishedAt={activeViewDoc.publishedAt || undefined}
          fileSize={activeViewDoc.fileSize}
          category={activeViewDoc.category}
          subCategory={activeViewDoc.subCategory}
          description={activeViewDoc.description}
          attachments={activeViewDoc.attachments}
          relatedDocument={activeViewDocRelation?.document}
          relatedDocumentLabel={activeViewDocRelation?.label}
        />
      )}
    </>
  );
}
