import { prisma } from "../config/database.js";

export async function getHealth(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: "connected",
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Service unavailable",
      errors: [{ field: "database", message: "Unable to reach the database" }],
    });
  }
}
