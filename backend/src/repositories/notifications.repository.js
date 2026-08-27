import { prisma } from "../config/database.js";

export function findNotificationsForUser(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function createNotification({ userId, type, title, description }) {
  return prisma.notification.create({ data: { userId, type, title, description } });
}

export function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
