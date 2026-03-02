<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function markAllRead()
    {
        \App\Models\Notification::where('user_id', Auth::id())
            ->update(['unread' => false]);

        // Return JSON if axios/ajax, redirect if Inertia
        if (request()->wantsJson() || request()->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json(['success' => true]);
        }

        return redirect()->back();
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['unread' => false]);

        // Return JSON if axios/ajax — let frontend handle the redirect
        if (request()->wantsJson() || request()->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json(['success' => true]);
        }

        if (!empty($notification->url) && is_string($notification->url)) {
            return redirect()->to($notification->url);
        }

        return back();
    }
}