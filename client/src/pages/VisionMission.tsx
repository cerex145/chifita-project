import { CheckCircle2, Eye, Target } from "lucide-react";
import { usePageContent } from "../hooks/usePageContent";

export function VisionMission() {
  const vision = usePageContent("vision");
  const mission = usePageContent("mision");

  return (
    <section className="page-shell py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Rumbo institucional</p>
        <h1 className="mt-3 text-4xl font-black text-navy-900 md:text-5xl">Visión y Misión</h1>
        <p className="mt-5 text-lg text-slate-700">Hacia dónde vamos y cómo construimos la comunidad.</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <StatementCard
          icon={<Eye />}
          title="Nuestra Visión"
          subtitle="A dónde queremos llegar"
          content={vision.content}
          items={[
            "Ser una referencia educativa comunitaria.",
            "Democratizar el acceso a recursos claros.",
            "Crear una cultura de aprendizaje colaborativo.",
          ]}
        />
        <StatementCard
          icon={<Target />}
          title="Nuestra Misión"
          subtitle="Cómo lo estamos haciendo"
          content={mission.content}
          items={[
            "Proveer materiales de estudio útiles.",
            "Fomentar participación con humor y respeto.",
            "Reconocer el avance mediante rangos.",
          ]}
        />
      </div>
    </section>
  );
}

function StatementCard({
  icon,
  title,
  subtitle,
  content,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  items: string[];
}) {
  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-navy-900 p-3 text-white">{icon}</div>
        <div>
          <h2 className="text-2xl font-black text-navy-900">{title}</h2>
          <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className="mt-6 leading-8 text-slate-700">{content}</p>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-slate-700">
            <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={20} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
