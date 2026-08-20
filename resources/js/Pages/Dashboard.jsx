import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  TrendingUp,
  CreditCard,
  PieChart,
  Calendar,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Receipt
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export default function Dashboard({
  metrics,
  accounts,
  recent_transactions,
  budgets,
  goals,
  upcoming_subscriptions,
  upcoming_scheduled,
  expenses_by_category,
  cashflow_trend,
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <AppLayout title="Tableau de Bord Financier">
      <Head title="Dashboard" />

      {/* Top Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Net Balance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Solde Total</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(metrics.total_balance)} <span className="text-xs text-indigo-400 font-semibold">Ar</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cumul de tous vos comptes actifs</p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revenus (Mois)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
              + {formatCurrency(metrics.monthly_income)} <span className="text-xs font-semibold">Ar</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total des entrées du mois</p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dépenses (Mois)</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-400 tracking-tight">
              - {formatCurrency(metrics.monthly_expense)} <span className="text-xs font-semibold">Ar</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total des sorties du mois</p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Épargne Nette</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-purple-300 tracking-tight">
              {formatCurrency(metrics.net_savings)} <span className="text-xs font-semibold text-purple-400">Ar</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Taux d'épargne: <span className="font-bold text-purple-400">{metrics.savings_rate}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Area Chart: Cashflow Evolution */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Évolution de la Trésorerie
              </h3>
              <p className="text-xs text-slate-400">Comparaison Revenus vs Dépenses (6 derniers mois)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflow_trend}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`${formatCurrency(value)} Ar`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="income" name="Revenus" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Expenses by Category */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 mb-1">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Répartition des Dépenses
            </h3>
            <p className="text-xs text-slate-400 mb-4">Dépenses par catégorie ce mois-ci</p>

            <div className="h-52 w-full">
              {expenses_by_category.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={expenses_by_category}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {expenses_by_category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value) => [`${formatCurrency(value)} Ar`, '']}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Aucune dépense enregistrée ce mois-ci
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {expenses_by_category.slice(0, 3).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-200">{formatCurrency(cat.total)} Ar</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Section: Accounts + Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Accounts List */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Vos Comptes Financiers
            </h3>
            <Link href="/accounts" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>Gérer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                    {acc.type.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{acc.name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">{acc.type.replace('_', ' ')} • {acc.currency}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-100">{formatCurrency(acc.current_balance)} {acc.currency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Budget Progress */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Budgets du Mois
            </h3>
            <Link href="/budgets" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{b.name}</span>
                    <span className="text-slate-400 font-mono">
                      {formatCurrency(b.spent_amount)} / {formatCurrency(b.total_amount)} Ar
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.percentage >= 100 ? 'bg-rose-500' : b.percentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Consommé : {b.percentage}%</span>
                    {b.is_over && <span className="text-rose-400 font-bold">⚠️ Dépassement !</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Aucun budget configuré pour la période en cours.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-400" />
              Dernières Transactions
            </h3>
            <Link href="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>Voir l'historique</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recent_transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    tx.type === 'expense' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> :
                     tx.type === 'expense' ? <ArrowDownLeft className="w-4 h-4" /> :
                     <Wallet className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{tx.description}</h5>
                    <span className="text-[10px] text-slate-400">
                      {tx.date} • {tx.account ? tx.account.name : 'Compte'} {tx.category ? `• ${tx.category.name}` : ''}
                    </span>
                  </div>
                </div>
                <div className={`text-xs font-extrabold ${
                  tx.type === 'income' ? 'text-emerald-400' :
                  tx.type === 'expense' ? 'text-rose-400' : 'text-indigo-300'
                }`}>
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''} {formatCurrency(tx.amount)} {tx.currency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments & Subscriptions */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Échéances à Venir
            </h3>
            <Link href="/subscriptions" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcoming_scheduled.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-slate-200">{p.title}</h5>
                  <span className="text-[10px] text-amber-400 font-medium">Échéance : {p.due_date}</span>
                </div>
                <span className="font-extrabold text-rose-400">{formatCurrency(p.amount)} Ar</span>
              </div>
            ))}

            {upcoming_subscriptions.map((sub) => (
              <div key={sub.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-slate-200">{sub.name}</h5>
                  <span className="text-[10px] text-indigo-400 font-medium">Renouvellement : {sub.next_billing_date}</span>
                </div>
                <span className="font-extrabold text-slate-200">{formatCurrency(sub.amount)} Ar</span>
              </div>
            ))}

            {upcoming_scheduled.length === 0 && upcoming_subscriptions.length === 0 && (
              <p className="text-center py-6 text-slate-500 text-xs">Aucun paiement prévu prochainement.</p>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
