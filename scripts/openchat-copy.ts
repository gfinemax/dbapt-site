import {
  markOpenChatAnnouncementCopied,
  type OpenChatAnnouncementPrisma,
} from "../src/lib/notifications/openchat-announcements.ts";
import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm openchat:copy -- --announcement-id <announcementId>
pnpm openchat:copy -- --document-id <documentId> --mark-copied

Options:
  --announcement-id <id>  Announcement id to print
  --document-id <id>      Print the latest non-archived announcement for a document
  --mark-copied           Mark the announcement as COPIED after printing
  --help                  Show this message
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const announcementId = getText(args, "announcement-id", "DBAPT_OPENCHAT_ANNOUNCEMENT_ID");
  const documentId = getText(args, "document-id", "DBAPT_OPENCHAT_DOCUMENT_ID");
  const markCopied = getFlag(args, "mark-copied", "DBAPT_OPENCHAT_MARK_COPIED");

  if (!announcementId && !documentId) {
    throw new Error("announcement-id or document-id is required.");
  }

  const prisma = createPrismaClient();
  try {
    const announcement = announcementId
      ? await prisma.openChatAnnouncement.findUnique({ where: { id: announcementId } })
      : await prisma.openChatAnnouncement.findFirst({
          where: {
            documentId,
            status: { not: "ARCHIVED" },
          },
          orderBy: { updatedAt: "desc" },
        });

    if (!announcement) {
      throw new Error(`OpenChat announcement not found: ${announcementId || documentId}`);
    }

    console.log(announcement.message);

    if (markCopied) {
      await markOpenChatAnnouncementCopied({
        prisma: prisma as unknown as OpenChatAnnouncementPrisma,
        announcementId: announcement.id,
      });
      console.log(`\nMARKED_COPIED announcementId=${announcement.id}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
