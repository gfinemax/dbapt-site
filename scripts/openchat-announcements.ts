import {
  formatOpenChatAnnouncement,
  type FormattedOpenChatAnnouncement,
} from "../src/lib/notifications/openchat-announcements.ts";
import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm openchat:announcements
pnpm openchat:announcements -- --document-id <documentId> --include-archived

Options:
  --document-id <id>      Filter by document id
  --limit <number>        Number of announcements to show, defaults to 10
  --include-archived      Include archived announcements
  --help                  Show this message
`);
}

function parseLimit(value: string) {
  if (!value) return 10;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error("limit must be an integer between 1 and 100.");
  }
  return parsed;
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const documentId = getText(args, "document-id", "DBAPT_OPENCHAT_DOCUMENT_ID");
  const limit = parseLimit(getText(args, "limit", "DBAPT_OPENCHAT_LIMIT"));
  const includeArchived = getFlag(args, "include-archived", "DBAPT_OPENCHAT_INCLUDE_ARCHIVED");
  const prisma = createPrismaClient();

  try {
    const announcements = await prisma.openChatAnnouncement.findMany({
      where: {
        ...(documentId ? { documentId } : {}),
        ...(includeArchived ? {} : { status: { not: "ARCHIVED" } }),
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (announcements.length === 0) {
      console.log("NO_OPENCHAT_ANNOUNCEMENTS");
      return;
    }

    console.log((announcements as unknown as FormattedOpenChatAnnouncement[]).map(formatOpenChatAnnouncement).join("\n"));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
