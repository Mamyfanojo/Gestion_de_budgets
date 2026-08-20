<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\FinancialGoal;
use App\Models\GoalContribution;
use App\Models\Subscription;
use App\Models\ScheduledPayment;
use App\Models\AppNotification;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::create([
            'name' => 'Administrateur',
            'email' => 'admin@budget.app',
            'password' => Hash::make('password'),
            'main_currency' => 'MGA',
            'locale' => 'fr',
            'timezone' => 'Indian/Antananarivo',
            'theme' => 'dark',
            'is_admin' => true,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $adminWorkspace = Workspace::create([
            'name' => 'Espace Personnel Admin',
            'type' => 'personal',
            'owner_id' => $admin->id,
        ]);

        WorkspaceMember::create([
            'workspace_id' => $adminWorkspace->id,
            'user_id' => $admin->id,
            'role' => 'admin',
        ]);

        // 2. Create Regular User
        $user = User::create([
            'name' => 'Mamy Fanojo',
            'email' => 'user@budget.app',
            'password' => Hash::make('password'),
            'main_currency' => 'MGA',
            'locale' => 'fr',
            'timezone' => 'Indian/Antananarivo',
            'theme' => 'dark',
            'is_admin' => false,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $workspace = Workspace::create([
            'name' => 'Finances Personnelles',
            'type' => 'personal',
            'owner_id' => $user->id,
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        // 3. Create Default Global Categories
        $categoriesData = [
            // Expense categories
            ['name' => 'Alimentation', 'type' => 'expense', 'icon' => 'Utensils', 'color' => '#f59e0b', 'subs' => ['Supermarché', 'Restaurant', 'Boulangerie']],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'Car', 'color' => '#3b82f6', 'subs' => ['Carburant', 'Taxi / Bus', 'Entretien Véhicule']],
            ['name' => 'Logement', 'type' => 'expense', 'icon' => 'Home', 'color' => '#8b5cf6', 'subs' => ['Loyer', 'Électricité & Eau', 'Internet', 'Réparations']],
            ['name' => 'Santé', 'type' => 'expense', 'icon' => 'HeartPulse', 'color' => '#ef4444', 'subs' => ['Pharmacie', 'Consultations', 'Assurance Santé']],
            ['name' => 'Éducation', 'type' => 'expense', 'icon' => 'GraduationCap', 'color' => '#10b981', 'subs' => ['Frais de scolarité', 'Livres & Fournitures', 'Formations']],
            ['name' => 'Loisirs & Sorties', 'type' => 'expense', 'icon' => 'Gamepad2', 'color' => '#ec4899', 'subs' => ['Cinéma & Concerts', 'Voyages', 'Sports']],
            ['name' => 'Abonnements & Services', 'type' => 'expense', 'icon' => 'Tv', 'color' => '#06b6d4', 'subs' => ['Streaming', 'Logiciels', 'Téléphonie']],
            ['name' => 'Shopping & Vêtements', 'type' => 'expense', 'icon' => 'ShoppingBag', 'color' => '#f43f5e', 'subs' => ['Habillements', 'Électronique']],

            // Income categories
            ['name' => 'Salaire', 'type' => 'income', 'icon' => 'Briefcase', 'color' => '#10b981', 'subs' => ['Salaire Principal', 'Heures Supp.']],
            ['name' => 'Freelance / Prestations', 'type' => 'income', 'icon' => 'Laptop', 'color' => '#6366f1', 'subs' => ['Projets Web', 'Consulting']],
            ['name' => 'Investissements', 'type' => 'income', 'icon' => 'TrendingUp', 'color' => '#84cc16', 'subs' => ['Dividendes', 'Intérêts Épargne']],
            ['name' => 'Primes & Bonus', 'type' => 'income', 'icon' => 'Gift', 'color' => '#a855f7', 'subs' => ['Prime de fin d\'année']],
        ];

        $categoryMap = [];

        foreach ($categoriesData as $cat) {
            $parent = Category::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'name' => $cat['name'],
                'type' => $cat['type'],
                'icon' => $cat['icon'],
                'color' => $cat['color'],
            ]);
            $categoryMap[$cat['name']] = $parent;

            foreach ($cat['subs'] as $subName) {
                Category::create([
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                    'name' => $subName,
                    'type' => $cat['type'],
                    'parent_id' => $parent->id,
                    'icon' => $cat['icon'],
                    'color' => $cat['color'],
                ]);
            }
        }

        // 4. Create Accounts for User
        $accBank = Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'Compte Bancaire BNI',
            'type' => 'bank',
            'currency' => 'MGA',
            'initial_balance' => 2500000,
            'current_balance' => 4850000,
            'status' => 'active',
            'description' => 'Compte courant principal',
        ]);

        $accMobile = Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'MVola Mobile Money',
            'type' => 'mobile_money',
            'currency' => 'MGA',
            'initial_balance' => 500000,
            'current_balance' => 620000,
            'status' => 'active',
            'description' => 'Transactions mobiles courantes',
        ]);

        $accCash = Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'Espèces / Portefeuille',
            'type' => 'cash',
            'currency' => 'MGA',
            'initial_balance' => 200000,
            'current_balance' => 145000,
            'status' => 'active',
            'description' => 'Argent liquide en poche',
        ]);

        $accSavings = Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'Compte Épargne Projets',
            'type' => 'savings',
            'currency' => 'MGA',
            'initial_balance' => 3000000,
            'current_balance' => 4200000,
            'status' => 'active',
            'description' => 'Fonds de réserve et objectifs',
        ]);

        // 5. Create Transactions (Income, Expense, Transfer)
        // Income: Salaire
        Transaction::create([
            'workspace_id' => $workspace->id,
            'account_id' => $accBank->id,
            'category_id' => $categoryMap['Salaire']->id,
            'type' => 'income',
            'amount' => 3500000,
            'currency' => 'MGA',
            'exchange_rate' => 1.0,
            'amount_in_user_currency' => 3500000,
            'date' => Carbon::now()->startOfMonth()->addDays(1),
            'description' => 'Virement Salaire Mensuel',
            'note' => 'Bulletin de paie reçu',
        ]);

        // Income: Freelance
        Transaction::create([
            'workspace_id' => $workspace->id,
            'account_id' => $accMobile->id,
            'category_id' => $categoryMap['Freelance / Prestations']->id,
            'type' => 'income',
            'amount' => 800000,
            'currency' => 'MGA',
            'exchange_rate' => 1.0,
            'amount_in_user_currency' => 800000,
            'date' => Carbon::now()->subDays(5),
            'description' => 'Paiement Client Freelance Web',
            'note' => 'Acompte projet E-commerce',
        ]);

        // Expense: Loyer
        Transaction::create([
            'workspace_id' => $workspace->id,
            'account_id' => $accBank->id,
            'category_id' => $categoryMap['Logement']->id,
            'type' => 'expense',
            'amount' => 750000,
            'currency' => 'MGA',
            'exchange_rate' => 1.0,
            'amount_in_user_currency' => 750000,
            'date' => Carbon::now()->startOfMonth()->addDays(2),
            'description' => 'Loyer Mensuel Appartement',
        ]);

        // Expense: Alimentation
        Transaction::create([
            'workspace_id' => $workspace->id,
            'account_id' => $accBank->id,
            'category_id' => $categoryMap['Alimentation']->id,
            'type' => 'expense',
            'amount' => 320000,
            'currency' => 'MGA',
            'exchange_rate' => 1.0,
            'amount_in_user_currency' => 320000,
            'date' => Carbon::now()->subDays(3),
            'description' => 'Courses Supermarché Jumbo',
        ]);

        // Expense: Transport
        Transaction::create([
            'workspace_id' => $workspace->id,
            'account_id' => $accMobile->id,
            'category_id' => $categoryMap['Transport']->id,
            'type' => 'expense',
            'amount' => 120000,
            'currency' => 'MGA',
            'exchange_rate' => 1.0,
            'amount_in_user_currency' => 120000,
            'date' => Carbon::now()->subDays(2),
            'description' => 'Plein Carburant Station Total',
        ]);

        // Transfer: Bank to Savings
        Transaction::create([
            'workspace_id' => $workspace->id,
            'account_id' => $accBank->id,
            'destination_account_id' => $accSavings->id,
            'type' => 'transfer',
            'amount' => 500000,
            'currency' => 'MGA',
            'exchange_rate' => 1.0,
            'amount_in_user_currency' => 500000,
            'date' => Carbon::now()->subDays(4),
            'description' => 'Virement Épargne Mensuelle',
            'note' => 'Virement interne vers compte épargne',
        ]);

        // 6. Create Budget for current month
        $budget = Budget::create([
            'workspace_id' => $workspace->id,
            'name' => 'Budget ' . Carbon::now()->locale('fr')->translatedFormat('F Y'),
            'period_type' => 'monthly',
            'start_date' => Carbon::now()->startOfMonth(),
            'end_date' => Carbon::now()->endOfMonth(),
            'total_amount' => 2000000,
            'currency' => 'MGA',
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category_id' => $categoryMap['Alimentation']->id,
            'planned_amount' => 600000,
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category_id' => $categoryMap['Transport']->id,
            'planned_amount' => 250000,
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category_id' => $categoryMap['Logement']->id,
            'planned_amount' => 850000,
        ]);

        BudgetItem::create([
            'budget_id' => $budget->id,
            'category_id' => $categoryMap['Loisirs & Sorties']->id,
            'planned_amount' => 300000,
        ]);

        // 7. Create Financial Goals
        $goal1 = FinancialGoal::create([
            'workspace_id' => $workspace->id,
            'name' => 'Nouvel Ordinateur Portable',
            'target_amount' => 3000000,
            'current_amount' => 1200000,
            'currency' => 'MGA',
            'deadline' => Carbon::now()->addYear()->format('Y-m-d'),
            'status' => 'in_progress',
        ]);

        GoalContribution::create([
            'financial_goal_id' => $goal1->id,
            'account_id' => $accSavings->id,
            'amount' => 500000,
            'date' => Carbon::now()->subDays(10),
            'note' => 'Premier versement épargne PC',
        ]);

        GoalContribution::create([
            'financial_goal_id' => $goal1->id,
            'account_id' => $accSavings->id,
            'amount' => 700000,
            'date' => Carbon::now()->subDays(2),
            'note' => 'Deuxième versement prime',
        ]);

        $goal2 = FinancialGoal::create([
            'workspace_id' => $workspace->id,
            'name' => 'Fonds d\'Urgence (3 mois)',
            'target_amount' => 6000000,
            'current_amount' => 3000000,
            'currency' => 'MGA',
            'deadline' => Carbon::now()->addMonths(6)->format('Y-m-d'),
            'status' => 'in_progress',
        ]);

        // 8. Create Subscriptions & Scheduled Payments
        Subscription::create([
            'workspace_id' => $workspace->id,
            'name' => 'Abonnement Netflix Premium',
            'provider' => 'Netflix',
            'amount' => 45000,
            'currency' => 'MGA',
            'billing_cycle' => 'monthly',
            'account_id' => $accBank->id,
            'category_id' => $categoryMap['Abonnements & Services']->id,
            'next_billing_date' => Carbon::now()->addDays(7),
            'reminder_days_before' => 3,
            'status' => 'active',
        ]);

        Subscription::create([
            'workspace_id' => $workspace->id,
            'name' => 'Fibre Optique Telma',
            'provider' => 'Telma',
            'amount' => 149000,
            'currency' => 'MGA',
            'billing_cycle' => 'monthly',
            'account_id' => $accBank->id,
            'category_id' => $categoryMap['Logement']->id,
            'next_billing_date' => Carbon::now()->addDays(4),
            'reminder_days_before' => 2,
            'status' => 'active',
        ]);

        ScheduledPayment::create([
            'workspace_id' => $workspace->id,
            'title' => 'Facture d\'Électricité JIRAMA',
            'amount' => 185000,
            'currency' => 'MGA',
            'account_id' => $accBank->id,
            'category_id' => $categoryMap['Logement']->id,
            'due_date' => Carbon::now()->addDays(5),
            'status' => 'pending',
        ]);

        // 9. Notifications & Audit Logs
        AppNotification::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'type' => 'budget_alert',
            'title' => 'Attention au budget Alimentation',
            'message' => 'Vous avez consommé 53% de votre budget Alimentation pour ce mois.',
            'link' => '/budgets',
        ]);

        AppNotification::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'type' => 'payment_due',
            'title' => 'Facture à payer bientôt',
            'message' => 'La facture JIRAMA de 185 000 Ar arrive à échéance dans 5 jours.',
            'link' => '/subscriptions',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'AUTH_LOGIN',
            'description' => 'Connexion réussie depuis l\'application web.',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);
    }
}
