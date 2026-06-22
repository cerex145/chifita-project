import { Router } from "express";
import {
  createMaterialCategory,
  deleteMaterialCategory,
  listMaterialCategories,
  updateMaterialCategory,
} from "../controllers/materialCategoryController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

export const materialCategoryRoutes = Router();

materialCategoryRoutes.get("/", asyncHandler(listMaterialCategories));
materialCategoryRoutes.post("/", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(createMaterialCategory));
materialCategoryRoutes.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(updateMaterialCategory));
materialCategoryRoutes.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(deleteMaterialCategory));
