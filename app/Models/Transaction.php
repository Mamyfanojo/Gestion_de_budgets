<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'account_id',
        'destination_account_id',
        'category_id',
        'subcategory_id',
        'type',
        'amount',
        'currency',
        'exchange_rate',
        'amount_in_user_currency',
        'date',
        'description',
        'note',
        'is_recurring',
        'recurring_transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'amount_in_user_currency' => 'decimal:2',
        'date' => 'date',
        'is_recurring' => 'boolean',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function destinationAccount()
    {
        return $this->belongsTo(Account::class, 'destination_account_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(Category::class, 'subcategory_id');
    }

    public function attachments()
    {
        return $this->hasMany(TransactionAttachment::class);
    }

    public function recurringTransaction()
    {
        return $this->belongsTo(RecurringTransaction::class);
    }
}
