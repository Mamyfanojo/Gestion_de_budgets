<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $workspaceId = session('current_workspace_id');

        $accounts = Account::where('workspace_id', $workspaceId)
            ->withCount('transactions')
            ->orderBy('status')
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:bank,cash,mobile_money,savings,credit_card,other'],
            'currency' => ['required', 'string', 'in:MGA,EUR,USD,GBP'],
            'initial_balance' => ['required', 'numeric'],
            'description' => ['nullable', 'string'],
        ]);

        $account = Account::create([
            'workspace_id' => $workspaceId,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'currency' => $validated['currency'],
            'initial_balance' => $validated['initial_balance'],
            'current_balance' => $validated['initial_balance'],
            'status' => 'active',
            'description' => $validated['description'] ?? null,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'ACCOUNT_CREATE',
            'description' => "Création du compte {$account->name} ({$account->type}).",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Compte financier ajouté avec succès !');
    }

    public function update(Request $request, $id)
    {
        $workspaceId = session('current_workspace_id');
        $account = Account::where('workspace_id', $workspaceId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:bank,cash,mobile_money,savings,credit_card,other'],
            'status' => ['required', 'in:active,archived'],
            'description' => ['nullable', 'string'],
        ]);

        $account->update($validated);

        return back()->with('success', 'Compte mis à jour avec succès.');
    }

    public function destroy($id)
    {
        $workspaceId = session('current_workspace_id');
        $account = Account::where('workspace_id', $workspaceId)->findOrFail($id);

        $account->delete();

        return back()->with('success', 'Compte archivé.');
    }
}
