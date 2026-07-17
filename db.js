const { PrismaClient } = require("@prisma/client");
const env = require("./env");

// A single Prisma instance is reused across the app (and across hot-reloads
// in dev) so we don't exhaust Neon's connection limit.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prismaClient ||
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
  });

if (env.nodeEnv !== "production") {
  globalForPrisma.prismaClient = prisma;
}

module.exports = prisma;
