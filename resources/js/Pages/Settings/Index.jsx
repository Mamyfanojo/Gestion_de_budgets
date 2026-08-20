import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { User, Lock, Globe, ShieldCheck, Moon, Sun, History } from 'lucide-react';

export default function SettingsIndex({ user, audit_logs }) {
  const profileForm = useForm({
    name: user.name || '',
    main_currency: user.main_currency || 'MGA',
    locale: user.locale || 'fr',
    timezone: user.timezone || 'Indian/Antananarivo',
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const submitProfile = (e) => {
    e.preventDefault();
    profileForm.post('/settings/profile');
  };

  const submitPassword = (e) => {
    e.preventDefault();
    passwordForm.post('/settings/password', {
      onSuccess: () => passwordForm.reset(),
    });
  };

  const toggle2FA = () => {
    profileForm.post('/settings/2fa/toggle');
  };

  return (
    <AppLayout title="Paramètres & Sécurité">
      <Head title="Paramètres" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Profile Settings Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base text-slate-100">Profil & Préférences Devises</h3>
          </div>

          <form onSubmit={submitProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={profileForm.data.name}
                onChange={(e) => profileForm.setData('name', e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Devise Principale
              </label>
              <select
                value={profileForm.data.main_currency}
                onChange={(e) => profileForm.setData('main_currency', e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
              >
                <option value="MGA">MGA — Ariary Malgache</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="USD">USD — Dollar US ($)</option>
                <option value="GBP">GBP — Livre Sterling (£)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Langue
                </label>
                <select
                  value={profileForm.data.locale}
                  onChange={(e) => profileForm.setData('locale', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Fuseau Horaire
                </label>
                <input
                  type="text"
                  value={profileForm.data.timezone}
                  onChange={(e) => profileForm.setData('timezone', e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileForm.processing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
            >
              Sauvegarder les modifications
            </button>
          </form>
        </div>

        {/* Security & 2FA Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-slate-100">Sécurité & Double Authentification</h3>
          </div>

          {/* 2FA Toggle Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-100">Authentification 2FA</h4>
              <p className="text-[11px] text-slate-400">Protégez votre compte avec un code TOTP temporaire</p>
            </div>
            <button
              onClick={toggle2FA}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.two_factor_enabled
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-600 text-white shadow-md'
              }`}
            >
              {user.two_factor_enabled ? 'Désactiver 2FA' : 'Activer 2FA'}
            </button>
          </div>

          {/* Password Form */}
          <form onSubmit={submitPassword} className="space-y-4 pt-2">
            <h4 className="font-bold text-xs text-slate-300">Changer de Mot de Passe</h4>

            <div>
              <input
                type="password"
                value={passwordForm.data.current_password}
                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                placeholder="Mot de passe actuel"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="password"
                value={passwordForm.data.password}
                onChange={(e) => passwordForm.setData('password', e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                placeholder="Nouveau mot de passe"
                required
              />
              <input
                type="password"
                value={passwordForm.data.password_confirmation}
                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                placeholder="Confirmer mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordForm.processing}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/50"
            >
              Mettre à jour mot de passe
            </button>
          </form>
        </div>

      </div>

      {/* Audit Log Stream */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-indigo-400" />
          Journal d'Activité & Audit de Sécurité
        </h3>

        <div className="divide-y divide-slate-800 border-t border-slate-800">
          {audit_logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-200 block">{log.action}</span>
                <span className="text-[10px] text-slate-400">{log.description} • {log.ip_address}</span>
              </div>
              <span className="text-[10px] text-slate-500">{log.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
