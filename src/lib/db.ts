import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: PrismaClient;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const adapter = new PrismaPg({ connectionString });

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  // Avoid recreating PrismaClient during hot reload in development
  const globalForPrisma = global as unknown as { prisma?: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
