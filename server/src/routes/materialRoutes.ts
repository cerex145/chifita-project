import multer from "multer";
import { Router } from "express";
import {
  createMaterial,
  deleteMaterial,
  listMaterials,
  updateMaterial,
} from "../controllers/materialController";
import { uploadConfig } from "../config/uploads";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: uploadConfig.maxPdfSizeBytes,
    files: 1,
  },
});

export const materialRoutes = Router();

materialRoutes.get("/", asyncHandler(listMaterials));
materialRoutes.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  upload.single("file"),
  asyncHandler(createMaterial),
);
materialRoutes.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(updateMaterial));
materialRoutes.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(deleteMaterial));
