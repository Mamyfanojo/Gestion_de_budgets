<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_path',
        'main_currency',
        'locale',
        'timezone',
        'theme',
        'two_factor_secret',
        'two_factor_enabled',
        'two_factor_recovery_codes',
        'is_admin',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function ownedWorkspaces()
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    public function appNotifications()
    {
        return $this->hasMany(AppNotification::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
