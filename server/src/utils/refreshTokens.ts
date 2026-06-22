import crypto from "node:crypto";
import type { Response } from "express";
import { prisma } from "../db";

const COOKIE_NAME = "refreshToken";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshTokenDays() {
  return Number(process.env.REFRESH_TOKEN_DAYS ?? 30);
}

export async function createRefreshToken(userId: string) {
  const token = crypto.randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + refreshTokenDays() * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(token),
      expiresAt,
      userId,
    },
  });

  return { token, expiresAt };
}

export async function findValidRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken
    .update({
      where: { tokenHash: hashToken(token) },
      data: { revokedAt: new Date() },
    })
    .catch(() => undefined);
}

export function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/auth",
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth",
  });
}

export { COOKIE_NAME };
