import {
  formatDisclosureNotificationLog,
  type DisclosureNotificationLog,
} from "../src/lib/notifications/notification-operations.ts";
import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm notify:logs
pnpm notify:logs -- --document-id <documentId> --recipients

Options:
  --document-id <id>    Filter by document id
  --limit <number>      Number of notification logs to show, defaults to 10
  --recipients          Include recipient-level rows
  --help                Show this message
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
  const documentId = getText(args, "document-id", "DBAPT_NOTIFY_DOCUMENT_ID");
  const limit = parseLimit(getText(args, "limit", "DBAPT_NOTIFY_LOG_LIMIT"));
  const includeRecipients = getFlag(args, "recipients", "DBAPT_NOTIFY_LOG_RECIPIENTS");
  const prisma = createPrismaClient();

  try {
    const logs = await prisma.disclosureNotification.findMany({
      where: documentId ? { documentId } : {},
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
        recipients: includeRecipients
          ? {
              orderBy: { createdAt: "asc" },
              include: {
                user: {
                  select: {
                    loginId: true,
                    name: true,
                  },
                },
                group: {
                  select: {
                    key: true,
                    name: true,
                  },
                },
              },
            }
          : false,
      },
    });

    if (logs.length === 0) {
      console.log("NO_NOTIFICATION_LOGS");
      return;
    }

    console.log((logs as unknown as DisclosureNotificationLog[]).map(formatDisclosureNotificationLog).join("\n"));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
