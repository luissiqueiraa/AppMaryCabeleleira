import * as categoriesService from "../services/serviceCategories.service.js";

export async function listCategories(req, res, next) {
  try {
    const categories = await categoriesService.listCategories(req.user.permissions);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await categoriesService.createCategory(req.body, req);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await categoriesService.updateCategory(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await categoriesService.deleteCategory(req.params.id, req);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
