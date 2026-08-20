import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: 'user@budget.app',
    password: 'password',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glowing spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 shadow-xl shadow-indigo-500/30 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            FinancesPro
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestion de Budgets & Finances Personnelles</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Connexion à votre espace</h2>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm"
                  placeholder="exemple@email.com"
                  required
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
              {errors.password && <p className="text-rose-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Se Connecter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400">
            <span className="font-semibold text-indigo-400">Compte de Démo :</span> user@budget.app / password
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Vous n'avez pas de compte ?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
