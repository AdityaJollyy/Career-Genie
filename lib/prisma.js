import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use globalThis so the Prisma instance persists across hot reloads in Next.js dev
const globalForPrisma = globalThis;

// Prisma 7 requires a driver adapter.
// This adapter internally manages the PostgreSQL connection pool.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Reuse existing Prisma client in development to avoid
// creating too many database connections during hot reloads.
// In production, a fresh instance is fine because the process runs once.
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// Store the client on globalThis only in development
// so it survives module reloads (Next.js Fast Refresh)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
