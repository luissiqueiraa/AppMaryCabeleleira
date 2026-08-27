import * as notificationsRepository from "../repositories/notifications.repository.js";

function toNotificationDto(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    description: notification.description,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

export async function listNotifications(userId) {
  const notifications = await notificationsRepository.findNotificationsForUser(userId);
  return notifications.map(toNotificationDto);
}

export async function markAllAsRead(userId) {
  await notificationsRepository.markAllAsRead(userId);
  return { message: "All notifications marked as read" };
}

// Usado por outros módulos (ex: appointments) para notificar um usuário como
// efeito colateral de uma ação — não tem endpoint HTTP próprio.
export async function notifyUser(userId, { type, title, description }) {
  await notificationsRepository.createNotification({ userId, type, title, description });
}
