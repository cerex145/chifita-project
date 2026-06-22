import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { signAuthToken } from "../utils/jwt";
import {
  clearRefreshCookie,
  COOKIE_NAME,
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  setRefreshCookie,
} from "../utils/refreshTokens";
import { toSafeUser } from "../utils/userSerializer";
import { isGoogleOAuthConfigured } from "../config/passport";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

async function createSession(user: User, res?: Response) {
  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  if (res) {
    const refreshToken = await createRefreshToken(user.id);
    setRefreshCookie(res, refreshToken.token, refreshToken.expiresAt);
  }

  return { token, user: toSafeUser(user) };
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid registration data", errors: parsed.error.flatten() });
  }

  const { username, email, password } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    return res.status(409).json({ message: "Email or username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      provider: "LOCAL",
    },
  });

  return res.status(201).json(await createSession(user, res));
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login data", errors: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user?.password) {
    return res.status(401).json({
      message: user?.provider === "GOOGLE" ? "Esta cuenta usa Google. Inicia sesion con Google." : "Invalid credentials",
    });
  }

  const validPassword = await bcrypt.compare(parsed.data.password, user.password);

  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json(await createSession(user, res));
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: toSafeUser(user) });
}

export function oauthStatus(_req: Request, res: Response) {
  return res.json({
    google: {
      configured: isGoogleOAuthConfigured,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:4000/auth/google/callback",
    },
  });
}

export function googleCallback(req: Request, res: Response) {
  const user = req.user;

  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }

  createSession(user as User, res)
    .then((session) => res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${encodeURIComponent(session.token)}`))
    .catch(() => res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`));
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  const stored = await findValidRefreshToken(token);

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  await revokeRefreshToken(token);
  return res.json(await createSession(stored.user, res));
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME];

  if (token) {
    await revokeRefreshToken(token);
  }

  clearRefreshCookie(res);
  return res.status(204).send();
}
