export type ContentKey = "home" | "nosotros" | "vision" | "mision";

export const defaultContent: Record<ContentKey, string> = {
  home:
    "ChiFacademy es una comunidad educativa para aprender con materiales útiles, compartir memes académicos y subir de rango participando.",
  nosotros:
    "Nacimos como una comunidad de estudiantes que compartían apuntes, guías y humor de clase. Hoy ChiFacademy busca reunir recursos confiables, participación sana y una identidad propia para aprender en comunidad.",
  vision:
    "Ser una plataforma educativa comunitaria reconocida por combinar materiales de calidad, colaboración entre estudiantes y una experiencia digital cercana.",
  mision:
    "Construir un espacio donde el conocimiento circule de forma accesible, los estudiantes encuentren apoyo real y la participación sea reconocida con rangos, insignias y comunidad.",
};

export function isContentKey(value: string): value is ContentKey {
  return Object.hasOwn(defaultContent, value);
}
