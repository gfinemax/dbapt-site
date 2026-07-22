"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DocumentUploadForm } from "@/components/portal/document-upload-form";
import type { Document } from "@/components/portal/document-table";

type AdminDocumentCreatePageProps = {
  replyTargetDocuments: Document[];
};

export function AdminDocumentCreatePage({ replyTargetDocuments }: AdminDocumentCreatePageProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-warm-canvas px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/portal/admin#portal-documents-section" className="inline-flex items-center gap-2 text-xs font-semibold text-graphite hover:text-charcoal-primary">
            <ArrowLeft className="size-4" /> 전체 등록 문서 목록
          </Link>
          <span className="rounded-full bg-sky-blue/10 px-3 py-1 text-[11px] font-bold text-sky-blue">관리자 문서 관리</span>
        </div>

        <section className="rounded-3xl border border-stone-surface bg-white p-5 shadow-sm sm:p-8">
          <p className="mb-6 text-sm leading-6 text-graphite">
            관련 문서 목록에서 시작한 등록 화면입니다. 등록이 완료되면 전체 문서 목록으로 돌아갑니다.
          </p>
          <DocumentUploadForm
            replyTargetDocuments={replyTargetDocuments}
            onSuccess={() => {
              router.push("/portal/admin#portal-documents-section");
              router.refresh();
            }}
          />
        </section>
      </div>
    </main>
  );
}
