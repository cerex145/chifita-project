import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { nextAuthPath } from "../utils/onboarding";

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionToken } = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      navigate("/login?error=google_auth_failed", { replace: true });
      return;
    }

    setSessionToken(token)
      .then((user) => navigate(nextAuthPath(user), { replace: true }))
      .catch(() => navigate("/login?error=google_auth_failed", { replace: true }));
  }, [navigate, params, setSessionToken]);

  return <div className="page-shell py-20 text-center text-navy-900">Conectando con Google...</div>;
}
