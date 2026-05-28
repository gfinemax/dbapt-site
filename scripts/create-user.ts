import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["MEMBER", "REFUND", "ADMIN"] as const;
type Role = (typeof VALID_ROLES)[number];

type CreateUserInput = {
  loginId: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
  updateExisting: boolean;
  dryRun: boolean;
  refund: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: Date | null;
  };
};

function readArgs(argv: string[]) {
  const values = new Map<string, string | true>();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.trim();
    if (!key) {
      throw new Error(`Invalid argument: ${arg}`);
    }

    if (inlineValue !== undefined) {
      values.set(key, inlineValue);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      values.set(key, true);
      continue;
    }

    values.set(key, next);
    index += 1;
  }

  return values;
}

function getText(args: Map<string, string | true>, key: string, envName: string) {
  const value = args.get(key);
  if (typeof value === "string") return value.trim();
  return process.env[envName]?.trim() || "";
}

function getFlag(args: Map<string, string | true>, key: string, envName: string) {
  const value = args.get(key);
  if (value === true) return true;
  if (typeof value === "string") return value === "true";
  return process.env[envName] === "true";
}

function parseMoney(value: string, fallback: number, label: string) {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }

  return parsed;
}

function parseTargetDate(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("target-date must use YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("target-date is invalid.");
  }

  return date;
}

function parseInput(argv: string[]): CreateUserInput {
  const args = readArgs(argv);
  const role = getText(args, "role", "DBAPT_USER_ROLE").toUpperCase() || "MEMBER";

  if (!VALID_ROLES.includes(role as Role)) {
    throw new Error(`role must be one of: ${VALID_ROLES.join(", ")}.`);
  }

  const loginId = getText(args, "login-id", "DBAPT_USER_LOGIN_ID");
  const password = getText(args, "password", "DBAPT_USER_PASSWORD");
  const name = getText(args, "name", "DBAPT_USER_NAME");

  if (!loginId || /\s/.test(loginId) || loginId.length < 3) {
    throw new Error("login-id is required and must be at least 3 characters without spaces.");
  }

  if (!password || password.length < 8) {
    throw new Error("password is required and must be at least 8 characters.");
  }

  if (!name || name.length < 2) {
    throw new Error("name is required and must be at least 2 characters.");
  }

  return {
    loginId,
    password,
    name,
    role: role as Role,
    isActive: !getFlag(args, "inactive", "DBAPT_USER_INACTIVE"),
    updateExisting: getFlag(args, "update-existing", "DBAPT_UPDATE_EXISTING"),
    dryRun: getFlag(args, "dry-run", "DBAPT_DRY_RUN"),
    refund: {
      totalPaid: parseMoney(getText(args, "total-paid", "DBAPT_REFUND_TOTAL_PAID"), 0, "total-paid"),
      refundAmount: parseMoney(getText(args, "refund-amount", "DBAPT_REFUND_AMOUNT"), 0, "refund-amount"),
      processedState: getText(args, "processed-state", "DBAPT_REFUND_PROCESSED_STATE") || "정산 정보 등록 대기",
      targetDate: parseTargetDate(getText(args, "target-date", "DBAPT_REFUND_TARGET_DATE")),
    },
  };
}

function printUsage() {
  console.log(`Usage:
pnpm user:create -- --login-id <id> --password <password> --name <name> --role MEMBER|REFUND|ADMIN

Options:
  --update-existing       Update an existing account instead of failing
  --dry-run               Validate inputs without writing to the database
  --inactive              Create or update the account as inactive
  --total-paid <number>   REFUND role only, defaults to 0
  --refund-amount <num>   REFUND role only, defaults to 0
  --processed-state <txt> REFUND role only, defaults to 정산 정보 등록 대기
  --target-date YYYY-MM-DD

Environment variable alternatives:
  DBAPT_USER_LOGIN_ID, DBAPT_USER_PASSWORD, DBAPT_USER_NAME, DBAPT_USER_ROLE
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const input = parseInput(process.argv.slice(2));

  if (input.dryRun) {
    console.log(`DRY_RUN_OK loginId=${input.loginId} role=${input.role} active=${input.isActive} name=${input.name}`);
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existing = await prisma.user.findUnique({
      where: { loginId: input.loginId },
    });

    if (existing && !input.updateExisting) {
      throw new Error(`User already exists: ${input.loginId}. Add --update-existing to update it.`);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            role: input.role,
            isActive: input.isActive,
            passwordHash,
          },
        })
      : await prisma.user.create({
          data: {
            loginId: input.loginId,
            name: input.name,
            role: input.role,
            isActive: input.isActive,
            passwordHash,
          },
        });

    if (input.role === "REFUND") {
      await prisma.refundInfo.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalPaid: input.refund.totalPaid,
          refundAmount: input.refund.refundAmount,
          processedState: input.refund.processedState,
          targetDate: input.refund.targetDate,
        },
        update: {
          totalPaid: input.refund.totalPaid,
          refundAmount: input.refund.refundAmount,
          processedState: input.refund.processedState,
          targetDate: input.refund.targetDate,
        },
      });
    } else if (existing) {
      await prisma.refundInfo.deleteMany({
        where: { userId: user.id },
      });
    }

    console.log(`${existing ? "UPDATED" : "CREATED"} loginId=${user.loginId} role=${user.role} active=${user.isActive}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
