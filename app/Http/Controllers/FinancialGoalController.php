<?php

namespace App\Http\Controllers;

use App\Models\FinancialGoal;
use App\Models\GoalContribution;
use App\Models\Account;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialGoalController extends Controller
{
    public function index()
    {
        $workspaceId = session('current_workspace_id');

        $goals = FinancialGoal::where('workspace_id', $workspaceId)
            ->with(['contributions.account'])
            ->latest()
            ->get()
            ->map(function ($goal) {
                $percentage = $goal->target_amount > 0 ? round(($goal->current_amount / $goal->target_amount) * 100, 1) : 0;
                $remaining = max(0, $goal->target_amount - $goal->current_amount);

                // Calculate required monthly savings
                $monthlyRequired = 0;
                if ($goal->deadline && $remaining > 0) {
                    $monthsLeft = max(1, Carbon::now()->diffInMonths(Carbon::parse($goal->deadline)));
                    $monthlyRequired = round($remaining / $monthsLeft, 2);
                }

                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'target_amount' => $goal->target_amount,
                    'current_amount' => $goal->current_amount,
                    'remaining_amount' => $remaining,
                    'percentage' => min(100, $percentage),
                    'currency' => $goal->currency,
                    'deadline' => $goal->deadline ? $goal->deadline->format('Y-m-d') : null,
                    'status' => $goal->status,
                    'monthly_required' => $monthlyRequired,
                    'contributions' => $goal->contributions,
                ];
            });

        $accounts = Account::where('workspace_id', $workspaceId)->get();

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_amount' => ['required', 'numeric', 'min:1'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date', 'after:today'],
        ]);

        FinancialGoal::create([
            'workspace_id' => $workspaceId,
            'name' => $validated['name'],
            'target_amount' => $validated['target_amount'],
            'current_amount' => $validated['current_amount'] ?? 0,
            'currency' => $user->main_currency,
            'deadline' => $validated['deadline'] ?? null,
            'status' => 'in_progress',
        ]);

        return back()->with('success', 'Objectif d\'épargne créé avec succès !');
    }

    public function contribute(Request $request, $id)
    {
        $workspaceId = session('current_workspace_id');
        $goal = FinancialGoal::where('workspace_id', $workspaceId)->findOrFail($id);

        $validated = $request->validate([
            'account_id' => ['nullable', 'exists:accounts,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string'],
        ]);

        DB::transaction(function() use ($goal, $validated, $workspaceId, $request) {
            GoalContribution::create([
                'financial_goal_id' => $goal->id,
                'account_id' => $validated['account_id'] ?? null,
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'note' => $validated['note'] ?? null,
            ]);

            $newAmount = $goal->current_amount + $validated['amount'];
            $status = $newAmount >= $goal->target_amount ? 'achieved' : 'in_progress';

            $goal->update([
                'current_amount' => $newAmount,
                'status' => $status,
            ]);

            if ($validated['account_id']) {
                $account = Account::find($validated['account_id']);
                if ($account) {
                    $account->decrement('current_balance', $validated['amount']);
                }
            }

            if ($status === 'achieved') {
                AppNotification::create([
                    'workspace_id' => $workspaceId,
                    'user_id' => $request->user()->id,
                    'type' => 'goal_reached',
                    'title' => 'Félicitations ! Objectif Atteint 🎯',
                    'message' => "Félicitations ! Vous avez atteint votre objectif d'épargne '{$goal->name}'.",
                    'link' => '/goals',
                ]);
            }
        });

        return back()->with('success', 'Contribution d\'épargne enregistrée avec succès !');
    }

    public function destroy($id)
    {
        $workspaceId = session('current_workspace_id');
        $goal = FinancialGoal::where('workspace_id', $workspaceId)->findOrFail($id);
        $goal->delete();

        return back()->with('success', 'Objectif supprimé.');
    }
}
