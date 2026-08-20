<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\ScheduledPayment;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    public function index()
    {
        $workspaceId = session('current_workspace_id');

        $subscriptions = Subscription::where('workspace_id', $workspaceId)
            ->with(['account', 'category'])
            ->orderBy('next_billing_date')
            ->get();

        $payments = ScheduledPayment::where('workspace_id', $workspaceId)
            ->with(['account', 'category'])
            ->orderBy('due_date')
            ->get();

        // Calculate total monthly & annual costs
        $monthlyCost = 0;
        $annualCost = 0;

        foreach ($subscriptions as $sub) {
            if ($sub->status === 'active') {
                if ($sub->billing_cycle === 'monthly') {
                    $monthlyCost += $sub->amount;
                    $annualCost += ($sub->amount * 12);
                } else {
                    $monthlyCost += ($sub->amount / 12);
                    $annualCost += $sub->amount;
                }
            }
        }

        $accounts = Account::where('workspace_id', $workspaceId)->get();
        $categories = Category::where('workspace_id', $workspaceId)->where('type', 'expense')->get();

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'monthly_cost' => round($monthlyCost, 2),
            'annual_cost' => round($annualCost, 2),
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function storeSubscription(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'account_id' => ['nullable', 'exists:accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'next_billing_date' => ['required', 'date'],
            'reminder_days_before' => ['required', 'integer', 'min:0'],
        ]);

        Subscription::create([
            'workspace_id' => $workspaceId,
            'name' => $validated['name'],
            'provider' => $validated['provider'] ?? null,
            'amount' => $validated['amount'],
            'currency' => $user->main_currency,
            'billing_cycle' => $validated['billing_cycle'],
            'account_id' => $validated['account_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'next_billing_date' => $validated['next_billing_date'],
            'reminder_days_before' => $validated['reminder_days_before'],
            'status' => 'active',
        ]);

        return back()->with('success', 'Abonnement enregistré avec succès !');
    }

    public function storePayment(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'account_id' => ['nullable', 'exists:accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'due_date' => ['required', 'date'],
        ]);

        ScheduledPayment::create([
            'workspace_id' => $workspaceId,
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'currency' => $user->main_currency,
            'account_id' => $validated['account_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'due_date' => $validated['due_date'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Paiement planifié ajouté.');
    }

    public function payPayment($id)
    {
        $workspaceId = session('current_workspace_id');
        $payment = ScheduledPayment::where('workspace_id', $workspaceId)->findOrFail($id);

        DB::transaction(function() use ($payment, $workspaceId) {
            $payment->update(['status' => 'paid']);

            if ($payment->account_id) {
                // Log transaction
                Transaction::create([
                    'workspace_id' => $workspaceId,
                    'account_id' => $payment->account_id,
                    'category_id' => $payment->category_id,
                    'type' => 'expense',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'exchange_rate' => 1.0,
                    'amount_in_user_currency' => $payment->amount,
                    'date' => Carbon::now(),
                    'description' => "Paiement planifié : {$payment->title}",
                ]);

                $account = Account::find($payment->account_id);
                if ($account) {
                    $account->decrement('current_balance', $payment->amount);
                }
            }
        });

        return back()->with('success', 'Paiement marqué comme effectué et débité du compte !');
    }

    public function destroySubscription($id)
    {
        $workspaceId = session('current_workspace_id');
        Subscription::where('workspace_id', $workspaceId)->findOrFail($id)->delete();
        return back()->with('success', 'Abonnement supprimé.');
    }

    public function destroyPayment($id)
    {
        $workspaceId = session('current_workspace_id');
        ScheduledPayment::where('workspace_id', $workspaceId)->findOrFail($id)->delete();
        return back()->with('success', 'Paiement planifié supprimé.');
    }
}
