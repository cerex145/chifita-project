import { CheckCircle2, Trophy } from "lucide-react";
import type { Rank } from "../types";
import { rankBenefits, rankLabels, rankThresholds } from "../utils/ranks";

const ranks = Object.keys(rankLabels) as Rank[];

export function Ranks() {
  return (
    <section className="page-shell py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Progresión</p>
        <h1 className="mt-3 text-4xl font-black text-navy-900 md:text-5xl">Sistema de Rangos</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Gana puntos participando: +10 por meme aprobado y +1 por cada like recibido.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {ranks.map((rank) => (
          <article key={rank} className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-2xl bg-navy-50 p-3 text-navy-900">
              <Trophy />
            </div>
            <h2 className="mt-5 text-2xl font-black text-navy-900">{rankLabels[rank]}</h2>
            <p className="mt-2 rounded-full bg-gold/20 px-3 py-1 text-sm font-black text-navy-900">
              Desde {rankThresholds[rank]} puntos
            </p>
            <h3 className="mt-6 font-black uppercase text-slate-500">Beneficios</h3>
            <div className="mt-3 space-y-3">
              {rankBenefits[rank].map((benefit) => (
                <div key={benefit} className="flex gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={20} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
