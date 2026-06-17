import { LibraryClient } from "@/components/library/library-client";
import { getSession } from "@/lib/auth";
import {
  emptyPersonalLibraryData,
  loadPersonalLibraryData,
  type PersonalLibrarySession,
} from "@/lib/personal-library-data";
import { PersonalLibraryDrawerHost } from "@/components/portal/personal-library-drawer-host";

type LibraryPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const session = (await getSession()) as PersonalLibrarySession | null;
  let personalLibraryData = emptyPersonalLibraryData();

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (error) {
      console.error("Error loading library page personal library data:", error);
    }
  }

  return (
    <PersonalLibraryDrawerHost session={session} {...personalLibraryData}>
      <LibraryClient
        isLoggedIn={!!session}
        isAdmin={session?.role === "ADMIN"}
        documents={personalLibraryData.documents}
        initialCategory={resolvedSearchParams?.category}
        initialSearch={resolvedSearchParams?.q}
      />
    </PersonalLibraryDrawerHost>
  );
}
