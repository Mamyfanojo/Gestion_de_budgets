<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\FinancialGoalController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\AdminController;

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return redirect()->route('login');
    });
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::get('/register', [RegisterController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);

    Route::get('/2fa-challenge', [TwoFactorController::class, 'showChallengeForm'])->name('2fa.challenge');
    Route::post('/2fa-challenge', [TwoFactorController::class, 'verifyChallenge']);
});

// Authenticated User Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    Route::post('/transactions/{id}/restore', [TransactionController::class, 'restore'])->name('transactions.restore');
    Route::get('/transactions/export/csv', [TransactionController::class, 'exportCsv'])->name('transactions.export');

    // Accounts
    Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::put('/accounts/{id}', [AccountController::class, 'update'])->name('accounts.update');
    Route::delete('/accounts/{id}', [AccountController::class, 'destroy'])->name('accounts.destroy');

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Budgets
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
    Route::post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
    Route::delete('/budgets/{id}', [BudgetController::class, 'destroy'])->name('budgets.destroy');

    // Goals
    Route::get('/goals', [FinancialGoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [FinancialGoalController::class, 'store'])->name('goals.store');
    Route::post('/goals/{id}/contribute', [FinancialGoalController::class, 'contribute'])->name('goals.contribute');
    Route::delete('/goals/{id}', [FinancialGoalController::class, 'destroy'])->name('goals.destroy');

    // Subscriptions & Payments
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions', [SubscriptionController::class, 'storeSubscription'])->name('subscriptions.store');
    Route::delete('/subscriptions/{id}', [SubscriptionController::class, 'destroySubscription'])->name('subscriptions.destroy');
    Route::post('/payments', [SubscriptionController::class, 'storePayment'])->name('payments.store');
    Route::post('/payments/{id}/pay', [SubscriptionController::class, 'payPayment'])->name('payments.pay');
    Route::delete('/payments/{id}', [SubscriptionController::class, 'destroyPayment'])->name('payments.destroy');

    // Analytics & AI Assistant
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::post('/analytics/assistant', [AnalyticsController::class, 'queryAssistant'])->name('analytics.assistant');

    // Reports & Import
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/import-csv', [ReportController::class, 'importCsv'])->name('reports.import');

    // Workspaces
    Route::get('/workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');
    Route::post('/workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');
    Route::post('/workspaces/{id}/switch', [WorkspaceController::class, 'switchWorkspace'])->name('workspaces.switch');
    Route::post('/workspaces/{id}/invite', [WorkspaceController::class, 'inviteMember'])->name('workspaces.invite');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read_all');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::post('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
    Route::post('/settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme');
    Route::post('/settings/2fa/toggle', [TwoFactorController::class, 'toggle2FA'])->name('2fa.toggle');

    // Admin Panel
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
    Route::post('/admin/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('admin.users.toggle');
});
