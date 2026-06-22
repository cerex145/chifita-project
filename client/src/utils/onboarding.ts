import type { User } from "../types";

export function nextAuthPath(user: User) {
  if (user.role !== "ADMIN" && !user.onboardingCompleted) {
    return "/completar-perfil";
  }

  return "/perfil";
}
