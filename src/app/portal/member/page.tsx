import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { emptyPersonalLibraryData, loadPersonalLibraryData } from "@/lib/personal-library-data";

export const metadata: Metadata = {
  title: "정식 조합원 포털 | 대방동 지역주택조합",
};

export default async function MemberPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;
  let personalLibraryData = emptyPersonalLibraryData();

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (e) {
      console.error("Error loading member portal documents:", e);
    }
  }

  return (
    <PortalShell
      role="member"
      session={session}
      documents={personalLibraryData.documents}
      contributionSummary={personalLibraryData.contributionSummary}
      contributionDashboard={personalLibraryData.contributionDashboard}
      paymentNotices={personalLibraryData.paymentNotices}
    />
  );
}
