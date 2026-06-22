import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { ContentKey, PageContent } from "../types";

const contentLabels: Record<ContentKey, string> = {
  home: "Home",
  nosotros: "Nosotros",
  vision: "Visión",
  mision: "Misión",
};

export function ContentEditor() {
  const { token } = useAuth();
  const [items, setItems] = useState<PageContent[]>([]);
  const [selectedKey, setSelectedKey] = useState<ContentKey>("home");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<{ items: PageContent[] }>("/content").then((data) => {
      setItems(data.items);
      setDraft(data.items.find((item) => item.key === selectedKey)?.content ?? "");
    });
  }, [selectedKey]);

  function selectKey(key: ContentKey) {
    setSelectedKey(key);
    setDraft(items.find((item) => item.key === key)?.content ?? "");
    setMessage(null);
  }

  async function saveContent() {
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const updated = await apiRequest<PageContent>(`/content/${selectedKey}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ content: draft }),
      });

      setItems((current) => current.map((item) => (item.key === selectedKey ? updated : item)));
      setMessage("Contenido guardado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el contenido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Sprint 2</p>
          <h2 className="mt-2 text-2xl font-black text-navy-900">Contenido institucional</h2>
        </div>
        <button className="primary-button" onClick={saveContent} disabled={saving}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(contentLabels) as ContentKey[]).map((key) => (
          <button
            key={key}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              selectedKey === key ? "bg-navy-900 text-white" : "bg-navy-50 text-navy-900 hover:bg-navy-100"
            }`}
            onClick={() => selectKey(key)}
          >
            {contentLabels[key]}
          </button>
        ))}
      </div>

      <label className="field-label mt-6">
        Texto de {contentLabels[selectedKey]}
        <textarea
          className="input min-h-52 resize-y py-4 leading-7"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>

      {message && <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">{message}</div>}
    </section>
  );
}
