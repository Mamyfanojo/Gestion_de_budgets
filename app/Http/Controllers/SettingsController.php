<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $auditLogs = AuditLog::where('user_id', $user->id)
            ->latest()
            ->take(15)
            ->get();

        return Inertia::render('Settings/Index', [
            'user' => $user,
            'audit_logs' => $auditLogs,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'main_currency' => ['required', 'string', 'in:MGA,EUR,USD,GBP'],
            'locale' => ['required', 'string', 'in:fr,en'],
            'timezone' => ['required', 'string'],
        ]);

        $user->update($validated);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'PROFILE_UPDATE',
            'description' => 'Mise à jour des informations de profil et devises.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Profil mis à jour avec succès !');
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'PASSWORD_UPDATE',
            'description' => 'Changement du mot de passe.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Mot de passe mis à jour avec succès !');
    }

    public function updateTheme(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'theme' => ['required', 'in:dark,light'],
        ]);

        if ($user) {
            $user->update(['theme' => $validated['theme']]);
        }

        return back()->with('success', 'Thème mis à jour.');
    }
}
