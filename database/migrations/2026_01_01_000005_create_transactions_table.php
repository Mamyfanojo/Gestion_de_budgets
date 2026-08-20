<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('destination_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('type', 20); // income, expense, transfer
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('MGA');
            $table->decimal('exchange_rate', 12, 6)->default(1.000000);
            $table->decimal('amount_in_user_currency', 15, 2);
            $table->date('date');
            $table->string('description');
            $table->text('note')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->foreignId('recurring_transaction_id')->nullable()->constrained('recurring_transactions')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('transaction_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('file_type', 50);
            $table->integer('file_size')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_attachments');
        Schema::dropIfExists('transactions');
    }
};
