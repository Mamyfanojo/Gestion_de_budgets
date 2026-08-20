<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionAttachment;
use App\Models\Account;
use App\Models\Category;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();
        $isTrash = $request->query('view') === 'trash';

        $query = Transaction::where('transactions.workspace_id', $workspaceId)
            ->with(['account', 'destinationAccount', 'category', 'subcategory', 'attachments']);

        if ($isTrash) {
            $query->onlyTrashed();
        }

        // Filters
        if ($request->filled('type')) {
            $query->where('transactions.type', $request->type);
        }

        if ($request->filled('account_id')) {
            $query->where(function($q) use ($request) {
                $q->where('transactions.account_id', $request->account_id)
                  ->orWhere('transactions.destination_account_id', $request->account_id);
            });
        }

        if ($request->filled('category_id')) {
            $query->where('transactions.category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transactions.description', 'like', "%{$search}%")
                  ->orWhere('transactions.note', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transactions.date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transactions.date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('transactions.date', 'desc')
            ->orderBy('transactions.id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $accounts = Account::where('workspace_id', $workspaceId)->get();
        $categories = Category::where('workspace_id', $workspaceId)->with('subcategories')->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'filters' => $request->only(['type', 'account_id', 'category_id', 'search', 'date_from', 'date_to', 'view']),
            'is_trash' => $isTrash,
        ]);
    }

    public function store(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $user = $request->user();

        $validated = $request->validate([
            'account_id' => ['required', 'exists:accounts,id'],
            'destination_account_id' => ['nullable', 'required_if:type,transfer', 'different:account_id', 'exists:accounts,id'],
            'category_id' => ['nullable', 'required_unless:type,transfer', 'exists:categories,id'],
            'subcategory_id' => ['nullable', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense,transfer'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string'],
            'exchange_rate' => ['nullable', 'numeric', 'min:0.000001'],
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $exchangeRate = $validated['exchange_rate'] ?? 1.0;
        $amountInUserCurrency = $validated['amount'] * $exchangeRate;

        DB::transaction(function() use ($validated, $workspaceId, $amountInUserCurrency, $exchangeRate, $request, $user) {
            $transaction = Transaction::create([
                'workspace_id' => $workspaceId,
                'account_id' => $validated['account_id'],
                'destination_account_id' => $validated['destination_account_id'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'subcategory_id' => $validated['subcategory_id'] ?? null,
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'exchange_rate' => $exchangeRate,
                'amount_in_user_currency' => $amountInUserCurrency,
                'date' => $validated['date'],
                'description' => $validated['description'],
                'note' => $validated['note'] ?? null,
            ]);

            // Update Account Balances
            $sourceAccount = Account::findOrFail($validated['account_id']);

            if ($validated['type'] === 'income') {
                $sourceAccount->increment('current_balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $sourceAccount->decrement('current_balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $sourceAccount->decrement('current_balance', $validated['amount']);
                $destAccount = Account::findOrFail($validated['destination_account_id']);
                $destAccount->increment('current_balance', $validated['amount']);
            }

            // File Attachment
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $path = $file->store('attachments', 'public');

                TransactionAttachment::create([
                    'transaction_id' => $transaction->id,
                    'file_path' => '/storage/' . $path,
                    'original_filename' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'TRANSACTION_CREATE',
                'description' => "Création transaction #{$transaction->id} ({$validated['type']} de {$validated['amount']} {$validated['currency']}).",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return back()->with('success', 'Transaction enregistrée avec succès !');
    }

    public function destroy($id)
    {
        $workspaceId = session('current_workspace_id');
        $transaction = Transaction::where('workspace_id', $workspaceId)->findOrFail($id);

        DB::transaction(function() use ($transaction) {
            // Revert Account Balances
            $sourceAccount = Account::find($transaction->account_id);
            if ($sourceAccount) {
                if ($transaction->type === 'income') {
                    $sourceAccount->decrement('current_balance', $transaction->amount);
                } elseif ($transaction->type === 'expense') {
                    $sourceAccount->increment('current_balance', $transaction->amount);
                } elseif ($transaction->type === 'transfer') {
                    $sourceAccount->increment('current_balance', $transaction->amount);
                    if ($transaction->destination_account_id) {
                        $destAccount = Account::find($transaction->destination_account_id);
                        if ($destAccount) {
                            $destAccount->decrement('current_balance', $transaction->amount);
                        }
                    }
                }
            }
            $transaction->delete();
        });

        return back()->with('success', 'Transaction envoyée à la corbeille.');
    }

    public function restore($id)
    {
        $workspaceId = session('current_workspace_id');
        $transaction = Transaction::onlyTrashed()->where('workspace_id', $workspaceId)->findOrFail($id);

        DB::transaction(function() use ($transaction) {
            $transaction->restore();

            $sourceAccount = Account::find($transaction->account_id);
            if ($sourceAccount) {
                if ($transaction->type === 'income') {
                    $sourceAccount->increment('current_balance', $transaction->amount);
                } elseif ($transaction->type === 'expense') {
                    $sourceAccount->decrement('current_balance', $transaction->amount);
                } elseif ($transaction->type === 'transfer') {
                    $sourceAccount->decrement('current_balance', $transaction->amount);
                    if ($transaction->destination_account_id) {
                        $destAccount = Account::find($transaction->destination_account_id);
                        if ($destAccount) {
                            $destAccount->increment('current_balance', $transaction->amount);
                        }
                    }
                }
            }
        });

        return back()->with('success', 'Transaction restaurée avec succès !');
    }

    public function exportCsv(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $transactions = Transaction::where('workspace_id', $workspaceId)
            ->with(['account', 'category'])
            ->orderBy('date', 'desc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Date', 'Type', 'Description', 'Montant', 'Devise', 'Compte', 'Categorie', 'Note']);

            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->date->format('Y-m-d'),
                    $t->type,
                    $t->description,
                    $t->amount,
                    $t->currency,
                    $t->account ? $t->account->name : '',
                    $t->category ? $t->category->name : '',
                    $t->note,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
