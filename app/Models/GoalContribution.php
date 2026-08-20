<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoalContribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_goal_id',
        'account_id',
        'amount',
        'date',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
    ];

    public function goal()
    {
        return $this->belongsTo(FinancialGoal::class, 'financial_goal_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
