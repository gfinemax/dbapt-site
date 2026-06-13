import {
  buildNotificationContactUpdate,
  type NotificationContactUpdate,
} from "../src/lib/notifications/notification-operations.ts";
import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm notify:contact -- --login-id <loginId> --phone <010-0000-0000> --opt-in true --enabled true
pnpm notify:contact -- --user-id <userId> --clear-phone --enabled false

Options:
  --login-id <id>       Target user login id
  --user-id <id>        Target user database id
  --phone <phone>       Korean mobile phone number, 010 only
  --clear-phone         Clear stored notification phone
  --opt-in true|false   Set Kakao notification opt-in/admin eligibility flag
  --enabled true|false  Set Kakao notification enabled flag
  --dry-run             Validate and print update without writing
  --help                Show this message
`);
}

function readOptionalBoolean(args: Map<string, string | true>, key: string) {
  const value = args.get(key);
  if (value === undefined) return undefined;
  if (value === true) return true;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${key} must be true or false.`);
}

function formatUpdate(data: NotificationContactUpdate) {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${value === null ? "null" : value}`)
    .join(" ");
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const loginId = getText(args, "login-id", "DBAPT_NOTIFY_LOGIN_ID");
  const userId = getText(args, "user-id", "DBAPT_NOTIFY_USER_ID");
  const dryRun = getFlag(args, "dry-run", "DBAPT_DRY_RUN");

  if (!loginId && !userId) {
    throw new Error("login-id or user-id is required.");
  }

  const data = buildNotificationContactUpdate({
    phone: getText(args, "phone", "DBAPT_NOTIFY_PHONE") || undefined,
    clearPhone: getFlag(args, "clear-phone", "DBAPT_NOTIFY_CLEAR_PHONE"),
    optIn: readOptionalBoolean(args, "opt-in"),
    enabled: readOptionalBoolean(args, "enabled"),
  });

  if (dryRun) {
    console.log(`DRY_RUN_OK contact user=${loginId || userId} ${formatUpdate(data)}`);
    return;
  }

  const prisma = createPrismaClient();
  try {
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { loginId } });

    if (!user) {
      throw new Error(`User not found: ${loginId || userId}`);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    console.log(`UPDATED contact user=${updated.loginId || updated.id} phone=${updated.phone || "none"} optIn=${updated.kakaoNotificationOptIn} enabled=${updated.kakaoNotificationEnabled}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
