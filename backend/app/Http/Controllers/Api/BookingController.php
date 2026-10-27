<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingAssignment;
use App\Models\BookingItem;
use App\Models\BookingPayment;
use App\Models\BookingSession;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Services\ConflictDetectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(
        private readonly ConflictDetectionService $conflictService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Booking::with([
            'branch',
            'customer',
            'saleUser',
            'sessions.assignments.user',
            'items',
            'payments.recorder',
            'album.selectionLists',
        ]);

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%"));
            });
        }

        return response()->json([
            'bookings' => $query->orderByDesc('id')->get(),
            'status_steps' => Booking::STATUS_STEPS,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $booking = Booking::with([
            'branch',
            'customer',
            'saleUser',
            'sessions.assignments.user',
            'items',
            'payments.recorder',
            'album.selectionLists',
        ])->findOrFail($id);

        return response()->json(['booking' => $booking]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|integer',
            'customer_id' => 'nullable|integer',
            'customer_name' => 'nullable|string|max:190',
            'customer_phone' => 'nullable|string|max:32',
            'sale_user_id' => 'nullable|integer',
            'title' => 'required|string|max:190',
            'status' => 'nullable|string|max:32',
            'notes' => 'nullable|string',
            'session' => 'nullable|array',
            'items' => 'nullable|array',
            'deposit_amount' => 'nullable|numeric|min:0',
            'deposit_method' => 'nullable|string|max:32',
        ]);

        $booking = DB::transaction(function () use ($validated) {
            $customerId = $validated['customer_id'] ?? null;
            if (!$customerId && !empty($validated['customer_name'])) {
                $customer = Customer::create([
                    'branch_id' => $validated['branch_id'] ?? 1,
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone'] ?? null,
                ]);
                $customerId = $customer->id;
            }

            $nextNumber = Booking::count() + 1;
            $code = sprintf('BK-%s-%03d', now()->format('Ym'), $nextNumber);

            $booking = Booking::create([
                'code' => $code,
                'branch_id' => $validated['branch_id'] ?? 1,
                'customer_id' => $customerId,
                'sale_user_id' => $validated['sale_user_id'] ?? null,
                'title' => $validated['title'],
                'status' => $validated['status'] ?? 'confirmed',
                'google_calendar_synced' => true,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['items']) && is_array($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $qty = max(1, (int) ($item['quantity'] ?? 1));
                    $price = (float) ($item['unit_price'] ?? 0);
                    BookingItem::create([
                        'booking_id' => $booking->id,
                        'service_catalog_id' => $item['service_catalog_id'] ?? null,
                        'name' => $item['name'],
                        'item_type' => $item['item_type'] ?? 'package',
                        'quantity' => $qty,
                        'unit_price' => $price,
                        'total_price' => $qty * $price,
                    ]);
                }
            }

            if (!empty($validated['session'])) {
                $s = $validated['session'];
                $session = BookingSession::create([
                    'booking_id' => $booking->id,
                    'title' => $s['title'] ?? 'Buổi chụp chính',
                    'shoot_date' => $s['shoot_date'] ?? now()->format('Y-m-d'),
                    'start_time' => $s['start_time'] ?? '08:00',
                    'end_time' => $s['end_time'] ?? '11:30',
                    'location' => $s['location'] ?? null,
                    'google_event_id' => 'gcal_' . uniqid(),
                    'notes' => $s['notes'] ?? null,
                ]);

                if (!empty($s['assignments']) && is_array($s['assignments'])) {
                    foreach ($s['assignments'] as $asg) {
                        BookingAssignment::create([
                            'booking_session_id' => $session->id,
                            'user_id' => $asg['user_id'],
                            'role' => $asg['role'] ?? 'photographer',
                            'task_fee' => (float) ($asg['task_fee'] ?? 0),
                            'calendar_synced' => true,
                        ]);
                    }
                }
            }

            if (!empty($validated['deposit_amount']) && (float) $validated['deposit_amount'] > 0) {
                $payment = BookingPayment::create([
                    'booking_id' => $booking->id,
                    'payment_type' => 'deposit',
                    'method' => $validated['deposit_method'] ?? 'bank_transfer',
                    'amount' => (float) $validated['deposit_amount'],
                    'paid_at' => now(),
                    'note' => 'Đặt cọc khi tạo lịch hẹn',
                ]);

                FinancialTransaction::create([
                    'branch_id' => $booking->branch_id,
                    'type' => 'income',
                    'category' => 'customer_payment',
                    'amount' => $payment->amount,
                    'payment_method' => $payment->method,
                    'transaction_date' => $payment->paid_at,
                    'reference_type' => 'booking_payment',
                    'reference_id' => $payment->id,
                    'title' => 'Tiền cọc · ' . $booking->title,
                    'description' => 'Đặt cọc khi tạo lịch hẹn',
                ]);
            }

            $booking->recalculateFinancials();
            return $booking;
        });

        return $this->show($booking->id);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|string|max:190',
            'branch_id' => 'nullable|integer',
            'customer_id' => 'nullable|integer',
            'sale_user_id' => 'nullable|integer',
            'status' => 'sometimes|string|max:32',
            'notes' => 'nullable|string',
        ]);

        $booking->update($validated);
        return $this->show($booking->id);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|max:32',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['status' => $request->status]);

        return $this->show($booking->id);
    }

    public function destroy(int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json(['message' => 'Đã xóa lịch hẹn.']);
    }

    public function addItem(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $validated = $request->validate([
            'service_catalog_id' => 'nullable|integer',
            'name' => 'required|string|max:190',
            'item_type' => 'required|in:package,surcharge',
            'quantity' => 'nullable|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $qty = (int) ($validated['quantity'] ?? 1);
        $unitPrice = (float) $validated['unit_price'];

        BookingItem::create([
            'booking_id' => $booking->id,
            'service_catalog_id' => $validated['service_catalog_id'] ?? null,
            'name' => $validated['name'],
            'item_type' => $validated['item_type'],
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'total_price' => $qty * $unitPrice,
        ]);

        $booking->recalculateFinancials();
        return $this->show($booking->id);
    }

    public function removeItem(int $id, int $itemId): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        BookingItem::where('booking_id', $booking->id)->where('id', $itemId)->delete();
        $booking->recalculateFinancials();

        return $this->show($booking->id);
    }

    public function addPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $validated = $request->validate([
            'payment_type' => 'required|in:deposit,installment,settlement',
            'method' => 'required|in:bank_transfer,cash',
            'amount' => 'required|numeric|min:1',
            'paid_at' => 'nullable|date',
            'note' => 'nullable|string|max:190',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $paidAt = !empty($validated['paid_at']) ? $validated['paid_at'] : now();
            $payment = BookingPayment::create([
                'booking_id' => $booking->id,
                'payment_type' => $validated['payment_type'],
                'method' => $validated['method'],
                'amount' => (float) $validated['amount'],
                'paid_at' => $paidAt,
                'note' => $validated['note'] ?? null,
            ]);

            $typeLabel = match ($validated['payment_type']) {
                'deposit' => 'Tiền cọc',
                'settlement' => 'Tất toán',
                default => 'Thanh toán đợt',
            };

            FinancialTransaction::create([
                'branch_id' => $booking->branch_id,
                'type' => 'income',
                'category' => 'customer_payment',
                'amount' => $payment->amount,
                'payment_method' => $payment->method,
                'transaction_date' => $paidAt,
                'reference_type' => 'booking_payment',
                'reference_id' => $payment->id,
                'title' => "{$typeLabel} · {$booking->title}",
                'description' => $payment->note,
            ]);

            $booking->recalculateFinancials();
        });

        return $this->show($booking->id);
    }

    public function removePayment(int $id, int $paymentId): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        DB::transaction(function () use ($booking, $paymentId) {
            BookingPayment::where('booking_id', $booking->id)->where('id', $paymentId)->delete();
            FinancialTransaction::where('reference_type', 'booking_payment')->where('reference_id', $paymentId)->delete();
            $booking->recalculateFinancials();
        });

        return $this->show($booking->id);
    }

    public function addSession(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $validated = $request->validate([
            'title' => 'required|string|max:190',
            'shoot_date' => 'required|date',
            'start_time' => 'required|string|max:8',
            'end_time' => 'required|string|max:8',
            'location' => 'nullable|string|max:190',
            'notes' => 'nullable|string',
        ]);

        BookingSession::create(array_merge($validated, [
            'booking_id' => $booking->id,
            'google_event_id' => 'gcal_' . uniqid(),
        ]));

        return $this->show($booking->id);
    }

    public function updateSession(Request $request, int $id, int $sessionId): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $session = BookingSession::where('booking_id', $booking->id)->findOrFail($sessionId);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:190',
            'shoot_date' => 'sometimes|date',
            'start_time' => 'sometimes|string|max:8',
            'end_time' => 'sometimes|string|max:8',
            'location' => 'nullable|string|max:190',
            'notes' => 'nullable|string',
        ]);

        $session->update($validated);
        // Mark all assigned crew calendars as synced to the new time
        $session->assignments()->update(['calendar_synced' => true]);

        return $this->show($booking->id);
    }

    public function assignCrew(Request $request, int $id, int $sessionId): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $session = BookingSession::where('booking_id', $booking->id)->findOrFail($sessionId);

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'required|string|max:32',
            'task_fee' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:190',
        ]);

        BookingAssignment::updateOrCreate(
            [
                'booking_session_id' => $session->id,
                'user_id' => $validated['user_id'],
            ],
            [
                'role' => $validated['role'],
                'task_fee' => (float) $validated['task_fee'],
                'calendar_synced' => true,
                'note' => $validated['note'] ?? null,
            ]
        );

        return $this->show($booking->id);
    }

    public function removeAssignment(int $id, int $sessionId, int $assignmentId): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        BookingAssignment::where('booking_session_id', $sessionId)->where('id', $assignmentId)->delete();

        return $this->show($booking->id);
    }

    public function checkConflicts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shoot_date' => 'required|date',
            'start_time' => 'required|string|max:8',
            'end_time' => 'required|string|max:8',
            'exclude_session_id' => 'nullable|integer',
        ]);

        $availability = $this->conflictService->checkCrewAvailability(
            $validated['shoot_date'],
            $validated['start_time'],
            $validated['end_time'],
            $validated['exclude_session_id'] ?? null
        );

        return response()->json(['availability' => $availability]);
    }
}
