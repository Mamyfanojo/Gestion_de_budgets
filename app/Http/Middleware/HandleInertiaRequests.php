<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Workspace;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentWorkspace = null;
        $workspaces = [];
        $unreadNotificationsCount = 0;

        if ($user) {
            $user->load(['workspaces', 'ownedWorkspaces']);
            
            // Collect all workspaces
            $userWorkspaces = $user->workspaces;
            $ownedWorkspaces = $user->ownedWorkspaces;
            $workspaces = $userWorkspaces->merge($ownedWorkspaces)->unique('id')->values();

            // Default to session workspace or first workspace
            $sessionWorkspaceId = session('current_workspace_id');
            if ($sessionWorkspaceId) {
                $currentWorkspace = $workspaces->firstWhere('id', $sessionWorkspaceId);
            }

            if (!$currentWorkspace && $workspaces->count() > 0) {
                $currentWorkspace = $workspaces->first();
                session(['current_workspace_id' => $currentWorkspace->id]);
            }

            $unreadNotificationsCount = $user->appNotifications()->whereNull('read_at')->count();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_path' => $user->avatar_path,
                    'main_currency' => $user->main_currency,
                    'locale' => $user->locale,
                    'timezone' => $user->timezone,
                    'theme' => $user->theme,
                    'is_admin' => $user->is_admin,
                    'two_factor_enabled' => (bool)$user->two_factor_enabled,
                ] : null,
                'current_workspace' => $currentWorkspace,
                'workspaces' => $workspaces,
                'unread_notifications_count' => $unreadNotificationsCount,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ]);
    }
}
