<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\FinancialGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ApiController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'device_name' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'main_currency' => $user->main_currency,
            ],
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function accounts(Request $request)
    {
        $user = $request->user();
        $workspace = $user->workspaces->first();
        $accounts = Account::where('workspace_id', $workspace ? $workspace->id : 1)->get();

        return response()->json($accounts);
    }

    public function transactions(Request $request)
    {
        $user = $request->user();
        $workspace = $user->workspaces->first();
        $transactions = Transaction::where('workspace_id', $workspace ? $workspace->id : 1)
            ->with(['account', 'category'])
            ->latest('date')
            ->paginate(20);

        return response()->json($transactions);
    }

    public function budgets(Request $request)
    {
        $user = $request->user();
        $workspace = $user->workspaces->first();
        $budgets = Budget::where('workspace_id', $workspace ? $workspace->id : 1)->get();

        return response()->json($budgets);
    }

    public function goals(Request $request)
    {
        $user = $request->user();
        $workspace = $user->workspaces->first();
        $goals = FinancialGoal::where('workspace_id', $workspace ? $workspace->id : 1)->get();

        return response()->json($goals);
    }
}
