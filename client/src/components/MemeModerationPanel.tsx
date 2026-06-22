import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Meme } from "../types";

export function MemeModerationPanel() {
  const { token } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function loadPending() {
    if (!token) return;
    apiRequest<{ memes: Meme[] }>("/memes/pending", { token }).then((data) => setMemes(data.memes));
  }

  useEffect(() => {
    loadPending();
  }, [token]);

  async function moderate(id: string, status: "APPROVED" | "REJECTED") {
    if (!token) return;
    await apiRequest(`/memes/${id}/moderate`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    setMemes((current) => current.filter((meme) => meme.id !== id));
    setMessage(status === "APPROVED" ? "Meme aprobado." : "Meme rechazado.");
  }

  return (
    <section className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <p className="eyebrow">Sprint 4</p>
      <h2 className="mt-2 text-2xl font-black text-navy-900">Moderación de memes</h2>
      {message && <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">{message}</div>}
      {memes.length === 0 ? (
        <p className="mt-5 text-slate-600">No hay memes pendientes.</p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {memes.map((meme) => (
            <article key={meme.id} className="overflow-hidden rounded-2xl border border-navy-100">
              <img src={meme.imageUrl} alt={meme.title} className="aspect-square w-full object-cover" />
              <div className="p-4">
                <h3 className="font-black text-navy-900">{meme.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{meme.author?.username}</p>
                <div className="mt-4 flex gap-2">
                  <button className="primary-button" onClick={() => moderate(meme.id, "APPROVED")}>
                    <Check size={18} />
                    Aprobar
                  </button>
                  <button className="secondary-button" onClick={() => moderate(meme.id, "REJECTED")}>
                    <X size={18} />
                    Rechazar
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
