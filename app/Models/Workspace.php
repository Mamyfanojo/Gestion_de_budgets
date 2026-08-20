<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'owner_id'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'workspace_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function financialGoals()
    {
        return $this->hasMany(FinancialGoal::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function scheduledPayments()
    {
        return $this->hasMany(ScheduledPayment::class);
    }
}
