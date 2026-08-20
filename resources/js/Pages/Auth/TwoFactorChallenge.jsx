import React from 'react';
import { useForm } from '@inertiajs/react';
import { ShieldCheck, Key, ArrowRight } from 'lucide-react';

export default function TwoFactorChallenge() {
  const { data, setData, post, processing, errors } = useForm({
    code: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/2fa-challenge');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 mb-3 shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Vérification 2FA</h1>
          <p className="text-sm text-slate-400 mt-1">Entrez le code TOTP à 6 chiffres généré par votre application.</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-800">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Code de sécurité (2FA)
              </label>
              <div className="relative">
                <Key className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-center tracking-widest text-lg font-mono"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              {errors.code && <p className="text-rose-400 text-xs mt-1.5">{errors.code}</p>}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Vérifier et Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            💡 <span className="font-semibold">Code de démonstration :</span> Saisissez <span className="font-mono font-bold">123456</span> pour valider.
          </div>
        </div>
      </div>
    </div>
  );
}
