import { getSession } from "@/lib/auth";
import { HomeClient } from "@/components/landing/home-client";
import { emptyPersonalLibraryData, loadPersonalLibraryData } from "@/lib/personal-library-data";

export default async function Home() {
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;

  let personalLibraryData = emptyPersonalLibraryData();

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (e) {
      console.error("Error loading homepage session data:", e);
    }
  }

  return (
    <HomeClient
      session={session}
      documents={personalLibraryData.documents}
      logs={personalLibraryData.logs}
      refundInfo={personalLibraryData.refundInfo}
      pendingUsers={personalLibraryData.pendingUsers}
      approvedSocialUsers={personalLibraryData.approvedSocialUsers}
      contributionSummary={personalLibraryData.contributionSummary}
      contributionDashboard={personalLibraryData.contributionDashboard}
      paymentNotices={personalLibraryData.paymentNotices}
    />
  );
}
