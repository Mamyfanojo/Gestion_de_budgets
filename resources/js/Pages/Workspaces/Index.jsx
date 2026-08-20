import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, Plus, UserPlus, CheckCircle2, Shield, X } from 'lucide-react';

export default function WorkspacesIndex({ workspaces, current_workspace_id }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedWs, setSelectedWs] = useState(null);

  const createForm = useForm({
    name: '',
    type: 'shared',
  });

  const inviteForm = useForm({
    email: '',
    role: 'member',
  });

  const submitCreate = (e) => {
    e.preventDefault();
    createForm.post('/workspaces', {
      onSuccess: () => {
        setModalOpen(false);
        createForm.reset();
      }
    });
  };

  const submitInvite = (e) => {
    e.preventDefault();
    inviteForm.post(`/workspaces/${selectedWs.id}/invite`, {
      onSuccess: () => {
        setInviteModalOpen(false);
        inviteForm.reset();
      }
    });
  };

  const switchWorkspace = (id) => {
    router.post(`/workspaces/${id}/switch`);
  };

  return (
    <AppLayout title="Espaces de Travail & Collaboration">
      <Head title="Espaces" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Espaces Partagés & Familiaux</h2>
          <p className="text-xs text-slate-400">Gérez vos finances individuelles ou en équipe avec gestion de rôles</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold text-xs shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Espace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((ws) => (
          <div key={ws.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{ws.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400 capitalize">{ws.type}</span>
                </div>
              </div>

              {ws.id === current_workspace_id ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                </span>
              ) : (
                <button
                  onClick={() => switchWorkspace(ws.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Activer
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Membres ({ws.members ? ws.members.length : 1})</span>
                {ws.type === 'shared' && (
                  <button
                    onClick={() => { setSelectedWs(ws); setInviteModalOpen(true); }}
                    className="text-xs text-indigo-400 font-semibold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Inviter
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {ws.members?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                    <span>{m.name} ({m.email})</span>
                    <span className="text-[10px] uppercase font-bold text-indigo-400">{m.pivot?.role || 'member'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Workspace */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Créer un Nouvel Espace</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nom de l'espace
                </label>
                <input
                  type="text"
                  value={createForm.data.name}
                  onChange={(e) => createForm.setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Finances Famille Fanojo"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Type d'espace
                </label>
                <select
                  value={createForm.data.type}
                  onChange={(e) => createForm.setData('type', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="shared">Partagé (Famille / Équipe)</option>
                  <option value="personal">Personnel</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg"
                >
                  Créer Espace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Invite Member */}
      {inviteModalOpen && selectedWs && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Inviter à "{selectedWs.name}"</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email de l'utilisateur
                </label>
                <input
                  type="email"
                  value={inviteForm.data.email}
                  onChange={(e) => inviteForm.setData('email', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="membre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Rôle
                </label>
                <select
                  value={inviteForm.data.role}
                  onChange={(e) => inviteForm.setData('role', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="member">Membre (Accès complet)</option>
                  <option value="viewer">Lecture seule</option>
                  <option value="admin">Administrateur d'espace</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg"
                >
                  Envoyer Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
