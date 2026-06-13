import {
  upsertOpenChatAnnouncementForDocument,
  type OpenChatAnnouncementPrisma,
} from "../src/lib/notifications/openchat-announcements.ts";
import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
  requireValue,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm openchat:generate -- --document-id <documentId>

Options:
  --document-id <id>  Target disclosure document id
  --force             Create a new DRAFT even if the latest announcement is COPIED
  --help              Show this message
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const documentId = requireValue(getText(args, "document-id", "DBAPT_OPENCHAT_DOCUMENT_ID"), "document-id is required.");
  const force = getFlag(args, "force", "DBAPT_OPENCHAT_FORCE");
  const prisma = createPrismaClient();

  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const result = await upsertOpenChatAnnouncementForDocument({
      prisma: prisma as unknown as OpenChatAnnouncementPrisma,
      document,
      force,
    });

    console.log(`OPENCHAT_GENERATE_RESULT status=${result.status} reason=${result.skippedReason || "none"} announcementId=${result.announcementId || "none"}`);
    if (result.message) {
      console.log(result.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
