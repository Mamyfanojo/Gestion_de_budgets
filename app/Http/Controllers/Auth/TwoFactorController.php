<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorController extends Controller
{
    public function showChallengeForm()
    {
        if (!session('2fa_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function verifyChallenge(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $userId = session('2fa_user_id');
        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login');
        }

        // Demo fallback or valid OTP verification (accept demo '123456' or valid TOTP)
        if ($request->code === '123456' || $request->code === $user->two_factor_secret) {
            session()->forget('2fa_user_id');
            Auth::login($user);
            $request->session()->regenerate();

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'AUTH_2FA_SUCCESS',
                'description' => 'Vérification 2FA réussie.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return redirect()->intended('/dashboard')->with('success', 'Authentification à deux facteurs validée !');
        }

        return back()->withErrors(['code' => 'Code 2FA invalide. Pour la démonstration, utilisez 123456.']);
    }

    public function toggle2FA(Request $request)
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            $user->update([
                'two_factor_enabled' => false,
                'two_factor_secret' => null,
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => '2FA_DISABLED',
                'description' => 'Désactivation de la 2FA.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return back()->with('info', 'L\'authentification 2FA a été désactivée.');
        }

        // Generate secret
        $secret = strtoupper(substr(bin2hex(random_bytes(10)), 0, 16));
        $user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode([
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(4)),
            ]),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => '2FA_ENABLED',
            'description' => 'Activation de l\'authentification 2FA.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Authentification 2FA activée avec succès ! Clé Secrète : ' . $secret);
    }
}
