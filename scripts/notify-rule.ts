import {
  createPrismaClient,
  getFlag,
  getText,
  normalizeOptionalText,
  readArgs,
  requireValue,
} from "./notify-utils.ts";

const CORRESPONDENCE_TYPES = new Set(["발신", "수신", "회신", "기타"]);

function printUsage() {
  console.log(`Usage:
pnpm notify:rule -- --sub-category <name> --group-key <slug>

Options:
  --category <name>              Defaults to DISCLOSURE
  --correspondence-type <type>   One of: 발신, 수신, 회신, 기타
  --inactive                     Create or update the rule as inactive
  --dry-run                      Validate inputs without writing to the database
  --help                         Show this message
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const args = readArgs(process.argv.slice(2));
  const category = getText(args, "category", "DBAPT_NOTIFY_CATEGORY") || "DISCLOSURE";
  const subCategory = requireValue(getText(args, "sub-category", "DBAPT_NOTIFY_SUB_CATEGORY"), "sub-category is required.");
  const groupKey = requireValue(getText(args, "group-key", "DBAPT_NOTIFY_GROUP_KEY"), "group-key is required.");
  const correspondenceType = normalizeOptionalText(getText(args, "correspondence-type", "DBAPT_NOTIFY_CORRESPONDENCE_TYPE"));
  const isActive = !getFlag(args, "inactive", "DBAPT_NOTIFY_RULE_INACTIVE");
  const dryRun = getFlag(args, "dry-run", "DBAPT_DRY_RUN");

  if (correspondenceType && !CORRESPONDENCE_TYPES.has(correspondenceType)) {
    throw new Error(`correspondence-type must be one of: ${Array.from(CORRESPONDENCE_TYPES).join(", ")}.`);
  }

  if (dryRun) {
    console.log(`DRY_RUN_OK rule category=${category} subCategory=${subCategory} groupKey=${groupKey} correspondenceType=${correspondenceType || "all"} active=${isActive}`);
    return;
  }

  const prisma = createPrismaClient();
  try {
    const group = await prisma.notificationGroup.findUnique({ where: { key: groupKey } });
    if (!group) {
      throw new Error(`Notification group not found: ${groupKey}`);
    }

    const existing = await prisma.disclosureNotificationRule.findFirst({
      where: {
        category,
        subCategory,
        correspondenceType,
        groupId: group.id,
      },
    });

    const rule = existing
      ? await prisma.disclosureNotificationRule.update({
          where: { id: existing.id },
          data: { isActive },
        })
      : await prisma.disclosureNotificationRule.create({
          data: {
            category,
            subCategory,
            correspondenceType,
            groupId: group.id,
            isActive,
          },
        });

    console.log(`UPSERTED rule id=${rule.id} category=${rule.category} subCategory=${rule.subCategory} group=${group.key} active=${rule.isActive}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
