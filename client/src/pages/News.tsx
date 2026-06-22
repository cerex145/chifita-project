import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import type { NewsArticle } from "../types";

export function News() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [apiStatus, setApiStatus] = useState<{ provider: string; configured: boolean; mode: string; requiredEnv: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  function loadNews() {
    setLoading(true);
    apiRequest<{ items: NewsArticle[] }>("/news")
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNews();
    apiRequest<{ provider: string; configured: boolean; mode: string; requiredEnv: string | null }>("/news/status/config").then(setApiStatus);
  }, []);

  async function refreshNews() {
    if (!token) return;
    setMessage(null);
    try {
      const result = await apiRequest<{ inserted: number; source: string; configured: boolean; refreshedAt: string; error?: string }>("/news/refresh", { method: "POST", token });
      setMessage(
        result.source === "bing-news"
          ? `Noticias actualizadas desde Bing News RSS (${result.inserted} procesadas).`
          : result.source === "google-news"
          ? `Noticias actualizadas desde Google News RSS (${result.inserted} procesadas).`
          : result.source === "gdelt"
            ? `Noticias actualizadas desde GDELT (${result.inserted} procesadas).`
          : result.source === "newsdata"
            ? `Noticias actualizadas desde NewsData.io (${result.inserted} procesadas).`
            : `Modo demo activo: ${result.error ?? "el proveedor publico no respondio"}. Se cargaron ${result.inserted} noticias demo.`,
      );
      loadNews();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar noticias.");
    } finally {
      apiRequest<{ provider: string; configured: boolean; mode: string; requiredEnv: string | null }>("/news/status/config").then(setApiStatus);
    }
  }

  return (
    <section className="page-shell py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Actualidad</p>
          <h1 className="mt-3 text-4xl font-black text-navy-900">Noticias Económicas</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Noticias de economía y negocios para estudiantes de economía en Perú.
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <button className="secondary-button" onClick={refreshNews}>
            <RefreshCw size={18} />
            Actualizar
          </button>
        )}
      </div>

      {apiStatus && apiStatus.mode === "live-public" && (
        <div className="mt-5 rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">
          Noticias consumidas desde {apiStatus.provider}, una fuente publica sin API key.
        </div>
      )}

      {apiStatus && apiStatus.mode !== "live-public" && !apiStatus.configured && (
        <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-navy-900">
          Modo demo activo. Para consumir noticias reales de {apiStatus.provider}, configura `{apiStatus.requiredEnv}` en `server/.env`
          y reinicia el backend.
        </div>
      )}

      {message && <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">{message}</div>}

      {loading ? (
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 text-center text-navy-900">Cargando noticias...</div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 text-center text-slate-600">
          Todavía no hay noticias. Usa el botón actualizar como admin o espera la sincronización automática.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((article) => (
            <article key={article.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
              <div className="aspect-[16/9] bg-navy-50">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-navy-900">
                    <Newspaper size={54} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
                  <span>{article.source}</span>
                  <time>{new Date(article.publishedAt).toLocaleDateString("es-PE")}</time>
                </div>
                <h2 className="mt-4 text-xl font-black text-navy-900">{article.title}</h2>
                <p className="news-summary mt-2 text-sm leading-6 text-slate-600">
                  {article.description ?? "Lee la noticia completa en la fuente original."}
                </p>
                <a className="secondary-button mt-5 w-full" href={article.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={18} />
                  Leer fuente
                </a>
                <Link className="primary-button mt-3 w-full" to={`/noticias/${article.id}`}>
                  Ver completa
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
