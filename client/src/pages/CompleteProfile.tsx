import { FormEvent, useEffect, useState } from "react";
import { GraduationCap, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Career, User } from "../types";

type CareerOption = {
  value: Career;
  label: string;
};

type OnboardingOptions = {
  universities: string[];
  careers: CareerOption[];
};

export function CompleteProfile() {
  const { token, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [options, setOptions] = useState<OnboardingOptions>({ universities: [], careers: [] });
  const [username, setUsername] = useState(user?.username ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [career, setCareer] = useState<Career | "">(user?.career ?? "");
  const [base, setBase] = useState(user?.base ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<OnboardingOptions>("/users/onboarding-options").then((data) => {
      setOptions(data);
      setUniversity((current) => current || data.universities[0] || "");
      setCareer((current) => current || data.careers[0]?.value || "");
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !career) return;

    setError(null);
    setSaving(true);

    try {
      await apiRequest<{ user: User }>("/users/me/onboarding", {
        method: "PATCH",
        token,
        body: JSON.stringify({ username, university, career, base }),
      });
      await refreshUser();
      navigate("/perfil", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell flex min-h-[calc(100vh-220px)] items-center justify-center py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-navy-100 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
            <GraduationCap size={26} />
          </div>
          <div>
            <p className="eyebrow">Perfil académico</p>
            <h1 className="mt-1 text-3xl font-black text-navy-900">Completa tu cuenta</h1>
          </div>
        </div>

        <p className="mt-4 text-slate-600">
          Elige el nombre que verán otros usuarios y registra tus datos académicos para personalizar tu experiencia.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          {error && <div className="alert">{error}</div>}

          <label className="field-label">
            Nombre de usuario
            <input
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              pattern="[a-zA-Z0-9_]{3,32}"
              title="Usa 3 a 32 caracteres: letras, números o guion bajo."
              required
            />
          </label>

          <label className="field-label">
            Universidad
            <select className="input" value={university} onChange={(event) => setUniversity(event.target.value)} required>
              {options.universities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Carrera
              <select className="input" value={career} onChange={(event) => setCareer(event.target.value as Career)} required>
                {options.careers.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Base
              <input
                className="input"
                value={base}
                onChange={(event) => setBase(event.target.value)}
                placeholder="Ej. 2024, Base 23, X ciclo"
                maxLength={30}
                required
              />
            </label>
          </div>

          <button className="primary-button justify-center" disabled={saving}>
            <Save size={18} />
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </form>
      </div>
    </section>
  );
}
