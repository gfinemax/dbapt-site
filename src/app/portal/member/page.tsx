import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
        orderBy: { createdAt: "desc" },
      });
      // Convert dates to ISO strings to pass safely to Client Components
      documents = docs.map(doc => ({
        ...doc,
        publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }));
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
