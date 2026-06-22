import { Router } from "express";
import { listContent, getContent, updateContent } from "../controllers/contentController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

export const contentRoutes = Router();

contentRoutes.get("/", asyncHandler(listContent));
contentRoutes.get("/:key", asyncHandler(getContent));
contentRoutes.put("/:key", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(updateContent));
