import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { type Document } from "@/components/portal/document-table";

export const metadata: Metadata = {
  title: "환불조합원 포털 | 대방동 지역주택조합",
};

export default async function RefundPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;

  let documents: Document[] = [];
  let refundInfo: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
    updatedAt: string;
  } | null = null;

  if (session) {
    try {
      // 1. Fetch approved documents
      const docs = await prisma.document.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      });
      documents = docs.map(doc => ({
        ...doc,
        publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }));

      // 2. Fetch refundInfo linked to user
      const refundRecord = await prisma.refundInfo.findUnique({
        where: { userId: session.id },
      });
      if (refundRecord) {
        refundInfo = {
          ...refundRecord,
          targetDate: refundRecord.targetDate ? refundRecord.targetDate.toISOString() : null,
          updatedAt: refundRecord.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.error("Error loading refund portal data:", e);
    }
  }

  return (
    <PortalShell
      role="refund"
      session={session}
      documents={documents}
      refundInfo={refundInfo}
    />
  );
}
