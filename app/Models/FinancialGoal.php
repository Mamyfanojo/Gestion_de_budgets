<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'target_amount',
        'current_amount',
        'currency',
        'deadline',
        'status',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'deadline' => 'date',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function contributions()
    {
        return $this->hasMany(GoalContribution::class);
    }
}
