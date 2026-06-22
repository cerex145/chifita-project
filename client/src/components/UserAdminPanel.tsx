import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import type { AdminUser, Rank, Role } from "../types";
import { rankLabels } from "../utils/ranks";

const roles: Role[] = ["USER", "ADMIN"];
const ranks: Rank[] = ["MIEMBRO_BASICO", "MIEMBRO_CUSQUISPE", "MIEMBRO_MILAR_CUSQUISPE"];

export function UserAdminPanel() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function loadUsers() {
    if (!token) return;
    apiRequest<{ users: AdminUser[] }>("/users", { token }).then((data) => setUsers(data.users));
  }

  useEffect(() => {
    loadUsers();
  }, [token]);

  async function updateUser(id: string, data: Partial<Pick<AdminUser, "role" | "rank" | "points">>) {
    if (!token) return;
    const response = await apiRequest<{ user: AdminUser }>(`/users/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    });
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...response.user } : user)));
    setMessage("Usuario actualizado.");
  }

  return (
    <section className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <p className="eyebrow">Usuarios</p>
      <h2 className="mt-2 text-2xl font-black text-navy-900">Gestión de usuarios</h2>
      {message && <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-900">{message}</div>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3">Usuario</th>
              <th>Rol</th>
              <th>Rango</th>
              <th>Puntos</th>
              <th>Actividad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} onSave={updateUser} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UserRow({
  user,
  onSave,
}: {
  user: AdminUser;
  onSave: (id: string, data: Partial<Pick<AdminUser, "role" | "rank" | "points">>) => Promise<void>;
}) {
  const [role, setRole] = useState<Role>(user.role);
  const [rank, setRank] = useState<Rank>(user.rank);
  const [points, setPoints] = useState(user.points);

  return (
    <tr className="border-t border-navy-100">
      <td className="py-4">
        <p className="font-black text-navy-900">{user.username}</p>
        <p className="text-slate-500">{user.email}</p>
      </td>
      <td>
        <select className="input h-10" value={role} onChange={(event) => setRole(event.target.value as Role)}>
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select className="input h-10" value={rank} onChange={(event) => setRank(event.target.value as Rank)}>
          {ranks.map((item) => (
            <option key={item} value={item}>
              {rankLabels[item]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input className="input h-10 w-24" type="number" min={0} value={points} onChange={(event) => setPoints(Number(event.target.value))} />
      </td>
      <td className="text-slate-600">
        {user._count.memes} memes · {user._count.materials} materiales
      </td>
      <td>
        <button className="secondary-button" onClick={() => onSave(user.id, { role, rank, points })}>
          <Save size={16} />
          Guardar
        </button>
      </td>
    </tr>
  );
}
