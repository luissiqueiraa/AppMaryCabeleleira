import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";

// Rotas sem autenticação: alimentam o site institucional, que é visto por quem
// ainda não tem conta. Somente leitura, e com DTO recortado em
// public.service.js — nada aqui pode expor dado de cliente ou de funcionária
// além do que a vitrine mostra.
const router = Router();

router.get("/home", publicController.getHomeContent);

export default router;
