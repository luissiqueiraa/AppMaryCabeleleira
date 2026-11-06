import * as publicService from "../services/public.service.js";

export async function getHomeContent(req, res, next) {
  try {
    const content = await publicService.getHomeContent();
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
}
