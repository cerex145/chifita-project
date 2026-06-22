import type { Rank } from "../types";

export const rankLabels: Record<Rank, string> = {
  MIEMBRO_BASICO: "Miembro Básico",
  MIEMBRO_CUSQUISPE: "Miembro Cusquispe",
  MIEMBRO_MILAR_CUSQUISPE: "Miembro Milar Cusquispe",
};

export const rankThresholds: Record<Rank, number> = {
  MIEMBRO_BASICO: 0,
  MIEMBRO_CUSQUISPE: 50,
  MIEMBRO_MILAR_CUSQUISPE: 200,
};

export const rankBenefits: Record<Rank, string[]> = {
  MIEMBRO_BASICO: ["Acceso a materiales públicos", "Subir memes para moderación", "Dar likes a la comunidad"],
  MIEMBRO_CUSQUISPE: ["Insignia destacada", "Mayor visibilidad en perfil", "Reconocimiento en rankings internos"],
  MIEMBRO_MILAR_CUSQUISPE: ["Insignia superior", "Estatus de referente académico", "Prioridad para futuras funciones"],
};
