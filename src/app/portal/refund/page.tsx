import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";
import { serializeContributionSummary, serializePaymentNotices } from "@/lib/contribution-serializer";

import { type Document } from "@/components/portal/document-table";
import type { ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";

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
  let contributionSummary: ContributionSummaryView | null = null;
  let paymentNotices: PaymentNoticeView[] = [];

  if (session) {
    try {
      const [docs, refundRecord, summary, notices] = await Promise.all([
        prisma.document.findMany({
          where: { status: "APPROVED" },
          include: {
            attachments: true,
          },
          orderBy: { documentDate: "desc" },
        }),
        prisma.refundInfo.findUnique({
          where: { userId: session.id },
        }),
        prisma.contributionSummary.findUnique({
          where: { userId: session.id },
        }),
        prisma.paymentNotice.findMany({
          where: {
            userId: session.id,
            status: { in: ["DRAFT", "APPROVED"] },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      documents = serializeDocuments(docs);
      if (refundRecord) {
        refundInfo = {
          ...refundRecord,
          targetDate: refundRecord.targetDate ? refundRecord.targetDate.toISOString() : null,
          updatedAt: refundRecord.updatedAt.toISOString(),
        };
      }
      contributionSummary = serializeContributionSummary(summary);
      paymentNotices = serializePaymentNotices(notices);
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
      contributionSummary={contributionSummary}
      paymentNotices={paymentNotices}
    />
  );
}
