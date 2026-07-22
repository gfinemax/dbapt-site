import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDocumentCreatePage } from "@/components/portal/admin-document-create-page";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";

export const metadata: Metadata = { title: "새 문서 등록 | 대방동 지역주택조합" };
export const dynamic = "force-dynamic";

export default async function NewAdminDocumentPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const replyTargets = await prisma.document.findMany({
    where: { correspondenceType: "수신" },
    include: { attachments: true },
    orderBy: { documentDate: "desc" },
  });

  return <AdminDocumentCreatePage replyTargetDocuments={serializeDocuments(replyTargets)} />;
}
