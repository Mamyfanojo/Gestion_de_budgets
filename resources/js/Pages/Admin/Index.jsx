import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, Users, Activity, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export default function AdminIndex({ stats, users, logs }) {
  const toggleStatus = (userId) => {
    router.post(`/admin/users/${userId}/toggle-status`);
  };

  return (
    <AppLayout title="Panneau d'Administration">
      <Head title="Administration" />

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Utilisateurs Inscrits</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.total_users}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Comptes Actifs</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.active_users}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Transactions Plateforme</span>
            <div className="text-2xl font-extrabold text-purple-300 mt-1">{stats.total_transactions_count}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 mb-8 space-y-4">
        <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Gestion des Utilisateurs de la Plateforme
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Devise</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-200 block">{u.name}</span>
                    <span className="text-[10px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-300">{u.main_currency}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">Administrateur</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Utilisateur</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="text-emerald-400 font-bold text-[10px]">Actif</span>
                    ) : (
                      <span className="text-rose-400 font-bold text-[10px]">Désactivé</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        u.is_active ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                    >
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Surveillance des Logs Système
        </h3>

        <div className="divide-y divide-slate-800 border-t border-slate-800">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-200 block">{log.action} — {log.user ? log.user.name : 'Système'}</span>
                <span className="text-[10px] text-slate-400">{log.description} • {log.ip_address}</span>
              </div>
              <span className="text-[10px] text-slate-500">{log.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
