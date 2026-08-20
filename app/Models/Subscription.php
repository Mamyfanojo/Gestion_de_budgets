<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'provider',
        'amount',
        'currency',
        'billing_cycle',
        'account_id',
        'category_id',
        'next_billing_date',
        'reminder_days_before',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'next_billing_date' => 'date',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
