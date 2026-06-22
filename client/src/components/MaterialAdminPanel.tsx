import { FileUp, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { API_URL, apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Material, MaterialCategory } from "../types";

export function MaterialAdminPanel() {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function loadMaterials() {
    apiRequest<{ items: Material[] }>("/materials").then((data) => setMaterials(data.items));
  }

  function loadCategories() {
    apiRequest<{ categories: MaterialCategory[] }>("/material-categories").then((data) => {
      setCategories(data.categories);
      setCategory((current) => current || data.categories[0]?.name || "");
    });
  }

  useEffect(() => {
    loadMaterials();
    loadCategories();
  }, []);

  async function addCategory() {
    if (!token || !newCategory.trim()) return;

    const data = await apiRequest<{ category: MaterialCategory }>("/material-categories", {
      method: "POST",
      token,
      body: JSON.stringify({ name: newCategory.trim() }),
    });

    setCategories((current) => [...current, data.category].sort((a, b) => a.name.localeCompare(b.name)));
    setNewCategory("");
    setCategory(data.category.name);
  }

  async function deleteCategory(id: string) {
    if (!token) return;

    try {
      await apiRequest(`/material-categories/${id}`, {
        method: "DELETE",
        token,
      });
      setCategories((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !file) return;

    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/materials`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo subir el material");
      }

      setTitle("");
      setDescription("");
      setFile(null);
      setMessage("Material subido correctamente.");
      loadMaterials();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir el material.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMaterial(id: string) {
    if (!token) return;

    await apiRequest(`/materials/${id}`, {
      method: "DELETE",
      token,
    });
    setMaterials((current) => current.filter((material) => material.id !== id));
  }

  return (
    <section className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <div>
        <p className="eyebrow">Sprint 3</p>
        <h2 className="mt-2 text-2xl font-black text-navy-900">Materiales PDF</h2>
        <p className="mt-2 text-sm text-slate-600">Subida restringida a administradores con validación real de PDF.</p>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <label className="field-label">
          Título
          <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label className="field-label">
          Categoría
          <select className="input" value={category} onChange={(event) => setCategory(event.target.value)} required>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label lg:col-span-2">
          Descripción
          <textarea className="input min-h-28 py-4" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="lg:col-span-2">
          <span className="field-label">Archivo PDF</span>
          <div className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-100 bg-navy-50 px-4 text-center text-navy-900">
            <FileUp size={34} />
            <p className="mt-3 font-bold">{file ? file.name : "Selecciona un PDF"}</p>
            <p className="text-sm text-slate-600">Máximo 20MB</p>
          </div>
          <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
        </label>
        <button className="primary-button lg:col-span-2" disabled={saving || !file}>
          {saving ? "Subiendo..." : "Subir material"}
        </button>
      </form>

      {message && <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">{message}</div>}

      <div className="mt-8 space-y-3">
        <h3 className="text-xl font-black text-navy-900">Categorías</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="input"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Ej. Política monetaria"
          />
          <button type="button" className="primary-button" onClick={addCategory}>
            Agregar categoría
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-2 text-sm font-bold text-navy-900">
              {item.name}
              <button type="button" className="text-slate-500 hover:text-red-700" onClick={() => deleteCategory(item.id)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <h3 className="text-xl font-black text-navy-900">Materiales subidos</h3>
        {materials.map((material) => (
          <div key={material.id} className="flex flex-col gap-3 rounded-xl border border-navy-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-navy-900">{material.title}</p>
              <p className="text-sm text-slate-600">{material.category}</p>
            </div>
            <button className="secondary-button" onClick={() => deleteMaterial(material.id)}>
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
