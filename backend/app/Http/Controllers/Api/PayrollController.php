<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingAssignment;
use App\Models\FinancialTransaction;
use App\Models\PayrollItem;
use App\Models\PayrollPeriod;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $month = (int) $request->query('month', 11);
        $year = (int) $request->query('year', 2026);
        $branchId = (int) $request->query('branch_id', 1);

        $period = PayrollPeriod::with(['branch', 'items.user.branch'])
            ->where('branch_id', $branchId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if (!$period) {
            $period = $this->buildOrRefreshPeriod($branchId, $month, $year);
        }

        return response()->json([
            'period' => $period->load(['branch', 'items.user.branch']),
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|integer',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2035',
        ]);

        $period = $this->buildOrRefreshPeriod(
            (int) ($validated['branch_id'] ?? 1),
            (int) $validated['month'],
            (int) $validated['year']
        );

        return response()->json([
            'period' => $period->load(['branch', 'items.user.branch']),
        ]);
    }

    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $item = PayrollItem::with('period')->findOrFail($itemId);
        $validated = $request->validate([
            'bonus_adjustment' => 'required|numeric',
            'adjustment_note' => 'nullable|string|max:190',
        ]);

        $bonus = (float) $validated['bonus_adjustment'];
        $net = max(0, $item->base_salary + $item->task_wage_total + $item->commission_total + $bonus);

        $item->update([
            'bonus_adjustment' => $bonus,
            'adjustment_note' => $validated['adjustment_note'] ?? $item->adjustment_note,
            'net_total' => $net,
        ]);

        $item->period?->recalculateTotals();

        return response()->json([
            'period' => $item->period?->fresh(['branch', 'items.user.branch']),
        ]);
    }

    public function payItem(Request $request, int $itemId): JsonResponse
    {
        $item = PayrollItem::with(['period', 'user'])->findOrFail($itemId);

        if ($item->status !== 'paid') {
            DB::transaction(function () use ($item, $request) {
                $method = $request->input('payment_method', 'bank_transfer');
                $now = now();

                $item->update([
                    'status' => 'paid',
                    'paid_at' => $now,
                    'payment_method' => $method,
                ]);

                FinancialTransaction::create([
                    'branch_id' => $item->period?->branch_id ?? 1,
                    'type' => 'expense',
                    'category' => 'staff_payroll',
                    'amount' => $item->net_total,
                    'payment_method' => $method,
                    'transaction_date' => $now,
                    'reference_type' => 'payroll_item',
                    'reference_id' => $item->id,
                    'title' => sprintf(
                        'Chi lương tháng %02d/%d · %s (%s)',
                        $item->period?->month ?? 11,
                        $item->period?->year ?? 2026,
                        $item->user?->name ?? 'Nhân sự',
                        ucfirst($item->user?->role ?? 'staff')
                    ),
                    'description' => sprintf(
                        'Khoán: %s ₫ | Lương cứng: %s ₫ | Hoa hồng: %s ₫ | Thưởng/ĐC: %s ₫',
                        number_format($item->task_wage_total, 0, ',', '.'),
                        number_format($item->base_salary, 0, ',', '.'),
                        number_format($item->commission_total, 0, ',', '.'),
                        number_format($item->bonus_adjustment, 0, ',', '.')
                    ),
                ]);

                $item->period?->recalculateTotals();
            });
        }

        return response()->json([
            'period' => $item->period?->fresh(['branch', 'items.user.branch']),
        ]);
    }

    private function buildOrRefreshPeriod(int $branchId, int $month, int $year): PayrollPeriod
    {
        $period = PayrollPeriod::firstOrCreate(
            ['branch_id' => $branchId, 'month' => $month, 'year' => $year],
            ['status' => 'approved', 'total_amount' => 0, 'paid_amount' => 0]
        );

        $staffList = User::where('is_active', true)
            ->where('role', '!=', 'owner')
            ->get();

        foreach ($staffList as $staff) {
            $existingItem = PayrollItem::where('payroll_period_id', $period->id)
                ->where('user_id', $staff->id)
                ->first();

            if ($existingItem && $existingItem->status === 'paid') {
                continue;
            }

            // Sum task fees in that month
            $assignments = BookingAssignment::with(['session.booking'])
                ->where('user_id', $staff->id)
                ->whereHas('session', function ($q) use ($month, $year) {
                    $q->whereMonth('shoot_date', $month)->whereYear('shoot_date', $year);
                })
                ->get();

            $taskWage = (float) $assignments->sum('task_fee');
            $breakdown = $assignments->map(fn ($a) => [
                'booking_code' => $a->session?->booking?->code ?? 'BK',
                'title' => ($a->session?->booking?->title ?? '') . ' · ' . ($a->session?->title ?? ''),
                'date' => $a->session?->shoot_date?->format('Y-m-d'),
                'fee' => (float) $a->task_fee,
            ])->values()->toArray();

            $commission = 0;
            if ($staff->commission_rate > 0) {
                $salesTotal = (float) Booking::where('sale_user_id', $staff->id)
                    ->where('status', '!=', 'cancelled')
                    ->sum('total_amount');
                $commission = round($salesTotal * ($staff->commission_rate / 100));
            }

            $base = (float) $staff->base_salary;
            $bonus = (float) ($existingItem?->bonus_adjustment ?? 0);
            $net = $base + $taskWage + $commission + $bonus;

            if ($net <= 0 && !$existingItem) {
                continue;
            }

            PayrollItem::updateOrCreate(
                [
                    'payroll_period_id' => $period->id,
                    'user_id' => $staff->id,
                ],
                [
                    'base_salary' => $base,
                    'task_wage_total' => $taskWage,
                    'commission_total' => $commission,
                    'bonus_adjustment' => $bonus,
                    'net_total' => $net,
                    'task_breakdown' => $breakdown,
                    'status' => $existingItem?->status ?? 'approved',
                ]
            );
        }

        $period->recalculateTotals();
        return $period;
    }
}
