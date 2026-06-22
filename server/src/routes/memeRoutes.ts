import multer from "multer";
import { Router } from "express";
import {
  createMeme,
  likeMeme,
  listMemes,
  listPendingMemes,
  moderateMeme,
  unlikeMeme,
} from "../controllers/memeController";
import { uploadConfig } from "../config/uploads";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploadConfig.maxImageSizeBytes, files: 1 },
});

export const memeRoutes = Router();

memeRoutes.get("/", asyncHandler(listMemes));
memeRoutes.post("/", authMiddleware, upload.single("image"), asyncHandler(createMeme));
memeRoutes.get("/pending", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(listPendingMemes));
memeRoutes.patch("/:id/moderate", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(moderateMeme));
memeRoutes.post("/:id/like", authMiddleware, asyncHandler(likeMeme));
memeRoutes.delete("/:id/like", authMiddleware, asyncHandler(unlikeMeme));
