import type { Rank } from "@prisma/client";
import { prisma } from "../db";

export const RANK_THRESHOLDS = {
  MIEMBRO_BASICO: 0,
  MIEMBRO_CUSQUISPE: 50,
  MIEMBRO_MILAR_CUSQUISPE: 200,
} as const satisfies Record<Rank, number>;

export function calculateRank(points: number): Rank {
  if (points >= RANK_THRESHOLDS.MIEMBRO_MILAR_CUSQUISPE) return "MIEMBRO_MILAR_CUSQUISPE";
  if (points >= RANK_THRESHOLDS.MIEMBRO_CUSQUISPE) return "MIEMBRO_CUSQUISPE";
  return "MIEMBRO_BASICO";
}

export function getRankProgress(points: number) {
  const rank = calculateRank(points);
  const entries = Object.entries(RANK_THRESHOLDS) as Array<[Rank, number]>;
  const currentIndex = entries.findIndex(([key]) => key === rank);
  const next = entries[currentIndex + 1] ?? null;

  if (!next) {
    return {
      rank,
      currentThreshold: RANK_THRESHOLDS[rank],
      nextRank: null,
      nextThreshold: null,
      pointsToNext: 0,
      progressPercent: 100,
    };
  }

  const currentThreshold = RANK_THRESHOLDS[rank];
  const nextThreshold = next[1];
  const span = nextThreshold - currentThreshold;

  return {
    rank,
    currentThreshold,
    nextRank: next[0],
    nextThreshold,
    pointsToNext: Math.max(nextThreshold - points, 0),
    progressPercent: Math.min(Math.round(((points - currentThreshold) / span) * 100), 100),
  };
}

export async function updateUserRank(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const rank = calculateRank(user.points);

  if (rank === user.rank) {
    return user;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { rank },
  });
}

export async function addUserPoints(userId: string, points: number) {
  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) return null;

  const nextPoints = Math.max(current.points + points, 0);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: nextPoints },
  });

  const rank = calculateRank(user.points);

  if (rank !== user.rank) {
    return prisma.user.update({
      where: { id: userId },
      data: { rank },
    });
  }

  return user;
}
