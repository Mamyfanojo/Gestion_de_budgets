import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Download,
  Paperclip,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  X,
  FileText
} from 'lucide-react';

export default function TransactionsIndex({
  transactions,
  accounts,
  categories,
  filters,
  is_trash
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [type, setType] = useState(filters.type || '');
  const [accountId, setAccountId] = useState(filters.account_id || '');
  const [categoryId, setCategoryId] = useState(filters.category_id || '');

  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'expense',
    account_id: accounts[0]?.id || '',
    destination_account_id: '',
    category_id: categories[0]?.id || '',
    subcategory_id: '',
    amount: '',
    currency: 'MGA',
    exchange_rate: 1.0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    note: '',
    attachment: null,
  });

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/transactions', { search, type, account_id: accountId, category_id: categoryId, view: is_trash ? 'trash' : undefined }, { preserveState: true });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    post('/transactions', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous envoyer cette transaction à la corbeille ?')) {
      router.delete(`/transactions/${id}`);
    }
  };

  const handleRestore = (id) => {
    router.post(`/transactions/${id}/restore`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title={is_trash ? "Corbeille des Transactions" : "Gestion des Transactions"}>
      <Head title="Transactions" />

      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">
            {is_trash ? "Corbeille (Restauration)" : "Historique des Transactions"}
          </h2>
          <p className="text-xs text-slate-400">Gérez vos revenus, dépenses et transferts entre comptes</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!is_trash ? (
            <>
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Transaction</span>
              </button>

              <a
                href="/transactions/export/csv"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
                title="Exporter CSV"
              >
                <Download className="w-4 h-4" />
              </a>

              <a
                href="/transactions?view=trash"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors border border-slate-700/50"
                title="Corbeille"
              >
                <Trash2 className="w-4 h-4" />
              </a>
            </>
          ) : (
            <a
              href="/transactions"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              ← Retour aux transactions
            </a>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-6">
        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs"
            />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
          >
            <option value="">Tous les Types</option>
            <option value="income">Revenus (+)</option>
            <option value="expense">Dépenses (-)</option>
            <option value="transfer">Transferts (⇄)</option>
          </select>

          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
          >
            <option value="">Tous les Comptes</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
          >
            <option value="">Toutes les Catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrer</span>
          </button>
        </form>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Type & Intitulé</th>
                <th className="px-4 py-3.5">Compte</th>
                <th className="px-4 py-3.5">Catégorie</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Montant</th>
                <th className="px-4 py-3.5 text-center">Pièce</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.data.length > 0 ? (
                transactions.data.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          tx.type === 'expense' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> :
                           tx.type === 'expense' ? <ArrowDownLeft className="w-4 h-4" /> :
                           <ArrowRightLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">{tx.description}</span>
                          {tx.note && <span className="text-[10px] text-slate-400 block truncate max-w-xs">{tx.note}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-300">
                      {tx.type === 'transfer' ? (
                        <span>{tx.account?.name} → {tx.destination_account?.name}</span>
                      ) : (
                        <span>{tx.account?.name}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {tx.category ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{ backgroundColor: `${tx.category.color}20`, color: tx.category.color }}
                        >
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-400">{tx.date}</td>

                    <td className={`px-4 py-3 text-right font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-400' :
                      tx.type === 'expense' ? 'text-rose-400' : 'text-indigo-300'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''} {formatCurrency(tx.amount)} {tx.currency}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {tx.attachments && tx.attachments.length > 0 ? (
                        <a
                          href={tx.attachments[0].file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          title={tx.attachments[0].original_filename}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {!is_trash ? (
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestore(tx.id)}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nouvelle Transaction</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setData('type', 'expense')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    data.type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dépense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setData('type', 'income')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    data.type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Revenu (+)
                </button>
                <button
                  type="button"
                  onClick={() => setData('type', 'transfer')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    data.type === 'transfer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Transfert (⇄)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Intitulé / Description
                </label>
                <input
                  type="text"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Courses supermarché"
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
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                    placeholder="0.00"
                    required
                  />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Compte Source
                  </label>
                  <select
                    value={data.account_id}
                    onChange={(e) => setData('account_id', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                    required
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                    ))}
                  </select>
                </div>

                {data.type === 'transfer' ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Compte Destination
                    </label>
                    <select
                      value={data.destination_account_id}
                      onChange={(e) => setData('destination_account_id', e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                      required
                    >
                      <option value="">Choisir compte...</option>
                      {accounts.filter(a => a.id !== parseInt(data.account_id)).map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={data.category_id}
                      onChange={(e) => setData('category_id', e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                      required
                    >
                      {categories.filter(c => c.type === data.type).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData('date', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Pièce Jointe (Ticket / Reçu PDF ou Image)
                </label>
                <input
                  type="file"
                  onChange={(e) => setData('attachment', e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
