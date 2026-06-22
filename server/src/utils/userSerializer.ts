import type { User } from "@prisma/client";

export function toSafeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    university: user.university,
    career: user.career,
    base: user.base,
    onboardingCompleted: Boolean(user.university && user.career && user.base),
    provider: user.provider,
    role: user.role,
    rank: user.rank,
    points: user.points,
    createdAt: user.createdAt,
  };
}
