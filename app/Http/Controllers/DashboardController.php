<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\FinancialGoal;
use App\Models\Subscription;
use App\Models\ScheduledPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $workspaceId = session('current_workspace_id');

        // Accounts
        $accounts = Account::where('workspace_id', $workspaceId)
            ->where('status', 'active')
            ->get();

        $totalBalance = $accounts->sum('current_balance');

        // Current Month Date Range
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Monthly Income & Expenses (transfers excluded per business rule)
        $monthlyIncome = Transaction::where('workspace_id', $workspaceId)
            ->where('type', 'income')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount_in_user_currency');

        $monthlyExpense = Transaction::where('workspace_id', $workspaceId)
            ->where('type', 'expense')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount_in_user_currency');

        $netSavings = $monthlyIncome - $monthlyExpense;
        $savingsRate = $monthlyIncome > 0 ? round(($netSavings / $monthlyIncome) * 100, 1) : 0;

        // Recent Transactions (last 6)
        $recentTransactions = Transaction::where('workspace_id', $workspaceId)
            ->with(['account', 'category', 'destinationAccount'])
            ->latest('date')
            ->latest('id')
            ->take(6)
            ->get();

        // Active Budgets with calculation of spent amount
        $activeBudgets = Budget::where('workspace_id', $workspaceId)
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->with(['items.category'])
            ->get()
            ->map(function ($budget) use ($workspaceId) {
                $spent = Transaction::where('workspace_id', $workspaceId)
                    ->where('type', 'expense')
                    ->whereBetween('date', [$budget->start_date, $budget->end_date])
                    ->sum('amount_in_user_currency');

                $percentage = $budget->total_amount > 0 ? round(($spent / $budget->total_amount) * 100, 1) : 0;

                return [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'total_amount' => $budget->total_amount,
                    'spent_amount' => $spent,
                    'remaining_amount' => max(0, $budget->total_amount - $spent),
                    'percentage' => $percentage,
                    'is_over' => $spent > $budget->total_amount,
                ];
            });

        // Financial Goals Progress
        $goals = FinancialGoal::where('workspace_id', $workspaceId)
            ->where('status', 'in_progress')
            ->get()
            ->map(function ($goal) {
                $percentage = $goal->target_amount > 0 ? round(($goal->current_amount / $goal->target_amount) * 100, 1) : 0;
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'target_amount' => $goal->target_amount,
                    'current_amount' => $goal->current_amount,
                    'percentage' => min(100, $percentage),
                    'deadline' => $goal->deadline ? $goal->deadline->format('d/m/Y') : null,
                ];
            });

        // Upcoming Payments & Subscriptions
        $upcomingSubscriptions = Subscription::where('workspace_id', $workspaceId)
            ->where('status', 'active')
            ->where('next_billing_date', '>=', Carbon::now())
            ->orderBy('next_billing_date')
            ->take(3)
            ->get();

        $upcomingScheduled = ScheduledPayment::where('workspace_id', $workspaceId)
            ->where('status', 'pending')
            ->orderBy('due_date')
            ->take(3)
            ->get();

        // Chart 1: Expenses by Category for current month
        $expensesByCategory = Transaction::where('transactions.workspace_id', $workspaceId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.date', [$startOfMonth, $endOfMonth])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.color', DB::raw('SUM(transactions.amount_in_user_currency) as total'))
            ->groupBy('categories.name', 'categories.color')
            ->get();

        // Chart 2: Cashflow trends (last 6 months)
        $cashflowTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $mStart = $monthDate->copy()->startOfMonth();
            $mEnd = $monthDate->copy()->endOfMonth();

            $inc = Transaction::where('workspace_id', $workspaceId)
                ->where('type', 'income')
                ->whereBetween('date', [$mStart, $mEnd])
                ->sum('amount_in_user_currency');

            $exp = Transaction::where('workspace_id', $workspaceId)
                ->where('type', 'expense')
                ->whereBetween('date', [$mStart, $mEnd])
                ->sum('amount_in_user_currency');

            $cashflowTrend[] = [
                'month' => $monthDate->locale('fr')->translatedFormat('M Y'),
                'income' => (float)$inc,
                'expense' => (float)$exp,
                'savings' => (float)($inc - $exp),
            ];
        }

        return Inertia::render('Dashboard', [
            'metrics' => [
                'total_balance' => (float)$totalBalance,
                'monthly_income' => (float)$monthlyIncome,
                'monthly_expense' => (float)$monthlyExpense,
                'net_savings' => (float)$netSavings,
                'savings_rate' => $savingsRate,
            ],
            'accounts' => $accounts,
            'recent_transactions' => $recentTransactions,
            'budgets' => $activeBudgets,
            'goals' => $goals,
            'upcoming_subscriptions' => $upcomingSubscriptions,
            'upcoming_scheduled' => $upcomingScheduled,
            'expenses_by_category' => $expensesByCategory,
            'cashflow_trend' => $cashflowTrend,
        ]);
    }
}
