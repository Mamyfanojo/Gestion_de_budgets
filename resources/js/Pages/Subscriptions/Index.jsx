import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { CalendarDays, Plus, CheckCircle2, Trash2, CreditCard, Clock, X } from 'lucide-react';

export default function SubscriptionsIndex({
  subscriptions,
  payments,
  monthly_cost,
  annual_cost,
  accounts,
  categories
}) {
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const subForm = useForm({
    name: '',
    provider: '',
    amount: '',
    billing_cycle: 'monthly',
    account_id: accounts[0]?.id || '',
    category_id: categories[0]?.id || '',
    next_billing_date: new Date().toISOString().split('T')[0],
    reminder_days_before: 3,
  });

  const payForm = useForm({
    title: '',
    amount: '',
    account_id: accounts[0]?.id || '',
    category_id: categories[0]?.id || '',
    due_date: new Date().toISOString().split('T')[0],
  });

  const submitSub = (e) => {
    e.preventDefault();
    subForm.post('/subscriptions', {
      onSuccess: () => {
        setSubModalOpen(false);
        subForm.reset();
      }
    });
  };

  const submitPay = (e) => {
    e.preventDefault();
    payForm.post('/payments', {
      onSuccess: () => {
        setPayModalOpen(false);
        payForm.reset();
      }
    });
  };

  const handleMarkPaid = (id) => {
    if (confirm('Marquer ce paiement comme effectué et débiter le compte ?')) {
      router.post(`/payments/${id}/pay`);
    }
  };

  const handleDeleteSub = (id) => {
    if (confirm('Supprimer cet abonnement ?')) {
      router.delete(`/subscriptions/${id}`);
    }
  };

  const handleDeletePay = (id) => {
    if (confirm('Supprimer ce paiement planifié ?')) {
      router.delete(`/payments/${id}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title="Abonnements & Paiements">
      <Head title="Abonnements & Paiements" />

      {/* Top Cost Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Coût Mensuel Total Abonnements</span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-1">
              {formatCurrency(monthly_cost)} <span className="text-xs font-semibold">Ar/mois</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Coût Annuel Estimé Abonnements</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {formatCurrency(annual_cost)} <span className="text-xs font-semibold">Ar/an</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Abonnements */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              Vos Abonnements
            </h3>
            <button
              onClick={() => setSubModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Abonnement</span>
            </button>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{sub.name}</h4>
                  <span className="text-xs text-slate-400 block">{sub.provider || 'Abonnement'} • Cycle : {sub.billing_cycle}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold block mt-1">Prochain renouvellement : {sub.next_billing_date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-white">{formatCurrency(sub.amount)} Ar</span>
                  <button onClick={() => handleDeleteSub(sub.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Paiements Planifiés */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Paiements Planifiés & Factures
            </h3>
            <button
              onClick={() => setPayModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Facture / Paiement</span>
            </button>
          </div>

          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{p.title}</h4>
                  <span className="text-xs text-amber-400 block font-semibold">Échéance : {p.due_date}</span>
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${
                    p.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    Statut : {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-white">{formatCurrency(p.amount)} Ar</span>
                  {p.status === 'pending' && (
                    <button
                      onClick={() => handleMarkPaid(p.id)}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Payer</span>
                    </button>
                  )}
                  <button onClick={() => handleDeletePay(p.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Subscription */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nouvel Abonnement</h3>
              <button onClick={() => setSubModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitSub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nom du service / abonnement
                </label>
                <input
                  type="text"
                  value={subForm.data.name}
                  onChange={(e) => subForm.setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Netflix / Spotify / Internet"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Montant
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={subForm.data.amount}
                    onChange={(e) => subForm.setData('amount', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    placeholder="45 000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Cycle de Facturation
                  </label>
                  <select
                    value={subForm.data.billing_cycle}
                    onChange={(e) => subForm.setData('billing_cycle', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Prochaine Date de Prélèvement
                </label>
                <input
                  type="date"
                  value={subForm.data.next_billing_date}
                  onChange={(e) => subForm.setData('next_billing_date', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={subForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Payment */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nouveau Paiement Planifié</h3>
              <button onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitPay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Titre de la facture / paiement
                </label>
                <input
                  type="text"
                  value={payForm.data.title}
                  onChange={(e) => payForm.setData('title', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Facture d'Électricité JIRAMA"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Montant
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={payForm.data.amount}
                    onChange={(e) => payForm.setData('amount', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    placeholder="185 000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Date d'Échéance
                  </label>
                  <input
                    type="date"
                    value={payForm.data.due_date}
                    onChange={(e) => payForm.setData('due_date', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={payForm.processing}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
