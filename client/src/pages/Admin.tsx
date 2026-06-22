import { FileText, ShieldCheck, Users } from "lucide-react";
import { ContentEditor } from "../components/ContentEditor";
import { MaterialAdminPanel } from "../components/MaterialAdminPanel";
import { MemeModerationPanel } from "../components/MemeModerationPanel";
import { UserAdminPanel } from "../components/UserAdminPanel";

export function Admin() {
  return (
    <section className="page-shell py-12">
      <p className="eyebrow">Panel admin</p>
      <h1 className="mt-3 text-4xl font-black text-navy-900">Administración</h1>
      <p className="mt-3 text-slate-600">Base protegida por rol ADMIN. La gestión completa llega en los siguientes sprints.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminCard icon={<FileText />} title="Contenido" text="Editor institucional del Sprint 2." />
        <AdminCard icon={<ShieldCheck />} title="Moderación" text="Cola de memes del Sprint 4." />
        <AdminCard icon={<Users />} title="Usuarios" text="Roles y rangos del Sprint 7." />
      </div>

      <div className="mt-8">
        <ContentEditor />
      </div>

      <MaterialAdminPanel />
      <MemeModerationPanel />
      <UserAdminPanel />
    </section>
  );
}

function AdminCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <div className="text-navy-900">{icon}</div>
      <h2 className="mt-4 text-xl font-black text-navy-900">{title}</h2>
      <p className="mt-2 text-slate-600">{text}</p>
    </div>
  );
}
