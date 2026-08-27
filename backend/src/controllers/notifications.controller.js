import * as notificationsService from "../services/notifications.service.js";

export async function listNotifications(req, res, next) {
  try {
    const notifications = await notificationsService.listNotifications(req.user.id);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationsService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
