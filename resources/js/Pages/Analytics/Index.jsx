import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LineChart, Sparkles, AlertTriangle, TrendingUp, Send, Zap, HelpCircle } from 'lucide-react';

export default function AnalyticsIndex({ metrics, top_categories, anomalies }) {
  const { flash } = usePage().props;
  const assistantResponse = flash?.assistant_response;

  const { data, setData, post, processing } = useForm({
    query: '',
  });

  const handleQuery = (e) => {
    e.preventDefault();
    if (!data.query.trim()) return;
    post('/analytics/assistant');
  };

  const sampleQuestions = [
    "Combien ai-je dépensé en transport ce mois-ci ?",
    "Quelle est ma plus grosse catégorie de dépenses ?",
    "Combien puis-je économiser ?"
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount || 0);
  };

  return (
    <AppLayout title="Analyse Financière & Assistant IA">
      <Head title="Analyse & IA" />

      {/* Hero AI Assistant Section */}
      <div className="glass-panel p-6 rounded-3xl mb-8 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">Assistant Financier Intelligent</h2>
            <p className="text-xs text-slate-400">Posez vos questions financières en langage naturel</p>
          </div>
        </div>

        <form onSubmit={handleQuery} className="mt-4 flex gap-2">
          <input
            type="text"
            value={data.query}
            onChange={(e) => setData('query', e.target.value)}
            className="flex-1 glass-input rounded-2xl px-4 py-3 text-xs bg-slate-950/80 focus:ring-2 focus:ring-indigo-500"
            placeholder="Posez votre question (ex: Combien ai-je dépensé en transport ce mois-ci ?)..."
            required
          />
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2"
          >
            <span>Demander</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Sample Query Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Exemples :
          </span>
          {sampleQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => { setData('query', q); }}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700/50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Assistant Response Card */}
        {assistantResponse && (
          <div className="mt-5 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-sm font-medium animate-fadeIn flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 block mb-1">Réponse de l'Assistant :</span>
              <p>{assistantResponse}</p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics & Forecast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Dépense Moyenne Quotidienne</span>
          <div className="text-2xl font-extrabold text-white mt-2">
            {formatCurrency(metrics.daily_average_spend)} <span className="text-xs text-indigo-400">Ar/jour</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sur la période en cours</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Prévision Dépenses Fin de Mois</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {formatCurrency(metrics.projected_month_expense)} <span className="text-xs">Ar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Basé sur le rythme moyen actuel</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Épargne Probable Estimée</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {formatCurrency(metrics.projected_savings)} <span className="text-xs">Ar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Revenus - Prévision des dépenses</p>
        </div>
      </div>

      {/* Anomalies Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8">
        <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-400" />
          Détection d'Anomalies & Alertes
        </h3>

        <div className="space-y-3">
          {anomalies.map((a, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">{a.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{a.description}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Détecté le {a.date}</span>
              </div>
            </div>
          ))}

          {anomalies.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">Aucune anomalie détectée ce mois-ci. Vos dépenses sont régulières.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
