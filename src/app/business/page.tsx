import { getSession } from "@/lib/auth";
import {
  emptyPersonalLibraryData,
  loadPersonalLibraryData,
  type PersonalLibrarySession,
} from "@/lib/personal-library-data";
import { BusinessClient } from "@/components/business/business-client";
import { PersonalLibraryDrawerHost } from "@/components/portal/personal-library-drawer-host";

export default async function BusinessPage() {
  const session = (await getSession()) as PersonalLibrarySession | null;
  let personalLibraryData = emptyPersonalLibraryData();

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (error) {
      console.error("Error loading business page personal library data:", error);
    }
  }

  return (
    <PersonalLibraryDrawerHost session={session} {...personalLibraryData}>
      <div className="min-h-screen bg-warm-canvas">
        <BusinessClient />
      </div>
    </PersonalLibraryDrawerHost>
  );
}
