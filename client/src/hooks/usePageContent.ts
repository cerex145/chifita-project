import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import type { ContentKey, PageContent } from "../types";

const fallbackContent: Record<ContentKey, string> = {
  home:
    "ChiFacademy es una comunidad educativa para aprender con materiales útiles, compartir memes académicos y subir de rango participando.",
  nosotros:
    "Nacimos como una comunidad de estudiantes que compartían apuntes, guías y humor de clase. Hoy ChiFacademy busca reunir recursos confiables, participación sana y una identidad propia para aprender en comunidad.",
  vision:
    "Ser una plataforma educativa comunitaria reconocida por combinar materiales de calidad, colaboración entre estudiantes y una experiencia digital cercana.",
  mision:
    "Construir un espacio donde el conocimiento circule de forma accesible, los estudiantes encuentren apoyo real y la participación sea reconocida con rangos, insignias y comunidad.",
};

export function usePageContent(key: ContentKey) {
  const [content, setContent] = useState(fallbackContent[key]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiRequest<PageContent>(`/content/${key}`)
      .then((data) => {
        if (active) setContent(data.content);
      })
      .catch(() => {
        if (active) setContent(fallbackContent[key]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [key]);

  return { content, loading };
}
