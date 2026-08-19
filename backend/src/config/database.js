import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
  });

if (env.nodeEnv === "development") {
  globalThis.__prisma__ = prisma;
}
