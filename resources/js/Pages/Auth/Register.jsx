import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Sparkles, Lock, Mail, User, Globe, ArrowRight } from 'lucide-react';

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    main_currency: 'MGA',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/register');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 shadow-xl shadow-indigo-500/30 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Créer un compte
          </h1>
          <p className="text-sm text-slate-400 mt-1">Rejoignez Tahiry pour piloter vos budgets</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-800/80">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm"
                  placeholder="Mamy Fanojo"
                  required
                />
              </div>
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Devise Principale
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={data.main_currency}
                  onChange={(e) => setData('main_currency', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm appearance-none bg-slate-900"
                >
                  <option value="MGA">MGA — Ariary Malgache</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="USD">USD — Dollar US ($)</option>
                  <option value="GBP">GBP — Livre Sterling (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirmer mot de passe
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Créer mon compte</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
