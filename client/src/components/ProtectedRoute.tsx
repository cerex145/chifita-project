import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function ProtectedRoute({ role, allowIncompleteProfile = false }: { role?: Role; allowIncompleteProfile?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-shell py-20 text-center text-navy-900">Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (!allowIncompleteProfile && user.role !== "ADMIN" && !user.onboardingCompleted) {
    return <Navigate to="/completar-perfil" replace />;
  }

  return <Outlet />;
}
