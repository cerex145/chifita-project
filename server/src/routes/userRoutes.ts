import { Router } from "express";
import { completeMyOnboarding, getMyProfile, getOnboardingOptions, getUserProfile, listUsers, updateUserAdmin } from "../controllers/userController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

export const userRoutes = Router();

userRoutes.get("/onboarding-options", asyncHandler(getOnboardingOptions));
userRoutes.patch("/me/onboarding", authMiddleware, asyncHandler(completeMyOnboarding));
userRoutes.get("/me/profile", authMiddleware, asyncHandler(getMyProfile));
userRoutes.get("/", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(listUsers));
userRoutes.patch("/:id", authMiddleware, roleMiddleware(["ADMIN"]), asyncHandler(updateUserAdmin));
userRoutes.get("/:id/profile", asyncHandler(getUserProfile));
