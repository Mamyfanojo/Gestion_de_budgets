import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Target, Plus, PiggyBank, Calendar, Trophy, Trash2, X } from 'lucide-react';

export default function GoalsIndex({ goals, accounts }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contribModalOpen, setContribModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const { data, setData, post, processing, reset } = useForm({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
  });

  const contribForm = useForm({
    account_id: accounts[0]?.id || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const submitGoal = (e) => {
    e.preventDefault();
    post('/goals', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const submitContribution = (e) => {
    e.preventDefault();
    contribForm.post(`/goals/${selectedGoal.id}/contribute`, {
      onSuccess: () => {
        setContribModalOpen(false);
        contribForm.reset();
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Supprimer cet objectif ?')) {
      router.delete(`/goals/${id}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title="Objectifs d'Épargne">
      <Head title="Objectifs" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Objectifs d'Épargne & Projets</h2>
          <p className="text-xs text-slate-400">Fixez-vous des cibles d'épargne et suivez votre progression en temps réel</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Objectif</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => (
          <div key={g.id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                    g.status === 'achieved' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {g.status === 'achieved' ? <Trophy className="w-6 h-6 text-amber-400" /> : <Target className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{g.name}</h3>
                    {g.deadline && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Limite : {g.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 my-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Épargné / Cible</span>
                  <span className="font-extrabold text-white">
                    {formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)} {g.currency}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.status === 'achieved' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    }`}
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-indigo-400">{g.percentage}% accompli</span>
                  <span className="text-slate-400">Reste : {formatCurrency(g.remaining_amount)} Ar</span>
                </div>
              </div>

              {/* Monthly Required Calculation */}
              {g.monthly_required > 0 && g.status !== 'achieved' && (
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 mb-3">
                  💡 Épargne nécessaire : <span className="font-bold">{formatCurrency(g.monthly_required)} Ar/mois</span>
                </div>
              )}
            </div>

            {g.status !== 'achieved' ? (
              <button
                onClick={() => { setSelectedGoal(g); setContribModalOpen(true); }}
                className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <PiggyBank className="w-4 h-4" />
                <span>Ajouter un versement</span>
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-center font-bold text-xs flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" /> Objectif Atteint !
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add Goal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nouvel Objectif d'Épargne</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Intitulé du projet / objectif
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Ordinateur Portable"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Montant Cible
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.target_amount}
                    onChange={(e) => setData('target_amount', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    placeholder="3 000 000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Déjà Épargné (Départ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.current_amount}
                    onChange={(e) => setData('current_amount', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Date Limite (Optionnel)
                </label>
                <input
                  type="date"
                  value={data.deadline}
                  onChange={(e) => setData('deadline', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
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
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Créer Objectif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Contribution */}
      {contribModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Verser sur "{selectedGoal.name}"</h3>
              <button onClick={() => setContribModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Débiter depuis le compte
                </label>
                <select
                  value={contribForm.data.account_id}
                  onChange={(e) => contribForm.setData('account_id', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="">Hors compte (Versement manuel)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.current_balance} {acc.currency})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Montant du versement
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={contribForm.data.amount}
                  onChange={(e) => contribForm.setData('amount', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                  placeholder="500 000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={contribForm.data.date}
                  onChange={(e) => contribForm.setData('date', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setContribModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={contribForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Confirmer Versement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
