import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tag,
  PieChart,
  Target,
  CalendarDays,
  LineChart,
  FileSpreadsheet,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AppLayout({ children, title }) {
  const { auth, flash } = usePage().props;
  const user = auth?.user;
  const currentWorkspace = auth?.current_workspace;
  const workspaces = auth?.workspaces || [];
  const unreadCount = auth?.unread_notifications_count || 0;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(user?.theme || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    router.post('/settings/theme', { theme: newTheme }, { preserveState: true, preserveScroll: true });
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Comptes', href: '/accounts', icon: Wallet },
    { name: 'Catégories', href: '/categories', icon: Tag },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Objectifs', href: '/goals', icon: Target },
    { name: 'Abonnements', href: '/subscriptions', icon: CalendarDays },
    { name: 'Analyse & IA', href: '/analytics', icon: LineChart },
    { name: 'Rapports & Import', href: '/reports', icon: FileSpreadsheet },
    { name: 'Espaces', href: '/workspaces', icon: Users },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  if (user?.is_admin) {
    navItems.push({ name: 'Administration', href: '/admin', icon: ShieldCheck });
  }

  const handleLogout = () => {
    router.post('/logout');
  };

  const switchWorkspace = (workspaceId) => {
    router.post(`/workspaces/${workspaceId}/switch`, {}, {
      onSuccess: () => setWorkspaceDropdownOpen(false)
    });
  };

  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & App Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  Tahiry
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
                  {user?.main_currency || 'MGA'} • Budget App
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Workspace Selector Dropdown */}
          <div className="p-3 relative">
            <button
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition-all text-xs font-medium"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate font-semibold text-slate-200">
                  {currentWorkspace?.name || 'Mon Espace'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {workspaceDropdownOpen && (
              <div className="absolute left-3 right-3 top-14 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Mes Espaces</div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => switchWorkspace(ws.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      ws.id === currentWorkspace?.id ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{ws.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                      {ws.type}
                    </span>
                  </button>
                ))}
                <Link
                  href="/workspaces"
                  className="block text-center text-xs text-indigo-400 hover:text-indigo-300 py-1.5 border-t border-slate-800 font-medium"
                >
                  + Créer / Gérer Espaces
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base lg:text-lg font-bold text-slate-100">{title}</h1>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Quick Add Transaction Button */}
            <Link
              href="/transactions?action=new"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Transaction</span>
            </Link>

            {/* Notifications Bell Button */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-slate-950" />
              )}
            </Link>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Changer Thème"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-11 z-50 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                    <p className="text-[10px] text-slate-400">{user?.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Profil & Sécurité</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Flash Banners */}
        <div className="px-4 lg:px-8 mt-4 space-y-2">
          {flash?.success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{flash.success}</span>
            </div>
          )}
          {flash?.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{flash.error}</span>
            </div>
          )}
          {flash?.info && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{flash.info}</span>
            </div>
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
