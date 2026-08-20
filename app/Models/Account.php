<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'workspace_id',
        'name',
        'type',
        'currency',
        'initial_balance',
        'current_balance',
        'status',
        'description',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function incomingTransfers()
    {
        return $this->hasMany(Transaction::class, 'destination_account_id');
    }
}
