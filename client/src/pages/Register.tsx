import { FormEvent, useEffect, useState } from "react";
import { Chrome, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, googleAuthUrl } from "../api";
import { useAuth } from "../context/AuthContext";
import { nextAuthPath } from "../utils/onboarding";

type OAuthStatus = {
  google: {
    configured: boolean;
    callbackUrl: string;
  };
};

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleConfigured, setGoogleConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<OAuthStatus>("/auth/oauth/status")
      .then((status) => setGoogleConfigured(status.google.configured))
      .catch(() => setGoogleConfigured(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await register({ username, email, password });
      navigate(nextAuthPath(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell flex min-h-[calc(100vh-220px)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-navy-100 bg-white p-8 shadow-xl">
        <p className="eyebrow">Nueva cuenta</p>
        <h1 className="mt-3 text-3xl font-black text-navy-900">Registrarse</h1>
        <p className="mb-8 mt-2 text-slate-600">Crea tu cuenta local o continúa con Google.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="alert">{error}</div>}
          <label className="field-label">
            Usuario
            <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label className="field-label">
            Correo
            <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label className="field-label">
            Contraseña
            <input
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>
          <button className="primary-button w-full justify-center" disabled={submitting}>
            <UserPlus size={18} />
            {submitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-sm text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />
          o
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {googleConfigured ? (
          <a className="secondary-button w-full justify-center" href={googleAuthUrl()}>
            <Chrome size={18} />
            Continuar con Google
          </a>
        ) : (
          <button className="secondary-button w-full justify-center opacity-60" disabled type="button">
            <Chrome size={18} />
            Google pendiente
          </button>
        )}

        {!googleConfigured && (
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-navy-900">
            Falta configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el servidor.
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-bold text-navy-900" to="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
