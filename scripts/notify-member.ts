import {
  createPrismaClient,
  getFlag,
  getText,
  readArgs,
  requireValue,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm notify:member -- --group-key <slug> --login-id <loginId>
pnpm notify:member -- --group-key <slug> --user-id <userId>

Options:
  --remove              Remove the user from the group
  --dry-run             Validate inputs without writing to the database
  --help                Show this message
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const groupKey = requireValue(getText(args, "group-key", "DBAPT_NOTIFY_GROUP_KEY"), "group-key is required.");
  const loginId = getText(args, "login-id", "DBAPT_NOTIFY_LOGIN_ID");
  const userId = getText(args, "user-id", "DBAPT_NOTIFY_USER_ID");
  const remove = getFlag(args, "remove", "DBAPT_NOTIFY_REMOVE");
  const dryRun = getFlag(args, "dry-run", "DBAPT_DRY_RUN");

  if (!loginId && !userId) {
    throw new Error("login-id or user-id is required.");
  }

  if (dryRun) {
    console.log(`DRY_RUN_OK member groupKey=${groupKey} user=${loginId || userId} remove=${remove}`);
    return;
  }

  const prisma = createPrismaClient();
  try {
    const group = await prisma.notificationGroup.findUnique({ where: { key: groupKey } });
    if (!group) {
      throw new Error(`Notification group not found: ${groupKey}`);
    }

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { loginId } });

    if (!user) {
      throw new Error(`User not found: ${loginId || userId}`);
    }

    if (remove) {
      await prisma.notificationGroupMember.deleteMany({
        where: {
          groupId: group.id,
          userId: user.id,
        },
      });
      console.log(`REMOVED group=${group.key} user=${user.loginId || user.id}`);
      return;
    }

    await prisma.notificationGroupMember.upsert({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: user.id,
        },
      },
      create: {
        groupId: group.id,
        userId: user.id,
      },
      update: {},
    });

    console.log(`ADDED group=${group.key} user=${user.loginId || user.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
