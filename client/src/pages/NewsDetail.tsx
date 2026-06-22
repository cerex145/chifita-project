import { ArrowLeft, ExternalLink, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import type { NewsArticle } from "../types";

export function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<{ article: NewsArticle }>(`/news/${id}`).then((data) => setArticle(data.article));
  }, [id]);

  if (!article) {
    return <div className="page-shell py-16 text-navy-900">Cargando noticia...</div>;
  }

  return (
    <article className="page-shell py-12">
      <Link to="/noticias" className="secondary-button">
        <ArrowLeft size={18} />
        Volver
      </Link>

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <div className="aspect-[16/7] bg-navy-50">
          {article.imageUrl ? (
            <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-navy-900">
              <Newspaper size={72} />
            </div>
          )}
        </div>

        <div className="p-8">
          <p className="eyebrow">{article.source}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black text-navy-900">{article.title}</h1>
          <time className="mt-3 block text-sm font-semibold text-slate-500">
            {new Date(article.publishedAt).toLocaleString("es-PE")}
          </time>

          <div className="mt-8 max-w-4xl space-y-6">
            <section>
              <h2 className="text-xl font-black text-navy-900">Resumen</h2>
              <p className="mt-3 whitespace-pre-line text-lg leading-8 text-slate-700">
                {article.description ?? "Esta fuente no entregó una descripción amplia. Abre la fuente original para leer más."}
              </p>
            </section>

            <section className="rounded-xl border border-navy-100 bg-navy-50 p-5">
              <h2 className="text-lg font-black text-navy-900">Contexto para economía</h2>
              <p className="mt-2 leading-7 text-slate-700">
                Esta nota se enlaza desde {article.source} y puede servir para seguir indicadores, decisiones de política económica,
                mercados o coyuntura peruana. Revisa la fuente original para contrastar cifras, autores y actualización completa.
              </p>
            </section>
          </div>

          <a className="primary-button mt-8" href={article.url} target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            Abrir noticia original
          </a>
        </div>
      </div>
    </article>
  );
}
