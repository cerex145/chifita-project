import { Router } from "express";
import { googleCallback, login, logout, me, oauthStatus, refresh, register } from "../controllers/authController";
import { isGoogleOAuthConfigured, passport } from "../config/passport";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));
authRoutes.post("/refresh", asyncHandler(refresh));
authRoutes.post("/logout", asyncHandler(logout));
authRoutes.get("/me", authMiddleware, asyncHandler(me));
authRoutes.get("/oauth/status", oauthStatus);

authRoutes.get(
  "/google",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured) {
      return res.status(503).json({ message: "Google OAuth is not configured" });
    }

    return next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRoutes.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }

    return next();
  },
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  googleCallback,
);
