<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\Budget;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $prevStartOfMonth = $now->copy()->subMonth()->startOfMonth();
        $prevEndOfMonth = $now->copy()->subMonth()->endOfMonth();

        // Income vs Expenses
        $currentIncome = Transaction::where('workspace_id', $workspaceId)
            ->where('type', 'income')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount_in_user_currency');

        $currentExpense = Transaction::where('workspace_id', $workspaceId)
            ->where('type', 'expense')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount_in_user_currency');

        $prevExpense = Transaction::where('workspace_id', $workspaceId)
            ->where('type', 'expense')
            ->whereBetween('date', [$prevStartOfMonth, $prevEndOfMonth])
            ->sum('amount_in_user_currency');

        // Variance percentage
        $expenseDiffPct = 0;
        if ($prevExpense > 0) {
            $expenseDiffPct = round((($currentExpense - $prevExpense) / $prevExpense) * 100, 1);
        }

        // Daily average spend in current month
        $daysPassed = max(1, $now->day);
        $dailyAverageSpend = round($currentExpense / $daysPassed, 2);

        // Projected End-of-Month Expenses
        $daysInMonth = $now->daysInMonth;
        $projectedMonthExpense = round($dailyAverageSpend * $daysInMonth, 2);
        $projectedSavings = round($currentIncome - $projectedMonthExpense, 2);

        // Top spend categories
        $topCategories = Transaction::where('transactions.workspace_id', $workspaceId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.date', [$startOfMonth, $endOfMonth])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.color', DB::raw('SUM(transactions.amount_in_user_currency) as total'))
            ->groupBy('categories.name', 'categories.color')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        // Anomaly Detection
        $anomalies = [];

        // 1. High single transaction anomaly (> 3x average transaction amount)
        $avgTxAmount = Transaction::where('workspace_id', $workspaceId)->where('type', 'expense')->avg('amount_in_user_currency') ?: 50000;
        $unusualTx = Transaction::where('workspace_id', $workspaceId)
            ->where('type', 'expense')
            ->where('amount_in_user_currency', '>', $avgTxAmount * 2.5)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->with('category')
            ->get();

        foreach ($unusualTx as $tx) {
            $anomalies[] = [
                'type' => 'unusual_expense',
                'title' => 'Dépense Inhabituelle Détectée',
                'description' => "La transaction '{$tx->description}' d'un montant de " . number_format($tx->amount, 0, ',', ' ') . " {$tx->currency} dépasse largement votre moyenne habituelle.",
                'date' => $tx->date->format('d/m/Y'),
            ];
        }

        // 2. Sudden increase alert
        if ($expenseDiffPct > 15) {
            $anomalies[] = [
                'type' => 'spending_spike',
                'title' => 'Augmentation des Dépenses (+ ' . $expenseDiffPct . '%)',
                'description' => "Vos dépenses globales ce mois-ci ont augmenté de {$expenseDiffPct}% par rapport au mois précédent.",
                'date' => $now->format('d/m/Y'),
            ];
        }

        return Inertia::render('Analytics/Index', [
            'metrics' => [
                'current_income' => (float)$currentIncome,
                'current_expense' => (float)$currentExpense,
                'prev_expense' => (float)$prevExpense,
                'expense_diff_pct' => $expenseDiffPct,
                'daily_average_spend' => $dailyAverageSpend,
                'projected_month_expense' => $projectedMonthExpense,
                'projected_savings' => $projectedSavings,
            ],
            'top_categories' => $topCategories,
            'anomalies' => $anomalies,
        ]);
    }

    public function queryAssistant(Request $request)
    {
        $request->validate([
            'query' => ['required', 'string', 'max:255'],
        ]);

        $workspaceId = session('current_workspace_id');
        $queryText = mb_strtolower($request->input('query'));
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $answer = "";

        if (str_contains($queryText, 'transport')) {
            $total = Transaction::where('transactions.workspace_id', $workspaceId)
                ->where('transactions.type', 'expense')
                ->whereBetween('transactions.date', [$startOfMonth, $endOfMonth])
                ->join('categories', 'transactions.category_id', '=', 'categories.id')
                ->where('categories.name', 'like', '%transport%')
                ->sum('transactions.amount_in_user_currency');

            $answer = "Vous avez dépensé " . number_format($total, 0, ',', ' ') . " " . $request->user()->main_currency . " en transport ce mois-ci.";

        } elseif (str_contains($queryText, 'grosse') || str_contains($queryText, 'plus grande') || str_contains($queryText, 'catégorie')) {
            $topCat = Transaction::where('transactions.workspace_id', $workspaceId)
                ->where('transactions.type', 'expense')
                ->whereBetween('transactions.date', [$startOfMonth, $endOfMonth])
                ->join('categories', 'transactions.category_id', '=', 'categories.id')
                ->select('categories.name', DB::raw('SUM(transactions.amount_in_user_currency) as total'))
                ->groupBy('categories.name')
                ->orderByDesc('total')
                ->first();

            if ($topCat) {
                $answer = "Votre plus grande catégorie de dépenses ce mois-ci est '{$topCat->name}' avec un montant total de " . number_format($topCat->total, 0, ',', ' ') . " " . $request->user()->main_currency . ".";
            } else {
                $answer = "Aucune dépense enregistrée ce mois-ci.";
            }

        } elseif (str_contains($queryText, 'économiser') || str_contains($queryText, 'épargne') || str_contains($queryText, 'réserver')) {
            $inc = Transaction::where('workspace_id', $workspaceId)->where('type', 'income')->whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount_in_user_currency');
            $exp = Transaction::where('workspace_id', $workspaceId)->where('type', 'expense')->whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount_in_user_currency');
            $rem = max(0, $inc - $exp);

            $answer = "En maintenant ce rythme de dépenses, vous pouvez économiser environ " . number_format($rem, 0, ',', ' ') . " " . $request->user()->main_currency . " ce mois-ci.";

        } else {
            $totalExp = Transaction::where('workspace_id', $workspaceId)->where('type', 'expense')->whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount_in_user_currency');
            $answer = "Vos dépenses totales pour ce mois-ci s'élèvent à " . number_format($totalExp, 0, ',', ' ') . " " . $request->user()->main_currency . ". N'hésitez pas à me demander des précisions sur une catégorie spécifique !";
        }

        return back()->with('assistant_response', $answer);
    }
}
