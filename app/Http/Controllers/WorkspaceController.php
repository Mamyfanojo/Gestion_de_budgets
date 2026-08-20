<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load(['workspaces', 'ownedWorkspaces']);

        $workspaces = $user->workspaces->merge($user->ownedWorkspaces)->unique('id')->values();

        foreach ($workspaces as $ws) {
            $ws->load(['members', 'owner']);
        }

        return Inertia::render('Workspaces/Index', [
            'workspaces' => $workspaces,
            'current_workspace_id' => session('current_workspace_id'),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:personal,shared'],
        ]);

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'owner_id' => $user->id,
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        session(['current_workspace_id' => $workspace->id]);

        return back()->with('success', 'Espace de travail créé avec succès !');
    }

    public function switchWorkspace(Request $request, $id)
    {
        $user = $request->user();
        $userWorkspaces = $user->workspaces->merge($user->ownedWorkspaces)->pluck('id')->toArray();

        if (in_array($id, $userWorkspaces)) {
            session(['current_workspace_id' => (int)$id]);
            return back()->with('success', 'Espace de travail actif modifié.');
        }

        return back()->with('error', 'Accès non autorisé à cet espace.');
    }

    public function inviteMember(Request $request, $id)
    {
        $workspace = Workspace::findOrFail($id);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', 'in:admin,member,viewer'],
        ]);

        $invitee = User::where('email', $validated['email'])->first();

        WorkspaceMember::firstOrCreate([
            'workspace_id' => $workspace->id,
            'user_id' => $invitee->id,
        ], [
            'role' => $validated['role'],
        ]);

        return back()->with('success', "Invitation envoyée à {$invitee->email}.");
    }
}
