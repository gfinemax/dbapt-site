import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";
import { serializeContributionSummary, serializePaymentNotices } from "@/lib/contribution-serializer";
import { type Document } from "@/components/portal/document-table";
import type { ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";

export const metadata: Metadata = {
  title: "정식 조합원 포털 | 대방동 지역주택조합",
};

export default async function MemberPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;
  
  let documents: Document[] = [];
  let contributionSummary: ContributionSummaryView | null = null;
  let paymentNotices: PaymentNoticeView[] = [];
  if (session) {
    try {
      const [docs, summary, notices] = await Promise.all([
        prisma.document.findMany({
          where: { status: "APPROVED" },
          include: {
            attachments: true,
          },
          orderBy: { documentDate: "desc" },
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
      // Convert dates to ISO strings to pass safely to Client Components
      documents = serializeDocuments(docs);
      contributionSummary = serializeContributionSummary(summary);
      paymentNotices = serializePaymentNotices(notices);
    } catch (e) {
      console.error("Error loading member portal documents:", e);
    }
  }

  return (
    <PortalShell
      role="member"
      session={session}
      documents={documents}
      contributionSummary={contributionSummary}
      paymentNotices={paymentNotices}
    />
  );
}
