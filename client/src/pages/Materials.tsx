import { Download, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import type { Material, MaterialCategory } from "../types";

export function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ categories: MaterialCategory[] }>("/material-categories").then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = category === "Todos" ? "" : `?category=${encodeURIComponent(category)}`;

    apiRequest<{ items: Material[] }>(`/materials${query}`)
      .then((data) => setMaterials(data.items))
      .finally(() => setLoading(false));
  }, [category]);

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return materials;

    return materials.filter((material) =>
      [material.title, material.description ?? "", material.category].some((value) => value.toLowerCase().includes(term)),
    );
  }, [materials, search]);

  return (
    <section className="page-shell py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h1 className="mt-3 text-4xl font-black text-navy-900">Materiales</h1>
          <p className="mt-2 text-slate-600">{filteredMaterials.length} recursos disponibles para ti</p>
        </div>

        <label className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input pl-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar materiales..."
          />
        </label>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {["Todos", ...categories.map((item) => item.name)].map((item) => (
          <button
            key={item}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              category === item ? "bg-navy-900 text-white" : "border border-navy-100 bg-white text-navy-900 hover:bg-navy-50"
            }`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 rounded-2xl border border-navy-100 bg-white p-8 text-center text-navy-900">Cargando materiales...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-navy-100 bg-white p-8 text-center text-slate-600">
          Todavía no hay materiales en esta categoría.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}

function MaterialCard({ material }: { material: Material }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-navy-50">
        {material.thumbnailUrl ? (
          <img src={material.thumbnailUrl} alt={material.title} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-900">
            <FileText size={54} />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-black text-navy-900">{material.category}</span>
          <span className="text-xs font-semibold text-slate-500">{formatFileSize(material.fileSize)}</span>
        </div>
        <h2 className="mt-4 text-xl font-black text-navy-900">{material.title}</h2>
        <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">{material.description ?? "Material PDF disponible para descargar."}</p>
        <a className="primary-button mt-5 w-full" href={material.fileUrl} target="_blank" rel="noreferrer">
          <Download size={18} />
          Descargar PDF
        </a>
      </div>
    </article>
  );
}

function formatFileSize(size: number | null) {
  if (!size) return "PDF";
  const mb = size / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
