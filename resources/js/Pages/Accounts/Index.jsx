import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Wallet, Plus, Building, Smartphone, Banknote, PiggyBank, CreditCard, Archive, X } from 'lucide-react';

export default function AccountsIndex({ accounts }) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    type: 'bank',
    currency: 'MGA',
    initial_balance: '0',
    description: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/accounts', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const handleArchive = (id) => {
    if (confirm('Voulez-vous archiver ce compte ?')) {
      router.delete(`/accounts/${id}`);
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'bank': return Building;
      case 'mobile_money': return Smartphone;
      case 'cash': return Banknote;
      case 'savings': return PiggyBank;
      case 'credit_card': return CreditCard;
      default: return Wallet;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title="Comptes Financiers">
      <Head title="Comptes" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Vos Comptes Financiers</h2>
          <p className="text-xs text-slate-400">Centralisez vos avoirs bancaires, espèces et mobile money</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Compte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          return (
            <div key={acc.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {acc.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{acc.name}</h3>
                <p className="text-xs text-slate-400 capitalize mb-4">{acc.type.replace('_', ' ')} • {acc.currency}</p>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Solde Actuel</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    {formatCurrency(acc.current_balance)} <span className="text-xs font-semibold text-indigo-400">{acc.currency}</span>
                  </div>
                </div>

                {acc.description && (
                  <p className="text-xs text-slate-400 italic mb-4">{acc.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{acc.transactions_count || 0} transaction(s)</span>
                <button
                  onClick={() => handleArchive(acc.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Archiver"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Account */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nouveau Compte Financier</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nom du compte
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: BNI Compte Courant"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Type de compte
                  </label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                  >
                    <option value="bank">Banque</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cash">Espèces</option>
                    <option value="savings">Épargne</option>
                    <option value="credit_card">Carte Bancaire</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Devise
                  </label>
                  <select
                    value={data.currency}
                    onChange={(e) => setData('currency', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                  >
                    <option value="MGA">MGA — Ariary</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="USD">USD — Dollar ($)</option>
                    <option value="GBP">GBP — Livre (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Solde Initial
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.initial_balance}
                  onChange={(e) => setData('initial_balance', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description / Note
                </label>
                <textarea
                  rows={2}
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="Notes personnelles..."
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
                  Créer Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
