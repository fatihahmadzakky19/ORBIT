import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbStatus: {
    isAvailable: boolean;
    lastChecked: number;
    lastError: string | null;
  } | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const dbStatus = globalForPrisma.dbStatus ?? {
  isAvailable: true,
  lastChecked: 0,
  lastError: null,
};
if (process.env.NODE_ENV !== "production") globalForPrisma.dbStatus = dbStatus;

const COOLDOWN_MS = 30_000; // 30 seconds cooldown before retrying connection to an offline DB

export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (!dbStatus.isAvailable && now - dbStatus.lastChecked < COOLDOWN_MS) {
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus.isAvailable = true;
    dbStatus.lastChecked = now;
    dbStatus.lastError = null;
    return true;
  } catch (error: any) {
    dbStatus.isAvailable = false;
    dbStatus.lastChecked = now;
    dbStatus.lastError = error?.message || "Database connection failed";
    return false;
  }
}

export function markDatabaseOffline(error?: any) {
  dbStatus.isAvailable = false;
  dbStatus.lastChecked = Date.now();
  dbStatus.lastError = error?.message || "Database connection failed";
}

export function getDatabaseStatus() {
  return dbStatus;
}
