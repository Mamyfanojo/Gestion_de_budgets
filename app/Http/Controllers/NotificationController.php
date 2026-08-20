<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = AppNotification::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead($id)
    {
        $notification = AppNotification::findOrFail($id);
        $notification->update(['read_at' => now()]);

        return back()->with('success', 'Notification marquée comme lue.');
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        AppNotification::where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return back()->with('success', 'Toutes les notifications ont été marquées comme lues.');
    }
}
