<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\Booking;
use App\Models\BookingSession;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PayrollItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');

        $bookingQuery = Booking::with(['customer', 'branch', 'sessions.assignments.user', 'items', 'payments', 'album.selectionLists']);
        if ($branchId) {
            $bookingQuery->where('branch_id', $branchId);
        }

        $bookings = $bookingQuery->orderByDesc('id')->get();

        $totalContractValue = (float) $bookings->where('status', '!=', 'cancelled')->sum('total_amount');
        $totalCollected = (float) $bookings->where('status', '!=', 'cancelled')->sum('paid_amount');
        $totalReceivable = (float) $bookings->where('status', '!=', 'cancelled')->sum('remaining_amount');

        $pendingPayroll = (float) PayrollItem::whereIn('status', ['pending', 'approved'])->sum('net_total');
        $paidPayroll = (float) PayrollItem::where('status', 'paid')->sum('net_total');

        $upcomingSessions = BookingSession::with(['booking.customer', 'assignments.user'])
            ->orderBy('shoot_date')
            ->orderBy('start_time')
            ->limit(8)
            ->get();

        $activeAlbums = Album::with(['booking.customer', 'selectionLists'])
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get();

        $recentTransactions = FinancialTransaction::with('branch')
            ->orderByDesc('transaction_date')
            ->limit(8)
            ->get();

        $statusCounts = [];
        foreach (Booking::STATUS_STEPS as $key => $meta) {
            $statusCounts[] = [
                'status' => $key,
                'step' => $meta['step'],
                'label' => $meta['label'],
                'count' => $bookings->where('status', $key)->count(),
            ];
        }

        return response()->json([
            'kpis' => [
                'total_bookings' => $bookings->count(),
                'total_contract_value' => $totalContractValue,
                'total_collected' => $totalCollected,
                'total_receivable' => $totalReceivable,
                'pending_payroll' => $pendingPayroll,
                'paid_payroll' => $paidPayroll,
                'total_customers' => Customer::count(),
                'total_staff' => User::where('is_active', true)->count(),
                'total_albums' => Album::count(),
            ],
            'status_counts' => $statusCounts,
            'featured_booking' => $bookings->firstWhere('code', 'BK-202611-001') ?? $bookings->first(),
            'upcoming_sessions' => $upcomingSessions,
            'active_albums' => $activeAlbums,
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
