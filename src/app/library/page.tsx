import { LibraryClient } from "@/components/library/library-client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";
import { type Document } from "@/components/portal/document-table";

export default async function LibraryPage() {
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
  let documents: Document[] = [];

  if (session) {
    try {
      const docs = await prisma.document.findMany({
        where: session.role === "ADMIN" ? {} : { status: "APPROVED" },
        include: {
          attachments: true,
        },
        orderBy: { documentDate: "desc" },
      });

      documents = serializeDocuments(docs);
    } catch (error) {
      console.error("Error loading library documents:", error);
    }
  }

  return <LibraryClient isLoggedIn={!!session} isAdmin={session?.role === "ADMIN"} documents={documents} />;
}
