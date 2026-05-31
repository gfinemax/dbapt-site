import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";
import { type Document } from "@/components/portal/document-table";

export const metadata: Metadata = {
  title: "정식 조합원 포털 | 대방동 지역주택조합",
};

export default async function MemberPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;
  
  let documents: Document[] = [];
  if (session) {
    try {
      const docs = await prisma.document.findMany({
        where: { status: "APPROVED" },
        include: {
          attachments: true,
        },
        orderBy: { documentDate: "desc" },
      });
      // Convert dates to ISO strings to pass safely to Client Components
      documents = serializeDocuments(docs);
    } catch (e) {
      console.error("Error loading member portal documents:", e);
    }
  }

  return (
    <PortalShell
      role="member"
      session={session}
      documents={documents}
    />
  );
}
