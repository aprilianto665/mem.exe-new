import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const pool = new Pool({ connectionString: "postgresql://dummy:dummy@localhost:5432/dummy" });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  } else {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

