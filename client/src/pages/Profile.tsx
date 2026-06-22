import { Award, BarChart3, GraduationCap, Heart, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { UserProfile } from "../types";
import { rankLabels } from "../utils/ranks";

const careerLabels = {
  ECONOMIA: "Economía",
  ECONOMIA_PUBLICA: "Economía pública",
  ECONOMIA_INTERNACIONAL: "Economía internacional",
} as const;

export function Profile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!token) return;
    apiRequest<UserProfile>("/users/me/profile", { token }).then(setProfile);
  }, [token]);

  if (!user) return null;

  const progress = profile?.progress;

  return (
    <section className="page-shell py-10">
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-lg">
        <div className="h-32 bg-gradient-to-r from-navy-900 via-navy-700 to-navy-500" />
        <div className="px-6 pb-8">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-navy-50 text-4xl font-black text-navy-900 shadow">
                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" /> : user.username[0]}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-black text-navy-900">{profile?.user.username ?? user.username}</h1>
                <p className="text-slate-600">{user.email}</p>
              </div>
            </div>
            <span className="rounded-full bg-gold px-4 py-2 text-sm font-black text-navy-900">{user.role}</span>
          </div>

          {progress && (
            <div className="mt-8 rounded-2xl bg-navy-50 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-navy-900">{rankLabels[progress.rank]}</p>
                  <p className="text-sm text-slate-600">
                    {progress.nextRank ? `${progress.pointsToNext} puntos para ${rankLabels[progress.nextRank]}` : "Rango máximo alcanzado"}
                  </p>
                </div>
                <p className="text-sm font-black text-navy-900">{progress.progressPercent}%</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gold" style={{ width: `${progress.progressPercent}%` }} />
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Metric icon={<Award />} label="Rango" value={rankLabels[profile?.user.rank ?? user.rank]} />
            <Metric icon={<BarChart3 />} label="Puntos" value={String(profile?.user.points ?? user.points)} />
            <Metric icon={<Heart />} label="Likes recibidos" value={String(profile?.stats.likesReceived ?? 0)} />
          </div>

          <div className="mt-6 rounded-2xl border border-navy-100 p-5">
            <div className="flex items-center gap-3">
              <GraduationCap className="text-navy-900" />
              <h2 className="text-xl font-black text-navy-900">Datos académicos</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <AcademicItem label="Universidad" value={profile?.user.university ?? user.university ?? "Pendiente"} />
              <AcademicItem
                label="Carrera"
                value={(profile?.user.career ?? user.career) ? careerLabels[(profile?.user.career ?? user.career)!] : "Pendiente"}
              />
              <AcademicItem label="Base" value={profile?.user.base ?? user.base ?? "Pendiente"} />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ImagePlus className="text-navy-900" />
          <h2 className="text-2xl font-black text-navy-900">Mis memes</h2>
        </div>
        {!profile || profile.memes.length === 0 ? (
          <p className="mt-4 text-slate-600">Todavía no tienes memes subidos.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profile.memes.map((meme) => (
              <article key={meme.id} className="overflow-hidden rounded-xl border border-navy-100">
                <img src={meme.imageUrl} alt={meme.title} className="aspect-square w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-navy-900">{meme.title}</h3>
                    <span className="rounded-full bg-navy-50 px-2 py-1 text-xs font-black text-navy-900">{meme.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{meme.likesCount} likes</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function AcademicItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-navy-900">{value}</p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-50 p-5">
      <div className="text-navy-900">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-black text-navy-900">{value}</p>
    </div>
  );
}
