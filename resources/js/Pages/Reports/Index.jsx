import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { FileSpreadsheet, Upload, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReportsIndex({ selected_month, report, imports }) {
  const { data, setData, post, processing, errors } = useForm({
    csv_file: null,
  });

  const handleImport = (e) => {
    e.preventDefault();
    if (!data.csv_file) return;
    post('/reports/import-csv');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title="Rapports & Import/Export">
      <Head title="Rapports & Data" />

      {/* Monthly Report Summary */}
      <div className="glass-panel p-6 rounded-3xl mb-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              Rapport Financier Mensuel — {report.month_label}
            </h2>
            <p className="text-xs text-slate-400">Synthèse consolidée des flux de la période</p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/50"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>
        </div>

        {/* Summary Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenus</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              + {formatCurrency(report.total_income)} Ar
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Dépenses</span>
            <div className="text-xl font-extrabold text-rose-400 mt-1">
              - {formatCurrency(report.total_expense)} Ar
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Épargne Nette</span>
            <div className="text-xl font-extrabold text-purple-300 mt-1">
              {formatCurrency(report.net_savings)} Ar
            </div>
          </div>
        </div>

        {/* Category breakdown table */}
        <div>
          <h3 className="font-bold text-sm text-slate-200 mb-3">Répartition par Catégorie</h3>
          <div className="divide-y divide-slate-800 border-t border-slate-800">
            {report.by_category.map((c) => (
              <div key={c.name} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{c.name}</span>
                <span className="font-bold text-slate-100">{formatCurrency(c.total)} Ar</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSV Importer Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Importation CSV de Transactions</h3>
            <p className="text-xs text-slate-400">Importez des données bancaires ou relevés au format CSV</p>
          </div>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setData('csv_file', e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20"
          >
            Lancer l'Importation CSV
          </button>
        </form>

        {/* Previous Imports History */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="font-bold text-xs text-slate-300 mb-3">Historique des Importations</h4>
          <div className="space-y-2">
            {imports.map((imp) => (
              <div key={imp.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">{imp.filename}</span>
                  <span className="text-[10px] text-slate-400">{imp.created_at}</span>
                </div>
                <span className="text-emerald-400 font-bold">{imp.imported_rows} lignes importées</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
