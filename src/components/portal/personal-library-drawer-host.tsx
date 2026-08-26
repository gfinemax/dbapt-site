"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { PersonalLibraryNavigation } from "@/components/portal/personal-library-navigation";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import { type Document } from "@/components/portal/document-table";
import { PdfViewerModal } from "@/components/portal/pdf-viewer-modal";
import { getPersonalLibraryLabel } from "@/lib/personal-library-label";
import { getPdfRelatedDocument } from "@/lib/document-relations";
import type { ContributionDashboardView, ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";
import type { PersonalLibraryContentBookmark } from "@/lib/personal-library-data";

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
  contentBookmarks?: PersonalLibraryContentBookmark[];
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
    memberType?: string | null;
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
  contentBookmarks = [],
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
            onClick={(event) => event.stopPropagation()}
            className="fixed inset-0 z-[70] flex w-full flex-col overflow-hidden bg-warm-canvas"
            aria-label={`${personalLibraryLabel} 드로어`}
          >
            <div className="flex items-center justify-between border-b border-stone-surface bg-white px-5 py-4 md:hidden">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-sky-blue text-xs font-semibold text-white">
                  D
                </span>
                <h2 className="text-base font-bold text-charcoal-primary">
                  {personalLibraryLabel}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  onClick={() => window.dispatchEvent(new CustomEvent("close-portal"))}
                  className="rounded-full bg-midnight px-3 py-1.5 text-xs font-semibold text-white"
                >
                  홈으로
                </Link>
                <button
                  onClick={() => {
                    setActiveViewDoc(null);
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] px-3 py-1.5 text-xs font-medium text-graphite transition duration-200 hover:bg-stone-surface active:bg-[#e8e6e1] cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>

            <div className={`grid min-h-0 flex-1 ${session?.role === "ADMIN" ? "md:grid-cols-[216px_minmax(0,1fr)]" : "md:grid-cols-[168px_minmax(0,1fr)]"}`}>
              <PersonalLibraryNavigation
                name={session?.name}
                role={session?.role}
                documentCount={documents.length}
                disclosureDocumentCount={documents.filter((document) => document.category === "DISCLOSURE").length}
                accountingDocumentCount={documents.filter((document) => document.category === "ACCOUNTING").length}
                pendingUserCount={pendingUsers.length}
                onSelectDocumentCategory={setPortalCategory}
              />
              <div className="min-w-0 overflow-y-auto pb-16">
              {session ? (
                <PortalShell
                  role={getPortalRole(session.role)}
                  session={session}
                  documents={documents}
                  contentBookmarks={contentBookmarks}
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
