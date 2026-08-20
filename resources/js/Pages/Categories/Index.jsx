import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Tag, Plus, Trash2, ChevronRight, X } from 'lucide-react';

export default function CategoriesIndex({ categories }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expense');

  const { data, setData, post, processing, reset } = useForm({
    name: '',
    type: 'expense',
    parent_id: '',
    icon: 'Tag',
    color: '#6366f1',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/categories', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Supprimer cette catégorie ?')) {
      router.delete(`/categories/${id}`);
    }
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <AppLayout title="Gestion des Catégories">
      <Head title="Catégories" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Catégories & Sous-Catégories</h2>
          <p className="text-xs text-slate-400">Organisez et classez vos flux financiers</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6 p-1 bg-slate-900/80 rounded-2xl w-fit border border-slate-800">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dépenses
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Revenus
        </button>
      </div>

      {/* Categories Tree Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Tag className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{cat.name}</h3>
                </div>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Subcategories list */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sous-catégories</span>
                  {cat.subcategories.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/50 text-slate-300">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span>{sub.name}</span>
                      </div>
                      <button onClick={() => handleDelete(sub.id)} className="text-slate-600 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100">Nouvelle Catégorie</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  placeholder="ex: Restaurants & Sorties"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                  >
                    <option value="expense">Dépense</option>
                    <option value="income">Revenu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Couleur
                  </label>
                  <input
                    type="color"
                    value={data.color}
                    onChange={(e) => setData('color', e.target.value)}
                    className="w-full h-9 p-1 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Catégorie Parente (Optionnel pour Sous-Catégorie)
                </label>
                <select
                  value={data.parent_id}
                  onChange={(e) => setData('parent_id', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="">Aucune (Catégorie Principale)</option>
                  {categories.filter(c => c.type === data.type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
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
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
