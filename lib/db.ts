import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[Database] DATABASE_URL is not set. Database features will fall back to in-memory storage.");
}

// Create pg connection pool
const pool = new pg.Pool({ connectionString: connectionString || "" });
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
