import * as settingsService from "../services/settings.service.js";

export async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const settings = await settingsService.updateSettings(req.body, req);
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
