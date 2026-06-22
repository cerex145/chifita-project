import { Router } from "express";
import { getNewsArticle, getNewsStatus, listNews, refreshNews } from "../controllers/newsController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

export const newsRoutes = Router();

newsRoutes.get("/", asyncHandler(listNews));
newsRoutes.get("/status/config", asyncHandler(getNewsStatus));
newsRoutes.get("/:id", asyncHandler(getNewsArticle));
newsRoutes.post("/refresh", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(refreshNews));
