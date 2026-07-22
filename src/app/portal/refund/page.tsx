import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { emptyPersonalLibraryData, loadPersonalLibraryData } from "@/lib/personal-library-data";

export const metadata: Metadata = {
  title: "환불조합원 포털 | 대방동 지역주택조합",
};

export default async function RefundPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;
  let personalLibraryData = emptyPersonalLibraryData();

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (e) {
      console.error("Error loading refund portal data:", e);
    }
  }

  return (
    <PortalShell
      role="refund"
      session={session}
      documents={personalLibraryData.documents}
      contentBookmarks={personalLibraryData.contentBookmarks}
      refundInfo={personalLibraryData.refundInfo}
      contributionSummary={personalLibraryData.contributionSummary}
      contributionDashboard={personalLibraryData.contributionDashboard}
      paymentNotices={personalLibraryData.paymentNotices}
    />
  );
}
