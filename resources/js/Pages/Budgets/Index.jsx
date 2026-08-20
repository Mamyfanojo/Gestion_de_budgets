import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PieChart, Plus, Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function BudgetsIndex({ budgets, categories }) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    name: '',
    period_type: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    total_amount: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/budgets', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Supprimer ce budget ?')) {
      router.delete(`/budgets/${id}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title="Budgets & Alertes">
      <Head title="Budgets" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Budgets & Alertes de Dépassement</h2>
          <p className="text-xs text-slate-400">Planifiez vos plafonds de dépenses hebdomadaires, mensuels ou annuels</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Budget</span>
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="space-y-6">
        {budgets.map((b) => (
          <div key={b.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-100">{b.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-extrabold tracking-wider">
                    {b.period_type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Période : {b.start_date} au {b.end_date}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Plafond total</span>
                  <span className="text-xl font-extrabold text-white">{formatCurrency(b.total_amount)} {b.currency}</span>
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Total Gauge Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  Consommé : {formatCurrency(b.spent_amount)} Ar ({b.percentage}%)
                </span>
                <span className="text-slate-400">
                  Reste : {formatCurrency(b.remaining_amount)} Ar
                </span>
              </div>

              <div className="w-full h-4 rounded-full bg-slate-900 border border-slate-800 p-0.5 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    b.percentage >= 100 ? 'bg-gradient-to-r from-rose-600 to-rose-400' :
                    b.percentage >= 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
                    b.percentage >= 75 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, b.percentage)}%` }}
                />
              </div>

              {/* Threshold Alerts Banner */}
              <div className="flex items-center gap-2 text-xs pt-1">
                {b.percentage >= 100 ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Alert 100% : Budget Dépassé !
                  </span>
                ) : b.percentage >= 90 ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Alerte 90% : Seuil critique atteint.
                  </span>
                ) : b.percentage >= 75 ? (
                  <span className="text-amber-300 font-medium flex items-center gap-1">
                    ⚠️ Seuil 75% atteint.
                  </span>
                ) : b.percentage >= 50 ? (
                  <span className="text-indigo-400 font-medium flex items-center gap-1">
                    ℹ️ Seuil 50% atteint.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Dépenses sous contrôle.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Budget */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Créer un Budget</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nom du budget
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Budget Mensuel Alimentation & Loisirs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Période
                  </label>
                  <select
                    value={data.period_type}
                    onChange={(e) => setData('period_type', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Plafond Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.total_amount}
                    onChange={(e) => setData('total_amount', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    placeholder="2 000 000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Date Début
                  </label>
                  <input
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Date Fin
                  </label>
                  <input
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
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
                  Créer Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
