<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Workspace;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_to_login(): void
    {
        $response = $this->get('/');
        $response->assertRedirect('/login');
    }

    public function test_login_page_renders_successfully(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $user = User::factory()->create(['main_currency' => 'MGA']);
        $workspace = Workspace::create(['name' => 'Personal', 'type' => 'personal', 'owner_id' => $user->id]);

        $response = $this->actingAs($user)
            ->withSession(['current_workspace_id' => $workspace->id])
            ->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_user_can_create_transaction(): void
    {
        $user = User::factory()->create(['main_currency' => 'MGA']);
        $workspace = Workspace::create(['name' => 'Personal', 'type' => 'personal', 'owner_id' => $user->id]);

        $account = Account::create([
            'workspace_id' => $workspace->id,
            'name' => 'Test Account',
            'type' => 'bank',
            'currency' => 'MGA',
            'initial_balance' => 100000,
            'current_balance' => 100000,
            'status' => 'active',
        ]);

        $category = Category::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'name' => 'Salaire',
            'type' => 'income',
            'icon' => 'Briefcase',
            'color' => '#10b981',
        ]);

        $response = $this->actingAs($user)
            ->withSession(['current_workspace_id' => $workspace->id])
            ->post('/transactions', [
                'account_id' => $account->id,
                'category_id' => $category->id,
                'type' => 'income',
                'amount' => 50000,
                'currency' => 'MGA',
                'date' => now()->format('Y-m-d'),
                'description' => 'Test Income',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('transactions', [
            'description' => 'Test Income',
            'amount' => 50000,
        ]);

        $this->assertEquals(150000, $account->fresh()->current_balance);
    }
}
