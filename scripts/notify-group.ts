import {
  createPrismaClient,
  getFlag,
  getText,
  normalizeOptionalText,
  readArgs,
  requireValue,
} from "./notify-utils.ts";

function printUsage() {
  console.log(`Usage:
pnpm notify:group -- --key <slug> --name <name>

Options:
  --description <text>  Optional group description
  --inactive            Create or update the group as inactive
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
  const key = requireValue(getText(args, "key", "DBAPT_NOTIFY_GROUP_KEY"), "key is required.");
  const name = requireValue(getText(args, "name", "DBAPT_NOTIFY_GROUP_NAME"), "name is required.");
  const description = normalizeOptionalText(getText(args, "description", "DBAPT_NOTIFY_GROUP_DESCRIPTION"));
  const isActive = !getFlag(args, "inactive", "DBAPT_NOTIFY_GROUP_INACTIVE");
  const dryRun = getFlag(args, "dry-run", "DBAPT_DRY_RUN");

  if (dryRun) {
    console.log(`DRY_RUN_OK group key=${key} name=${name} active=${isActive}`);
    return;
  }

  const prisma = createPrismaClient();
  try {
    const group = await prisma.notificationGroup.upsert({
      where: { key },
      create: {
        key,
        name,
        description,
        isActive,
      },
      update: {
        name,
        description,
        isActive,
      },
    });

    console.log(`UPSERTED group key=${group.key} name=${group.name} active=${group.isActive}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
