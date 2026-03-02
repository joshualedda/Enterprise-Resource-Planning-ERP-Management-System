<?php
namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Notification;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user          = $request->user();
        $notifications = [];

        if ($user) {
            $notifications = Notification::where('user_id', $user->id)
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($n) use ($user) {
                    return [
                        'id'         => $n->id,
                        'icon'       => $n->icon ?? '🔔',
                        'title'      => $n->title,
                        'body'       => $n->body,
                        'type'       => $n->type,       // ✅ needed for receipt_rejected modal
                        'created_at' => $n->created_at,
                        'unread'     => (bool) $n->unread,
                        'url'        => $n->url ?? (($user->role_id === 1)
                            ? route('admin.orders.index')
                            : route('customer.orders.index')),
                    ];
                });
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user'          => $user,
                'notifications' => $notifications,
            ],
            // ✅ flash messages — needed for toast alerts across all pages
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }
}