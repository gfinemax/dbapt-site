import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export function readArgs(argv: string[]) {
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

export function getText(args: Map<string, string | true>, key: string, envName?: string) {
  const value = args.get(key);
  if (typeof value === "string") return value.trim();
  return envName ? process.env[envName]?.trim() || "" : "";
}

export function getFlag(args: Map<string, string | true>, key: string, envName?: string) {
  const value = args.get(key);
  if (value === true) return true;
  if (typeof value === "string") return value === "true";
  return envName ? process.env[envName] === "true" : false;
}

export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function requireValue(value: string, message: string) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export function normalizeOptionalText(value: string) {
  return value ? value : null;
}
