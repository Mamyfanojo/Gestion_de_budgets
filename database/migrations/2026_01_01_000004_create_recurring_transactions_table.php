<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('destination_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('type', 20)->default('expense'); // income, expense, transfer
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('MGA');
            $table->string('frequency', 20)->default('monthly'); // daily, weekly, monthly, quarterly, yearly
            $table->date('next_due_date');
            $table->date('last_executed_at')->nullable();
            $table->string('description');
            $table->string('status', 20)->default('active'); // active, paused
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
