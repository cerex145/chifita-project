import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { passport } from "./config/passport";
import { uploadConfig } from "./config/uploads";
import { authRoutes } from "./routes/authRoutes";
import { contentRoutes } from "./routes/contentRoutes";
import { materialCategoryRoutes } from "./routes/materialCategoryRoutes";
import { materialRoutes } from "./routes/materialRoutes";
import { memeRoutes } from "./routes/memeRoutes";
import { newsRoutes } from "./routes/newsRoutes";
import { userRoutes } from "./routes/userRoutes";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createApp() {
  const app = express();
  const clientDist = path.resolve(process.cwd(), process.env.CLIENT_DIST_DIR ?? "client/dist");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use("/uploads", express.static(uploadConfig.root));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "chifita-server" });
  });

  app.use("/auth", authLimiter, authRoutes);
  app.use("/content", contentRoutes);
  app.use("/materials", uploadLimiter, materialRoutes);
  app.use("/material-categories", materialCategoryRoutes);
  app.use("/memes", uploadLimiter, memeRoutes);
  app.use("/news", newsRoutes);
  app.use("/users", userRoutes);

  if (process.env.NODE_ENV === "production" && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error.name === "MulterError") {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
