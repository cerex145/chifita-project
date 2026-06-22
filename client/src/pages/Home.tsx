import { ArrowRight, BookOpen, GraduationCap, Heart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { usePageContent } from "../hooks/usePageContent";

export function Home() {
  const { content } = usePageContent("home");

  return (
    <section className="bg-gradient-to-b from-white to-navy-50">
      <div className="page-shell grid min-h-[calc(100vh-76px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">Comunidad educativa</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-navy-900 md:text-7xl">
            ChiFacademy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            {content}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="primary-button">
              Iniciar sesión
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="secondary-button">
              Registrarse gratis
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
            <Stat value="+1,200" label="miembros" />
            <Stat value="+340" label="materiales" />
            <Stat value="+800" label="memes" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg rounded-[2rem] border border-navy-100 bg-white p-8 shadow-xl">
          <img src={logo} alt="Logo de ChiFacademy" className="mx-auto h-64 w-64 object-contain" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Feature icon={<BookOpen />} title="PDFs" text="Materiales por categoría." />
            <Feature icon={<Heart />} title="Memes" text="Publica y recibe likes." />
            <Feature icon={<GraduationCap />} title="Rangos" text="Progreso visible." />
            <Feature icon={<ShieldCheck />} title="Admin" text="Moderación segura." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white px-4 py-3">
      <p className="text-xl font-black text-navy-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-navy-50 p-4">
      <div className="text-navy-900">{icon}</div>
      <h3 className="mt-3 font-bold text-navy-900">{title}</h3>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
