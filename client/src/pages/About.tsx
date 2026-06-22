import { BookOpen, HeartHandshake, Sparkles, Users } from "lucide-react";
import { usePageContent } from "../hooks/usePageContent";

export function About() {
  const { content } = usePageContent("nosotros");

  return (
    <section className="page-shell py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Nuestra historia</p>
        <h1 className="mt-3 text-4xl font-black text-navy-900 md:text-5xl">Sobre nosotros</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">{content}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-center">
        <Stat value="+1,200" label="miembros" />
        <Stat value="+340" label="materiales" />
        <Stat value="+800" label="memes" />
      </div>

      <h2 className="mt-16 text-center text-3xl font-black text-navy-900">Nuestros valores</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <ValueCard icon={<Users />} title="Comunidad" text="Aprendemos mejor cuando compartimos recursos, dudas y avances." />
        <ValueCard icon={<BookOpen />} title="Calidad" text="Priorizamos materiales claros, útiles y organizados para estudiar." />
        <ValueCard icon={<Sparkles />} title="Dinamismo" text="El humor y la participación hacen que estudiar se sienta menos pesado." />
      </div>

      <div className="mt-12 rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-navy-50 p-3 text-navy-900">
            <HeartHandshake />
          </div>
          <div>
            <h2 className="text-2xl font-black text-navy-900">El equipo</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Un equipo académico y creativo enfocado en construir una plataforma útil para estudiantes, con identidad
              propia y herramientas que crecen sprint a sprint.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white px-4 py-4 shadow-sm">
      <p className="text-2xl font-black text-navy-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <div className="inline-flex rounded-2xl bg-navy-50 p-3 text-navy-900">{icon}</div>
      <h3 className="mt-5 text-xl font-black text-navy-900">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{text}</p>
    </article>
  );
}
