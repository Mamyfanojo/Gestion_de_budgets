<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BudgetController extends Controller
{
    public function index()
    {
        $workspaceId = session('current_workspace_id');

        $budgets = Budget::where('workspace_id', $workspaceId)
            ->with(['items.category'])
            ->latest('start_date')
            ->get()
            ->map(function ($budget) use ($workspaceId) {
                $spent = Transaction::where('workspace_id', $workspaceId)
                    ->where('type', 'expense')
                    ->whereBetween('date', [$budget->start_date, $budget->end_date])
                    ->sum('amount_in_user_currency');

                $percentage = $budget->total_amount > 0 ? round(($spent / $budget->total_amount) * 100, 1) : 0;

                // Category breakdown progress
                $items = $budget->items->map(function($item) use ($workspaceId, $budget) {
                    $catSpent = Transaction::where('workspace_id', $workspaceId)
                        ->where('type', 'expense')
                        ->where('category_id', $item->category_id)
                        ->whereBetween('date', [$budget->start_date, $budget->end_date])
                        ->sum('amount_in_user_currency');

                    $itemPct = $item->planned_amount > 0 ? round(($catSpent / $item->planned_amount) * 100, 1) : 0;

                    return [
                        'id' => $item->id,
                        'category_id' => $item->category_id,
                        'category_name' => $item->category ? $item->category->name : 'N/A',
                        'planned_amount' => $item->planned_amount,
                        'spent_amount' => $catSpent,
                        'remaining_amount' => max(0, $item->planned_amount - $catSpent),
                        'percentage' => $itemPct,
                    ];
                });

                return [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'period_type' => $budget->period_type,
                    'start_date' => $budget->start_date->format('d/m/Y'),
                    'end_date' => $budget->end_date->format('d/m/Y'),
                    'total_amount' => $budget->total_amount,
                    'currency' => $budget->currency,
                    'spent_amount' => $spent,
                    'remaining_amount' => max(0, $budget->total_amount - $spent),
                    'percentage' => $percentage,
                    'items' => $items,
                ];
            });

        $categories = Category::where('workspace_id', $workspaceId)
            ->where('type', 'expense')
            ->get();

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'period_type' => ['required', 'in:weekly,monthly,yearly,custom'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'total_amount' => ['required', 'numeric', 'min:0.01'],
            'items' => ['nullable', 'array'],
            'items.*.category_id' => ['required', 'exists:categories,id'],
            'items.*.planned_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $budget = Budget::create([
            'workspace_id' => $workspaceId,
            'name' => $validated['name'],
            'period_type' => $validated['period_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_amount' => $validated['total_amount'],
            'currency' => $user->main_currency,
        ]);

        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                BudgetItem::create([
                    'budget_id' => $budget->id,
                    'category_id' => $item['category_id'],
                    'planned_amount' => $item['planned_amount'],
                ]);
            }
        }

        return back()->with('success', 'Budget créé avec succès !');
    }

    public function destroy($id)
    {
        $workspaceId = session('current_workspace_id');
        $budget = Budget::where('workspace_id', $workspaceId)->findOrFail($id);
        $budget->delete();

        return back()->with('success', 'Budget supprimé.');
    }
}
