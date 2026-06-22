export function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-shell py-16">
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
        <p className="eyebrow">Sprint 2+</p>
        <h1 className="mt-3 text-4xl font-black text-navy-900">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{subtitle}</p>
      </div>
    </section>
  );
}
