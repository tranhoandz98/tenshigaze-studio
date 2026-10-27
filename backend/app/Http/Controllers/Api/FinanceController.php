<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingAssignment;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PayrollItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinancialTransaction::with('branch')->orderByDesc('transaction_date');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $transactions = $query->get();

        $totalIncome = (float) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (float) $transactions->where('type', 'expense')->sum('amount');

        $bookings = Booking::with(['customer', 'payments'])->where('status', '!=', 'cancelled')->get();
        $totalReceivable = (float) $bookings->sum('remaining_amount');

        $payrollPending = (float) PayrollItem::with('user')->whereIn('status', ['pending', 'approved'])->sum('net_total');

        return response()->json([
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_profit' => $totalIncome - $totalExpense,
                'total_receivable' => $totalReceivable,
                'pending_crew_payroll' => $payrollPending,
            ],
            'customer_receivables' => $bookings->map(fn ($b) => [
                'id' => $b->id,
                'code' => $b->code,
                'title' => $b->title,
                'customer_name' => $b->customer?->name,
                'total_amount' => $b->total_amount,
                'paid_amount' => $b->paid_amount,
                'remaining_amount' => $b->remaining_amount,
                'status' => $b->status,
            ])->values(),
            'crew_payables' => PayrollItem::with(['user', 'period'])->orderByDesc('id')->get(),
            'transactions' => $transactions,
            'report_types' => [
                ['key' => 'dashboard', 'name' => '1. Báo cáo Tổng quan (Dashboard)', 'description' => 'Doanh thu, công nợ, số lượng lịch chụp & lợi nhuận'],
                ['key' => 'bookings', 'name' => '2. Báo cáo Lịch hẹn (Bookings)', 'description' => 'Danh sách lịch chụp, trạng thái 8 bước, tiền cọc & còn phải thu'],
                ['key' => 'finance', 'name' => '3. Báo cáo Tài chính (Thu / Chi)', 'description' => 'Sổ thu từ khách, chi trả lương ê-kíp và chi phí vận hành'],
                ['key' => 'customers', 'name' => '4. Báo cáo Khách hàng (Customers)', 'description' => 'Danh bạ khách hàng, lịch sử đặt lịch và công nợ'],
                ['key' => 'staff', 'name' => '5. Báo cáo Nhân viên (Staff)', 'description' => 'Danh sách nhân sự, vai trò, mức khoán và hoa hồng'],
                ['key' => 'schedule', 'name' => '6. Báo cáo Lịch làm việc (Work Schedule)', 'description' => 'Chi tiết phân công ca chụp, thời gian, địa điểm & tiền công'],
                ['key' => 'payroll', 'name' => '7. Báo cáo Chi trả lương (Payroll)', 'description' => 'Tổng hợp lương cứng, lương khoán, thưởng/phạt và trạng thái chi trả'],
            ],
        ]);
    }

    public function storeTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|integer',
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:64',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:bank_transfer,cash',
            'transaction_date' => 'nullable|date',
            'title' => 'required|string|max:190',
            'description' => 'nullable|string',
        ]);

        $tx = FinancialTransaction::create(array_merge($validated, [
            'branch_id' => $validated['branch_id'] ?? 1,
            'transaction_date' => $validated['transaction_date'] ?? now(),
            'reference_type' => 'manual',
        ]));

        return response()->json(['transaction' => $tx], 201);
    }

    public function destroyTransaction(int $id): JsonResponse
    {
        FinancialTransaction::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa khoản thu/chi.']);
    }

    /**
     * Xuất 7 loại báo cáo của studio ra CSV UTF-8 BOM (mở trực tiếp bằng Excel / Google Sheets).
     */
    public function exportReport(string $type): StreamedResponse
    {
        $filename = sprintf('tenshigaze-%s-%s.csv', $type, now()->format('Ymd-His'));

        return response()->streamDownload(function () use ($type) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Vietnamese characters in Excel & Google Sheets
            fwrite($handle, "\xEF\xBB\xBF");

            match ($type) {
                'bookings' => $this->writeBookingsReport($handle),
                'finance' => $this->writeFinanceReport($handle),
                'customers' => $this->writeCustomersReport($handle),
                'staff' => $this->writeStaffReport($handle),
                'schedule' => $this->writeScheduleReport($handle),
                'payroll' => $this->writePayrollReport($handle),
                default => $this->writeDashboardReport($handle),
            };

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function writeDashboardReport($handle): void
    {
        fputcsv($handle, ['BÁO CÁO TỔNG QUAN TENSHIGAZE STUDIO', 'Ngày xuất: ' . now()->format('d/m/Y H:i')]);
        fputcsv($handle, []);
        fputcsv($handle, ['Chỉ số', 'Giá trị (VNĐ / Số lượng)']);
        fputcsv($handle, ['Tổng số lịch hẹn', Booking::count()]);
        fputcsv($handle, ['Tổng giá trị hợp đồng', Booking::sum('total_amount')]);
        fputcsv($handle, ['Tổng đã thu từ khách', Booking::sum('paid_amount')]);
        fputcsv($handle, ['Tổng còn phải thu (Công nợ)', Booking::sum('remaining_amount')]);
        fputcsv($handle, ['Tổng chi lương ê-kíp đã trả', PayrollItem::where('status', 'paid')->sum('net_total')]);
        fputcsv($handle, ['Tổng lương ê-kíp chờ chi trả', PayrollItem::where('status', '!=', 'paid')->sum('net_total')]);
    }

    private function writeBookingsReport($handle): void
    {
        fputcsv($handle, ['Mã Booking', 'Tên Lịch Hẹn', 'Khách Hàng', 'SĐT', 'Trạng Thái', 'Tổng Tiền (₫)', 'Đã Thu/Cọc (₫)', 'Còn Phải Thu (₫)']);
        foreach (Booking::with('customer')->orderByDesc('id')->get() as $b) {
            $statusLabel = Booking::STATUS_STEPS[$b->status]['label'] ?? $b->status;
            fputcsv($handle, [
                $b->code,
                $b->title,
                $b->customer?->name,
                $b->customer?->phone,
                $statusLabel,
                $b->total_amount,
                $b->paid_amount,
                $b->remaining_amount,
            ]);
        }
    }

    private function writeFinanceReport($handle): void
    {
        fputcsv($handle, ['Ngày Giao Dịch', 'Loại', 'Danh Mục', 'Tiêu Đề', 'Phương Thức', 'Số Tiền (₫)', 'Ghi Chú']);
        foreach (FinancialTransaction::orderByDesc('transaction_date')->get() as $tx) {
            fputcsv($handle, [
                $tx->transaction_date?->format('d/m/Y H:i'),
                $tx->type === 'income' ? 'Thu' : 'Chi',
                $tx->category,
                $tx->title,
                $tx->payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt',
                $tx->amount,
                $tx->description,
            ]);
        }
    }

    private function writeCustomersReport($handle): void
    {
        fputcsv($handle, ['ID', 'Tên Khách Hàng', 'Số Điện Thoại', 'Email', 'Địa Chỉ', 'Số Lịch Hẹn', 'Tổng Chi Tiêu (₫)', 'Còn Nợ (₫)']);
        foreach (Customer::with('bookings')->get() as $c) {
            fputcsv($handle, [
                $c->id,
                $c->name,
                $c->phone,
                $c->email,
                $c->address,
                $c->bookings->count(),
                $c->bookings->sum('total_amount'),
                $c->bookings->sum('remaining_amount'),
            ]);
        }
    }

    private function writeStaffReport($handle): void
    {
        fputcsv($handle, ['ID', 'Họ Tên', 'Vai Trò', 'Loại Hình', 'Email', 'SĐT', 'Lương Cứng (₫)', 'Mức Khoán/Ca (₫)', '% Hoa Hồng']);
        foreach (User::all() as $u) {
            fputcsv($handle, [
                $u->id,
                $u->name,
                $u->role,
                $u->is_freelancer ? 'Freelancer' : 'Nhân viên chính thức',
                $u->email,
                $u->phone,
                $u->base_salary,
                $u->default_task_rate,
                $u->commission_rate . '%',
            ]);
        }
    }

    private function writeScheduleReport($handle): void
    {
        fputcsv($handle, ['Ngày Chụp', 'Khung Giờ', 'Lịch Hẹn', 'Buổi Chụp', 'Địa Điểm', 'Nhân Sự Phụ Trách', 'Vai Trò', 'Tiền Khoán (₫)']);
        foreach (BookingAssignment::with(['session.booking', 'user'])->get() as $a) {
            fputcsv($handle, [
                $a->session?->shoot_date?->format('d/m/Y'),
                ($a->session?->start_time ?? '') . ' - ' . ($a->session?->end_time ?? ''),
                $a->session?->booking?->title,
                $a->session?->title,
                $a->session?->location,
                $a->user?->name,
                $a->role,
                $a->task_fee,
            ]);
        }
    }

    private function writePayrollReport($handle): void
    {
        fputcsv($handle, ['Kỳ Lương', 'Nhân Sự', 'Vai Trò', 'Lương Cứng (₫)', 'Lương Khoán (₫)', 'Hoa Hồng (₫)', 'Thưởng/ĐC (₫)', 'Thực Nhận (₫)', 'Trạng Thái']);
        foreach (PayrollItem::with(['period', 'user'])->get() as $item) {
            fputcsv($handle, [
                sprintf('%02d/%d', $item->period?->month ?? 11, $item->period?->year ?? 2026),
                $item->user?->name,
                $item->user?->role,
                $item->base_salary,
                $item->task_wage_total,
                $item->commission_total,
                $item->bonus_adjustment,
                $item->net_total,
                $item->status === 'paid' ? 'Đã chi trả' : 'Chờ chi trả',
            ]);
        }
    }
}
