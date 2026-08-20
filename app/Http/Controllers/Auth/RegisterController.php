<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\Category;
use App\Models\Account;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function showRegisterForm()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'main_currency' => ['required', 'string', 'in:MGA,EUR,USD,GBP'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'main_currency' => $validated['main_currency'],
            'locale' => 'fr',
            'timezone' => 'Indian/Antananarivo',
            'theme' => 'dark',
            'is_admin' => false,
            'is_active' => true,
        ]);

        // Create personal workspace for the new user
        $workspace = Workspace::create([
            'name' => 'Espace Personnel',
            'type' => 'personal',
            'owner_id' => $user->id,
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        // Seed default categories for new user workspace
        $categoriesData = [
            ['name' => 'Alimentation', 'type' => 'expense', 'icon' => 'Utensils', 'color' => '#f59e0b'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'Car', 'color' => '#3b82f6'],
            ['name' => 'Logement', 'type' => 'expense', 'icon' => 'Home', 'color' => '#8b5cf6'],
            ['name' => 'Santé', 'type' => 'expense', 'icon' => 'HeartPulse', 'color' => '#ef4444'],
            ['name' => 'Éducation', 'type' => 'expense', 'icon' => 'GraduationCap', 'color' => '#10b981'],
            ['name' => 'Loisirs & Sorties', 'type' => 'expense', 'icon' => 'Gamepad2', 'color' => '#ec4899'],
            ['name' => 'Abonnements', 'type' => 'expense', 'icon' => 'Tv', 'color' => '#06b6d4'],
            ['name' => 'Salaire', 'type' => 'income', 'icon' => 'Briefcase', 'color' => '#10b981'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'Laptop', 'color' => '#6366f1'],
            ['name' => 'Primes & Bonus', 'type' => 'income', 'icon' => 'Gift', 'color' => '#a855f7'],
        ];

        foreach ($categoriesData as $cat) {
            Category::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'name' => $cat['name'],
                'type' => $cat['type'],
                'icon' => $cat['icon'],
                'color' => $cat['color'],
            ]);
        }

        // Seed default accounts
        Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'Compte Bancaire',
            'type' => 'bank',
            'currency' => $user->main_currency,
            'initial_balance' => 0,
            'current_balance' => 0,
            'status' => 'active',
        ]);

        Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'Espèces',
            'type' => 'cash',
            'currency' => $user->main_currency,
            'initial_balance' => 0,
            'current_balance' => 0,
            'status' => 'active',
        ]);

        Auth::login($user);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'AUTH_REGISTER',
            'description' => 'Inscription d\'un nouvel utilisateur.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect('/dashboard')->with('success', 'Votre compte a été créé avec succès !');
    }
}
