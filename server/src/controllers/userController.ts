import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { careers, universities } from "../data/academicOptions";
import { getRankProgress } from "../utils/rankCalculator";
import { toSafeUser } from "../utils/userSerializer";

const updateUserAdminSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  rank: z.enum(["MIEMBRO_BASICO", "MIEMBRO_CUSQUISPE", "MIEMBRO_MILAR_CUSQUISPE"]).optional(),
  points: z.number().int().min(0).optional(),
});

const onboardingSchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  university: z.string().refine((value) => universities.includes(value as (typeof universities)[number]), {
    message: "Universidad no valida",
  }),
  career: z.enum(["ECONOMIA", "ECONOMIA_PUBLICA", "ECONOMIA_INTERNACIONAL"]),
  base: z.string().trim().min(2).max(30),
});

export async function getOnboardingOptions(_req: Request, res: Response) {
  return res.json({ universities, careers });
}

export async function completeMyOnboarding(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const parsed = onboardingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Datos academicos invalidos", errors: parsed.error.flatten() });
  }

  const usernameOwner = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });

  if (usernameOwner && usernameOwner.id !== req.user.id) {
    return res.status(409).json({ message: "Ese nombre de usuario ya esta en uso" });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: parsed.data,
  });

  return res.json({ user: toSafeUser(user) });
}

export async function getUserProfile(req: Request, res: Response) {
  const id = String(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memes: {
        orderBy: { createdAt: "desc" },
        include: {
          likes: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    user: toSafeUser(user),
    progress: getRankProgress(user.points),
    stats: {
      memesTotal: user.memes.length,
      memesApproved: user.memes.filter((meme) => meme.status === "APPROVED").length,
      likesReceived: user.memes.reduce((total, meme) => total + meme.likesCount, 0),
    },
    memes: user.memes,
  });
}

export async function getMyProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  req.params.id = req.user.id;
  return getUserProfile(req, res);
}

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      rank: true,
      points: true,
      provider: true,
      avatarUrl: true,
      university: true,
      career: true,
      base: true,
      createdAt: true,
      _count: {
        select: {
          memes: true,
          materials: true,
        },
      },
    },
  });

  return res.json({ users });
}

export async function updateUserAdmin(req: Request, res: Response) {
  const parsed = updateUserAdminSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid user data", errors: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: parsed.data,
  });

  return res.json({ user: toSafeUser(user), progress: getRankProgress(user.points) });
}
