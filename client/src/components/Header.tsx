import { BookOpen, LogOut, Shield, UserCircle } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/vision-mision", label: "Visión y Misión" },
  { to: "/materiales", label: "Materiales" },
  { to: "/memes", label: "Memes" },
  { to: "/rangos", label: "Rangos" },
  { to: "/noticias", label: "Noticias" },
];

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-navy-50 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 font-bold text-navy-900">
          <img src={logo} alt="ChiFacademy" className="h-11 w-11 rounded-full object-contain" />
          <span className="hidden text-xl sm:block">ChiFacademy</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-navy-50 hover:text-navy-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-gold text-navy-900" : "text-slate-700 hover:bg-navy-50 hover:text-navy-900"
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/perfil"
                className="flex items-center gap-2 rounded-full border border-navy-100 px-3 py-2 text-sm font-semibold text-navy-900"
              >
                {user.role === "ADMIN" ? <Shield size={18} /> : <UserCircle size={18} />}
                <span className="hidden sm:inline">{user.username}</span>
              </Link>
              <button className="icon-button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link className="secondary-button hidden sm:inline-flex" to="/login">
                Iniciar sesión
              </Link>
              <Link className="primary-button" to="/register">
                <BookOpen size={18} />
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-navy-50 px-4 py-2 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-navy-50 hover:text-navy-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        {user?.role === "ADMIN" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-gold text-navy-900" : "text-slate-700 hover:bg-navy-50 hover:text-navy-900"
              }`
            }
          >
            Admin
          </NavLink>
        )}
      </nav>
    </header>
  );
}
