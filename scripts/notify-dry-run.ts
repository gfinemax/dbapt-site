import { notifyDisclosureDocumentApproved } from "../src/lib/notifications/disclosure-notifications.ts";
import type { NotificationPrisma } from "../src/lib/notifications/disclosure-notifications.ts";
import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
  requireValue,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm notify:dry-run -- --document-id <documentId>

Options:
  --force               Create a new dry-run log even if this document already has a notification log
  --help                Show this message

This command always runs with KAKAO_NOTIFICATION_MODE=dry-run.
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const documentId = requireValue(getText(args, "document-id", "DBAPT_NOTIFY_DOCUMENT_ID"), "document-id is required.");
  const force = getFlag(args, "force", "DBAPT_NOTIFY_FORCE");

  process.env.KAKAO_NOTIFICATION_MODE = "dry-run";
  const prisma = createPrismaClient();

  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const result = await notifyDisclosureDocumentApproved({
      prisma: prisma as unknown as NotificationPrisma,
      document,
      force,
    });

    console.log(`DRY_RUN_RESULT status=${result.status} reason=${result.skippedReason || "none"} notificationId=${result.notificationId || "none"} recipients=${result.recipientCount ?? 0} skipped=${result.skippedRecipientCount ?? 0}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
