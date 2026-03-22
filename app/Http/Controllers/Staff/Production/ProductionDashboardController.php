<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use App\Models\ProductionRun;
use App\Models\ProductionMaterialIssue;
use App\Models\ProductionOutputPosting;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductionDashboardController extends Controller
{
    public function index()
    {
        // ── KPI Cards ──────────────────────────────────────────────────
        $activeOrders   = ProductionOrder::where('status', 'in_progress')->count();
        $plannedOrders  = ProductionOrder::where('status', 'planned')->count();
        $completedToday = ProductionOrder::where('status', 'completed')
            ->whereDate('updated_at', today())->count();

        // Output posted today (sum of quantities)
        $outputToday = ProductionOutputPosting::whereDate('posting_date', today())
            ->sum('quantity');

        // Materials issued today
        $materialsToday = ProductionMaterialIssue::whereDate('issue_date', today())
            ->sum('quantity');

        // Total output & planned across all completed+in_progress orders
        $totalPlanned  = ProductionOrder::whereIn('status', ['in_progress', 'completed'])->count();
        $totalOutput   = ProductionOutputPosting::sum('quantity');
        $totalMaterial = ProductionMaterialIssue::sum('quantity');
        $avgYield      = $totalMaterial > 0
            ? round(($totalOutput / $totalMaterial) * 100, 1)
            : 0;

        // ── Donut: Order status distribution ───────────────────────────
        $statusCounts = ProductionOrder::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $statusColors = [
            'planned'     => '#a78bfa',
            'in_progress' => '#7c3aed',
            'completed'   => '#10b981',
            'cancelled'   => '#f43f5e',
        ];

        $statusData = collect($statusColors)->map(fn($color, $key) => [
            'label' => ucfirst(str_replace('_', ' ', $key)),
            'value' => $statusCounts[$key] ?? 0,
            'color' => $color,
        ])->values();

        // ── Line chart: last 7 days of issues vs output ─────────────────
        $weeklyIssued = ProductionMaterialIssue::select(
                DB::raw('DATE(issue_date) as day'),
                DB::raw('SUM(quantity) as total')
            )
            ->where('issue_date', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('day')
            ->pluck('total', 'day');

        $weeklyOutput = ProductionOutputPosting::select(
                DB::raw('DATE(posting_date) as day'),
                DB::raw('SUM(quantity) as total')
            )
            ->where('posting_date', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('day')
            ->pluck('total', 'day');

        $weeklyData = collect(range(6, 0))->map(function ($daysAgo) use ($weeklyIssued, $weeklyOutput) {
            $date = now()->subDays($daysAgo)->toDateString();
            return [
                'day'    => now()->subDays($daysAgo)->format('D'),
                'issued' => (float) ($weeklyIssued[$date] ?? 0),
                'output' => (float) ($weeklyOutput[$date] ?? 0),
            ];
        })->values();

        // ── In-progress orders table ────────────────────────────────────
        $inProgressOrders = ProductionOrder::with(['items.product'])
            ->where('status', 'in_progress')
            ->latest('order_date')
            ->take(10)
            ->get()
            ->map(function ($order) {
                $totalPlanned  = $order->items->sum('quantity');
                // sum of output postings for this order's runs
                $totalProduced = ProductionOutputPosting::whereHas('run.orderItem', function ($q) use ($order) {
                    $q->where('production_order_id', $order->id);
                })->sum('quantity');

                return [
                    'id'        => $order->order_number,
                    'product'   => $order->items->first()?->product?->name ?? '—',
                    'planned'   => round($totalPlanned, 2),
                    'produced'  => round($totalProduced, 2),
                    'startDate' => $order->order_date,
                    'status'    => ucfirst(str_replace('_', ' ', $order->status)),
                ];
            });

        // ── Yield & Waste table (from production runs + output) ─────────
        $yieldData = ProductionOrder::with(['items.product'])
            ->whereIn('status', ['in_progress', 'completed'])
            ->latest('order_date')
            ->take(8)
            ->get()
            ->map(function ($order) {
                $planned  = $order->items->sum('quantity');
                $actual   = ProductionOutputPosting::whereHas('run.orderItem', function ($q) use ($order) {
                    $q->where('production_order_id', $order->id);
                })->sum('quantity');
                $issued   = ProductionMaterialIssue::whereHas('run.orderItem', function ($q) use ($order) {
                    $q->where('production_order_id', $order->id);
                })->sum('quantity');
                $waste    = max(0, $issued - $actual);

                return [
                    'id'      => $order->order_number,
                    'product' => $order->items->first()?->product?->name ?? '—',
                    'planned' => round($planned, 2),
                    'actual'  => round($actual, 2),
                    'waste'   => round($waste, 2),
                ];
            });

        // ── Recent activity (last 8 run events) ─────────────────────────
        $recentRuns = ProductionRun::with(['orderItem.productionOrder', 'orderItem.product'])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($run) {
                $icon   = match ($run->status) {
                    'completed'   => '✅',
                    'in_progress' => '🏭',
                    default       => '📋',
                };
                $order  = $run->orderItem?->productionOrder?->order_number ?? '?';
                $prod   = $run->orderItem?->product?->name ?? '?';
                return [
                    'id'     => $run->run_number,
                    'icon'   => $icon,
                    'text'   => "Run #{$run->run_number} — " . ucfirst(str_replace('_', ' ', $run->status)),
                    'detail' => "Order: {$order} · Product: {$prod}",
                    'time'   => $run->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Staff/Production/Dashboard', [
            'stats' => [
                'active_orders'   => $activeOrders,
                'pending_approval' => $plannedOrders,
                'output_today'    => number_format($outputToday, 1),
                'materials_today' => number_format($materialsToday, 1),
                'avg_yield'       => $avgYield . '%',
                'waste_rate'      => $totalMaterial > 0
                    ? round((max(0, $totalMaterial - $totalOutput) / $totalMaterial) * 100, 1) . '%'
                    : '0%',
            ],
            'statusData'  => $statusData,
            'weeklyData'  => $weeklyData,
            'orders'      => $inProgressOrders,
            'yieldData'   => $yieldData,
            'recentRuns'  => $recentRuns,
        ]);
    }
}
