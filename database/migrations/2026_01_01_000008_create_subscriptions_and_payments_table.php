<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->string('name');
            $table->string('provider')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('MGA');
            $table->string('billing_cycle', 20)->default('monthly'); // monthly, yearly
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->date('next_billing_date');
            $table->integer('reminder_days_before')->default(3);
            $table->string('status', 20)->default('active'); // active, cancelled
            $table->timestamps();
        });

        Schema::create('scheduled_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('MGA');
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->date('due_date');
            $table->string('status', 20)->default('pending'); // pending, paid, overdue
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_payments');
        Schema::dropIfExists('subscriptions');
    }
};
