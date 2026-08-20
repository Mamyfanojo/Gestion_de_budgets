<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\Account;
use App\Models\Import;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = session('current_workspace_id');
        $month = $request->query('month', Carbon::now()->format('Y-m'));

        $date = Carbon::createFromFormat('Y-m', $month);
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        $income = Transaction::where('workspace_id', $workspaceId)->where('type', 'income')->whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount_in_user_currency');
        $expense = Transaction::where('workspace_id', $workspaceId)->where('type', 'expense')->whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount_in_user_currency');

        $byCategory = Transaction::where('transactions.workspace_id', $workspaceId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.date', [$startOfMonth, $endOfMonth])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.color', DB::raw('SUM(transactions.amount_in_user_currency) as total'))
            ->groupBy('categories.name', 'categories.color')
            ->get();

        $imports = Import::where('workspace_id', $workspaceId)->latest()->get();

        return Inertia::render('Reports/Index', [
            'selected_month' => $month,
            'report' => [
                'month_label' => $date->locale('fr')->translatedFormat('F Y'),
                'total_income' => (float)$income,
                'total_expense' => (float)$expense,
                'net_savings' => (float)($income - $expense),
                'by_category' => $byCategory,
            ],
            'imports' => $imports,
        ]);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $workspaceId = session('current_workspace_id');
        $user = $request->user();
        $file = $request->file('csv_file');

        $path = $file->getRealPath();
        $rows = array_map('str_getcsv', file($path));

        if (count($rows) <= 1) {
            return back()->with('error', 'Le fichier CSV est vide ou non valide.');
        }

        $header = array_shift($rows);
        $importedCount = 0;
        $failedCount = 0;

        $defaultAccount = Account::where('workspace_id', $workspaceId)->first();
        $defaultCategory = Category::where('workspace_id', $workspaceId)->first();

        DB::transaction(function() use ($rows, $workspaceId, $defaultAccount, $defaultCategory, &$importedCount, &$failedCount) {
            foreach ($rows as $row) {
                if (count($row) < 3) {
                    $failedCount++;
                    continue;
                }

                try {
                    $dateStr = trim($row[0]);
                    $desc = trim($row[1] ?? 'Import Transaction');
                    $amount = floatval(trim($row[2] ?? 0));
                    $type = (isset($row[3]) && strtolower(trim($row[3])) === 'income') ? 'income' : 'expense';

                    Transaction::create([
                        'workspace_id' => $workspaceId,
                        'account_id' => $defaultAccount ? $defaultAccount->id : 1,
                        'category_id' => $defaultCategory ? $defaultCategory->id : null,
                        'type' => $type,
                        'amount' => abs($amount),
                        'currency' => 'MGA',
                        'exchange_rate' => 1.0,
                        'amount_in_user_currency' => abs($amount),
                        'date' => Carbon::parse($dateStr),
                        'description' => $desc,
                    ]);

                    $importedCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                }
            }
        });

        Import::create([
            'workspace_id' => $workspaceId,
            'user_id' => $user->id,
            'filename' => $file->getClientOriginalName(),
            'total_rows' => count($rows),
            'imported_rows' => $importedCount,
            'failed_rows' => $failedCount,
            'status' => 'completed',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'DATA_IMPORT_CSV',
            'description' => "Import CSV exécuté. {$importedCount} lignes importées.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', "Importation CSV terminée ! {$importedCount} transactions importées avec succès.");
    }
}
