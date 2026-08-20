<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->is_admin) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalTransactionsCount = Transaction::count();

        $users = User::latest()->paginate(15);
        $logs = AuditLog::with('user')->latest()->take(20)->get();

        return Inertia::render('Admin/Index', [
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'total_transactions_count' => $totalTransactionsCount,
            ],
            'users' => $users,
            'logs' => $logs,
        ]);
    }

    public function toggleUserStatus(Request $request, $id)
    {
        if (!$request->user()->is_admin) {
            abort(403);
        }

        $targetUser = User::findOrFail($id);
        if ($targetUser->id === $request->user()->id) {
            return back()->with('error', 'Vous ne pouvez pas désactiver votre propre compte d\'administration.');
        }

        $targetUser->update([
            'is_active' => !$targetUser->is_active,
        ]);

        return back()->with('success', "Le statut de l'utilisateur {$targetUser->name} a été mis à jour.");
    }
}
