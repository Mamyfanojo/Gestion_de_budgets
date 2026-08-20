<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return back()->withErrors(['email' => 'Identifiants incorrects.']);
        }

        if (!$user->is_active) {
            return back()->withErrors(['email' => 'Votre compte a été désactivé par l\'administrateur.']);
        }

        // Handle 2FA Challenge if enabled
        if ($user->two_factor_enabled) {
            session(['2fa_user_id' => $user->id]);
            return redirect()->route('2fa.challenge');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'AUTH_LOGIN',
            'description' => 'Connexion utilisateur réussie.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->intended('/dashboard')->with('success', 'Bienvenue sur votre espace Tahiry !');
    }

    public function logout(Request $request)
    {
        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'AUTH_LOGOUT',
                'description' => 'Déconnexion utilisateur.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
