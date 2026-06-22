import { Heart, ImagePlus, Search, Upload } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { API_URL, apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Meme } from "../types";

export function Memes() {
  const { token, user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function loadMemes() {
    apiRequest<{ memes: Meme[] }>("/memes?status=APPROVED").then((data) => setMemes(data.memes));
  }

  useEffect(() => {
    loadMemes();
  }, []);

  const filteredMemes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return memes;
    return memes.filter((meme) => [meme.title, meme.description ?? "", meme.author?.username ?? ""].some((v) => v.toLowerCase().includes(term)));
  }, [memes, search]);

  async function submitMeme(event: FormEvent) {
    event.preventDefault();
    if (!token || !file) return;

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", file);

    try {
      const response = await fetch(`${API_URL}/memes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "No se pudo subir el meme");
      setTitle("");
      setDescription("");
      setFile(null);
      setMessage("Meme enviado a moderación.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir el meme.");
    } finally {
      setSubmitting(false);
    }
  }

  async function likeMeme(id: string) {
    if (!token) {
      setMessage("Inicia sesión para dar like.");
      return;
    }
    const data = await apiRequest<{ meme: Meme }>(`/memes/${id}/like`, { method: "POST", token });
    if (data.meme) {
      setMemes((current) => current.map((meme) => (meme.id === id ? { ...meme, likesCount: data.meme.likesCount } : meme)));
    }
  }

  return (
    <section className="page-shell py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Galería</p>
          <h1 className="mt-3 text-4xl font-black text-navy-900">Memes</h1>
          <p className="mt-2 text-slate-600">{filteredMemes.length} memes educativos aprobados</p>
        </div>
        <label className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar memes..." />
        </label>
      </div>

      {user ? (
        <form className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm" onSubmit={submitMeme}>
          <h2 className="text-2xl font-black text-navy-900">Subir meme</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="field-label">
              Título
              <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="field-label">
              Imagen
              <input className="input py-3" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
            </label>
            <label className="field-label lg:col-span-2">
              Descripción
              <textarea className="input min-h-24 py-4" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
          </div>
          <button className="primary-button mt-4" disabled={submitting || !file}>
            <Upload size={18} />
            {submitting ? "Enviando..." : "Enviar a moderación"}
          </button>
        </form>
      ) : (
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-5 text-slate-700">
          Inicia sesión para subir memes y dar likes a tus favoritos.
        </div>
      )}

      {message && <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">{message}</div>}

      {filteredMemes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 text-center text-slate-600">Todavía no hay memes aprobados.</div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMemes.map((meme) => (
            <article key={meme.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
              <div className="aspect-square bg-navy-50">
                <img src={meme.imageUrl} alt={meme.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-black text-navy-900">{meme.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{meme.description ?? "Meme educativo de la comunidad."}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">{meme.author?.username ?? "Comunidad"}</span>
                  <button className="secondary-button" onClick={() => likeMeme(meme.id)}>
                    <Heart size={18} />
                    {meme.likesCount}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
