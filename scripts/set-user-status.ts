import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type StatusInput = {
  loginId: string;
  isActive: boolean;
  dryRun: boolean;
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

function parseInput(argv: string[]): StatusInput {
  const args = readArgs(argv);
  const loginId = getText(args, "login-id", "DBAPT_USER_LOGIN_ID");

  if (!loginId || /\s/.test(loginId)) {
    throw new Error("login-id is required and must not contain spaces.");
  }

  const active = getFlag(args, "active", "DBAPT_USER_ACTIVE");
  const inactive = getFlag(args, "inactive", "DBAPT_USER_INACTIVE");
  if (active === inactive) {
    throw new Error("Pass exactly one of --active or --inactive.");
  }

  return {
    loginId,
    isActive: active,
    dryRun: getFlag(args, "dry-run", "DBAPT_DRY_RUN"),
  };
}

function printUsage() {
  console.log(`Usage:
pnpm user:status -- --login-id <id> --active
pnpm user:status -- --login-id <id> --inactive

Options:
  --dry-run               Validate target account without writing

Environment variable alternatives:
  DBAPT_USER_LOGIN_ID, DBAPT_USER_ACTIVE=true, DBAPT_USER_INACTIVE=true
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const input = parseInput(process.argv.slice(2));
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { loginId: input.loginId },
    });

    if (!user) {
      throw new Error(`User not found: ${input.loginId}`);
    }

    if (input.dryRun) {
      console.log(`DRY_RUN_OK loginId=${user.loginId} currentActive=${user.isActive} nextActive=${input.isActive}`);
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: input.isActive },
    });

    console.log(`UPDATED loginId=${updated.loginId} active=${updated.isActive}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
