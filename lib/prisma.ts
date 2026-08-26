import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).deliverySetting) {
    try {
      for (const key of Object.keys(require.cache)) {
        if (key.includes("@prisma") || key.includes(".prisma")) {
          delete require.cache[key];
        }
      }
      const { PrismaClient: FreshClient } = require("@prisma/client");
      const { PrismaBetterSqlite3: FreshAdapter } = require("@prisma/adapter-better-sqlite3");
      const adapter = new FreshAdapter({ url: "file:./prisma/dev.db" });
      globalForPrisma.prisma = new FreshClient({ adapter });
    } catch {
      const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
  }
  return globalForPrisma.prisma!;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});

export default prisma;

