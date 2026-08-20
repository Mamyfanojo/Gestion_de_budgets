import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCircle2, AlertTriangle, Info, Target, ArrowRight } from 'lucide-react';

export default function NotificationsIndex({ notifications }) {
  const markRead = (id) => {
    router.post(`/notifications/${id}/read`);
  };

  const markAllRead = () => {
    router.post('/notifications/read-all');
  };

  return (
    <AppLayout title="Notifications & Alertes">
      <Head title="Notifications" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Centre de Notifications</h2>
          <p className="text-xs text-slate-400">Restez informé des dépassements de budget et échéances imminentes</p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/50"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        {notifications.data.length > 0 ? (
          notifications.data.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                !n.read_at ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-900/40 border-slate-800/60 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.created_at}</span>
                </div>
              </div>

              {!n.read_at && (
                <button
                  onClick={() => markRead(n.id)}
                  className="px-3 py-1 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[10px] font-bold"
                >
                  Marquer lu
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center py-8 text-slate-500 text-xs">Aucune notification pour le moment.</p>
        )}
      </div>
    </AppLayout>
  );
}
